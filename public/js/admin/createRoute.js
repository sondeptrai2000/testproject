$(document).ready(function() {
    getAllRoute()
    unReadMess();
});

$(window).on('click', function(e) {
    if ($(e.target).is('.createRouteOut')) $('.createRouteOut').fadeOut(1500);
    if ($(e.target).is('.updateRouteOut')) $('.updateRouteOut').fadeOut(1500);
});

//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});

//lấy số tin nhắn chưa đọc
function unReadMess() {
    $.ajax({
        url: '/messenger/unreadMess',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') $("#UnreadMessages").html(response.unReadMess)
        },
        error: function(response) { alert('server error'); }
    })
}

//lọc tìm kiếm
function filterRoute() {
    var filter = $("#searchRoute").val().toUpperCase()
    $(".tableRoute .tr:not(:first-child)").each(function() {
        if ($(this).find('.td').text().toUpperCase().indexOf(filter) > -1) {
            $(this).show()
        } else { $(this).hide() }
        if (filter == "") $(this).show()
    })
}

function getAllRoute() {
    $.ajax({
        url: '/admin/getAllRoute',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                var data = response.data
                $("#number").html("Total: " + data.length)
                $(".tableRoute").html(" <div class='tr'><div class='td'>Route name</div><div class='td'>Description</div><div class='td'>Action</div></div>")
                data.forEach(function(data) {
                    var add = "<div class='tr' id='" + data._id + "' onclick=viewSchedule('" + data._id + "')><div class='td'>" + data.routeName + "</div><div class='td'>" + data.description + "</div><div class='td'><i class='far fa-edit' onclick=updateRoute('" + data._id + "')></i><i class='far fa-trash-alt' onclick=deleteRoute('" + data._id + "')></i></div></div>"
                    $(".tableRoute").append(add)
                })
                viewSchedule(data[0]._id)
            }
        },
        error: function(response) { alert('server error'); }
    });
}

function addStage(type) {
    if (type == "create") {
        var add = "<div>Stage: <input type='text' name='stageTest'required/><button style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().remove()><i class='fas fa-trash-alt' style='color:crimson;'></i></button><button  style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().appendTo('#addStage') > <i class='fas fa-angle-double-down' style='color:blue;'></i> </button><button  style='margin:4px;font-size:22px' type='button' onclick=addClass($(this).parent(),'create')><i class='fas fa-plus-square' style='color:black;'></i></button></div>"
        $('#addStage').append(add)
    } else {
        var add = "<div>Stage: <input type='text' name='stageTestUpdate'required/><button style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().remove()><i class='fas fa-trash-alt' style='color:crimson;'></i></button><button  style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().appendTo('#addStageUpdate') ><i class='fas fa-angle-double-down' style='color:blue;'></i> </button><button style='margin:4px;font-size:22px'  type='button' onclick=addClass($(this).parent(),'update')><i class='fas fa-plus-square' style='color:black;'></i></button></div>"
        $('#addStageUpdate').append(add)
    }
}

function addClass(test, type) {
    if (type == "create") {
        var add = "<div class='route'>Subject: <input type='text' name='classIn' required/><button style='margin:4px;font-size:22px' type='button' onclick=$(this).parent().remove();><i class='fas fa-trash-alt' style='color:crimson;'></i></button></div>"
        test.append(add)
    } else {
        var add = "<div class='route'>Subject: <input type='text' name='classInUpdate'required/><button  style='margin:4px;font-size:22px' type='button' onclick=$(this).parent().remove();><i class='fas fa-trash-alt' style='color:crimson;'></i></button></div>"
        test.append(add)
    }
}

