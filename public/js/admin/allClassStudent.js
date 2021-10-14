$(document).ready(function() {
    //lấy lộ trình học và so sánh vs tiến độ cá nhân
    routeType();
    //lấy điểm của các môn học trong các tiến độ
    getClass();

});

$(window).on('click', function(e) {
    if ($(e.target).is('.studentListOut')) $('.studentListOut').slideUp(1500);
    if ($(e.target).is('.teacherIn4Out')) $('.teacherIn4Out').slideUp(1500);
    if ($(e.target).is('.myAttendOut')) $('.myAttendOut').slideUp(1500);
});

//lấy danh sách lớp
function getClass() {
    $.ajax({
        url: '/admin/getClass',
        method: 'get',
        dataType: 'json',
        data: { studentId: $("#studentID").val() },
        success: function(response) {
            if (response.msg == 'success') {
                var data = response.data
                console.log(data)
                $(".rightSideContent").html(" <div class='tr'><div class='td'>Class name</div><div class='td'>Stage</div><div class='td'>Subject</div><div class='td'>Teacher</div><div class='td'>Grade</div><div class='td'>Comment</div><div class='td'>Start date</div><div class='td'>End date</div class='td'><div class='td'>Student List</div></div>")
                data.forEach((e) => {
                    $(".rightSideContent").append("<div class='tr' id=" + e._id + "><div class='td'>" + e.className + "</div><div class='td'>" + e.stage + "</div><div class='td'>" + e.subject + "</div><div class='td' onclick=viewTeacherProfile('" + e.teacherID._id + "')>" + e.teacherID.username + "</div></div>")
                    var classID = e._id
                    e.studentID.forEach((e) => {
                        if (e.ID == $("#studentID").val()) $("#" + classID).append("<div class='td'>" + e.grade + "</div><div class='td'>" + e.feedBackContent + "</div>")
                    })
                    $("#" + classID).append("<div class='td'>" + e.startDate.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + e.endDate.replace("T00:00:00.000Z", "") + "</div><div class='td'><button onclick=sendData('" + e._id + "')><i class='fas fa-users'></i></button><button onclick=myAttended('" + e._id + "')><i class='fas fa-calendar-alt'></i></button></div>")
                })
            }
        },
        error: function(response) { alert('server error'); }
    });
}


//xem danh sách điểm danh của học sinh
function myAttended(classID) {
    $.ajax({
        url: '/admin/myAttended',
        method: 'get',
        dataType: 'json',
        data: { classID: classID },
        success: function(response) {
            if (response.msg == 'success') {
                var data = response.data
                var studentIndex
                $(".myAttendContent").html("<div class='tr'><div class='td'>Date</div><div class='td'>Note</div><div class='td'>Status</div></div>")
                data[0].schedule.forEach((e, indexBIG) => {
                    $(".myAttendContent").append("<div class='tr'><div class='td' style='text-align:left;'>" + e.date.replace("T00:00:00.000Z", "") + "<br>At:" + e.time + "</div></div>")
                    e.attend.forEach((e, index) => {
                        if (e.studentID._id == $("#studentID").val()) {
                            studentIndex = index
                            $(".myAttendContent .tr:nth-child(" + (indexBIG + 2) + ")").append("<div class='td'>" + e.comment + "</div><div class='td'>" + e.attended + "</div>")
                        }
                    })
                })
                var totalSchedual = data[0].schedule.length
                $(".myAttendContent").append("<h1>Absent rate:  " + (data[0].studentID[studentIndex].absentRate / totalSchedual * 100) + "% </h1>")
                $(".myAttendOut").fadeIn(500)
            }
        },
        error: function(response) { alert('server error'); }
    });
}

//xem 1 số thông tin của giáo viên
function viewTeacherProfile(id) {
    var _id = id
    $(".teacherIn4Body").html("");
    $.ajax({
        url: '/admin/getTeacherProfile',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $(".teacherIn4").html("<div style='text-align:center;'><img style ='max-width:150px;max-height:200px' src='" + data.avatar + "'><p>" + data.username + "</p><p>" + data.email + "</p><p><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + data._id + "'><input type='hidden' name='studentName' value='" + data.username + "'><button>Chat</button></form></p></div>");
                });
                $(".teacherIn4Out").fadeIn(500);
            }
        },
        error: function(response) { alert('server error'); }
    });

}

//lấy thông tin của lộ trình học
function routeType() {
    var routeName = $('#routeTypeS').text().replace("Route: ", "");
    $.ajax({
        url: '/admin/getStage',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName },
        success: function(response) {
            if (response.msg == 'success') {
                $("#routeTuyBien").html("<div class='tr'></div><div class='tr'></div>");
                //hiển thị thông tin 1 lộ trình học lên đầu form tạo lớp sau khi chọn 1 khóa học
                $.each(response.data, function(index, targetxxx) {
                    $.each(targetxxx.routeSchedual, function(indexBIG, routeSchedual) {
                        $("#routeTuyBien .tr:nth-child(1)").append("<div class='td' style='font-size:20px;'>Stage " + (indexBIG + 1) + ": " + routeSchedual.stage + "</div>");
                        $("#routeTuyBien .tr:nth-child(2)").append("<div class='td'></div>");
                        if (routeSchedual.stage == $("#start").text().replace("Start stage: ", "") || routeSchedual.stage == $("#end").text().replace("Aim stage: ", "")) $("#routeTuyBien .tr:nth-child(1) .td:nth-child(" + (indexBIG + 1) + ")").css("background-color", "peru")
                        if (routeSchedual.stage == $("#current").text().replace("Current stage: ", "")) $("#routeTuyBien .tr:nth-child(1) .td:nth-child(" + (indexBIG + 1) + ")").html('Stage ' + (indexBIG + 1) + ': ' + routeSchedual.stage + '</div>' + '<i class="fas fa-map-marker-alt"></i>')
                        $.each(routeSchedual.routeabcd, function(index, routeabcd) {
                            $("#routeTuyBien .tr:nth-child(2) .td:nth-child(" + (indexBIG + 1) + ")").append("<li onclick=highLight(this)>" + routeabcd + "</li>");
                        });
                    });

                });
            }
        },
        error: function(response) { alert('server error'); }
    })
}
//đánh dấu
function highLight(add) {
    var filter = $(add).text().toUpperCase()
    $(".rightSideContent .tr:not(:first-child)").each(function() {
        if ($(this).find('.td').text().toUpperCase().indexOf(filter) > -1) {
            $(this).css("background-color", 'Wheat');
            console.log(filter)
        } else {
            $(this).css("background-color", 'white');
        }
    })
}


//lấy danh sáhc học sinh trong lớp
function sendData(id) {
    var _id = id
    $.ajax({
        url: '/admin/getStudentProgress',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                console.log(response.data)
                $(".studentList").html('<div class="tr"><div class="td">avatar</div><div class="td">username</div><div class="td">email</div><div class="td">Chat</div></div>')
                $.each(response.data, function(index, data) {
                    $.each(data.studentID, function(index, studentID) {
                        $(".studentList").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><input type='hidden' name='studentName' value='" + studentID.ID.username + "'><button>Chat</button></form></div></div>");
                    });
                });
                $(".studentListOut").fadeIn(500);
            }
        },
        error: function(response) { alert('server error'); }
    });
}