//xem các lịch trình giảng dạy của 1 lộ trình học
function viewSchedule(id) {
    var _id = id
    $.ajax({
        url: '/admin/viewSchedule',
        method: 'get',
        dataType: 'json',
        data: { _id: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $(".tableRoute .tr:not(:nth-child(1))").css("background-color", 'white');
                $("#" + _id).css("background-color", 'Wheat');
                var data = response.data
                $(".rightSideContent").html("<h1>Route Name: " + data[0].routeName + "</h1>")
                $(".rightSideContent").append("<h2>Description: " + data[0].description + "</h2>")
                data[0].routeSchedual.forEach(function(e, indexBIG) {
                    $(".rightSideContent").append("<h3> Stage " + (indexBIG + 1) + ": " + e.stage + "</h3>")
                    e.routeabcd.forEach(function(e, index) {
                        $(".rightSideContent").append("<li>" + e + "</li>")
                    })
                })
                $(".viewRouteOut").fadeIn(500)
            }
        },
        error: function(response) { alert('server error'); }
    });
}

$("#doCreateRoute").submit(function(event) {
    event.preventDefault();
    var schedule = []
    $("input[name='stageTest']").each(function(index, e) {
        var routeabcd = []
        $(this).parent().find('input[name="classIn"]').each(function(index, e) { routeabcd.push($(e).val()) })
        schedule.push({ stage: $(this).val(), routeabcd: routeabcd })
    })
    var formData = {
        schedule: schedule,
        routeName: $("#routeName").val(),
        description: $("#description").val(),
    };
    $.ajax({
        url: '/admin/docreateRoute',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                alert('Sign Up success');
                getAllRoute();
                $(".createRouteOut").fadeOut(500);
            }
        },
        error: function(response) { alert('server error'); }
    })
})

$("#doUpdateRoute").submit(async function(event) {
    event.preventDefault();
    var schedule = []
    $("input[name='stageTestUpdate']").each(function(index, e) {
        var routeabcd = []
        $(this).parent().find('input[name="classInUpdate"]').each(function(index, e) { routeabcd.push($(e).val()) })
        schedule.push({ stage: $(this).val(), routeabcd: routeabcd })
    })
    var formData = {
        id: $("#routeIDUpdate").val(),
        schedule: schedule,
        routeName: $("#routeNameUpdate").val(),
        description: $("#descriptionUpdate").val(),
    };
    $.ajax({
        url: '/admin/doUpdateRoute',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                viewSchedule($("#routeIDUpdate").val());
                alert('Update success');
            }
        },
        error: function(response) { alert('server error'); }
    })
})

async function updateRoute(id) {
    $("#routeIDUpdate").val(id)
    var _id = id
    $.ajax({
        url: '/admin/viewSchedule',
        method: 'get',
        dataType: 'json',
        data: { _id: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $("#addStageUpdate").html("")
                var data = response.data
                $("#routeNameUpdate").val(data[0].routeName)
                $("#descriptionUpdate").val(data[0].description)
                data[0].routeSchedual.forEach(function(e, indexBIG) {
                    $("#addStageUpdate").append("<div id='updateStage" + indexBIG + "'>Stage: <input type='text' name='stageTestUpdate' value='" + e.stage + "'><button style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().remove() > <i class='fas fa-trash-alt' style='color:crimson;' ></i> </button><button style='margin:4px;font-size:22px' type='button' onclick =$(this).parent().appendTo('#addStageUpdate') > <i class='fas fa-angle-double-down' style='color:blue;'></i> </button><button style='margin:4px;font-size:22px' type='button' onclick=addClass($(this).parent(),'update')><i class='fas fa-plus-square'></i></button></div>")
                    e.routeabcd.forEach(function(e) {
                        $("#updateStage" + indexBIG).append("<div class='route'>Subject: <input type='text' name='classInUpdate' value='" + e + "'><button style='margin:4px;font-size:22px' type='button' onclick=$(this).parent().remove();><i class='fas fa-trash-alt' style='color:crimson;'></i></button></div>")
                    })
                })
                $(".updateRouteOut").fadeIn(500)
            }
        },
        error: function(response) { alert('server error'); }
    });
}

function deleteRoute(id) {
    if (confirm("Are you sure you want to delete this?")) {
        $.ajax({
            url: '/admin/deleteRoute',
            method: 'delete',
            dataType: 'json',
            data: { id: id },
            success: function(response) {
                if (response.msg == 'success') {
                    alert('success');
                    getAllRoute();
                }
                if (response.msg == 'error') alert('error');
            },
            error: function(response) { alert('server error'); }
        })
    }
}