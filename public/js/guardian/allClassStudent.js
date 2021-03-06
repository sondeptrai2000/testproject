$(document).ready(function() {
    getClass();
    unReadMess();
});

//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});

$(window).on('click', function(e) {
    if ($(e.target).is('.studentListOut')) $('.studentListOut').slideUp(500);
    if ($(e.target).is('.teacherIn4Out')) $('.teacherIn4Out').slideUp(500);
    if ($(e.target).is('.myAttendOut')) $('.myAttendOut').slideUp(500);
});

//lấy số tin nhắn chưa đọc
function unReadMess() {
    $.ajax({
        url: '/messenger/unreadMess',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                $("#welcome").html("Welcome " + response.username);
                $("#UnreadMessages").html(response.unReadMess)
            }
        },
        error: function(response) { alert('server error') }
    })
};

//tìm kiếm lớp học
$("#myInput").keyup(function() {
    var filter = $("#myInput").val().toUpperCase();
    $("#tableClass .tr:not(:first-child)").each(function() {
        if ($(this).find('.td').text().toUpperCase().indexOf(filter) > -1) {
            $(this).show();
        } else { $(this).hide() };
        if (filter == "") $(this).show();
    })
});


//lấy thông tin các lớp đã và đang học
function getClass() {
    $.ajax({
        url: '/guardian/getClass',
        method: 'get',
        dataType: 'json',
        data: { check: "0" },
        success: function(response) {
            if (response.msg == 'success') {
                console.log(response.classInfor)
                $("#tableClass").html("<div class='tr'><div class='td'>Class name</div><div class='td'>Stage</div><div class='td'>Subject</div><div class='td'>Description</div><div class='td'>Teacher</div><div class='td'>Start at</div><div class='td'>End at</div><div class='td'>Grade</div><div class='td'>Comment</div><div class='td'>Action</div></div>")
                response.classInfor.forEach((e) => {
                    $("#tableClass").append("<div class='tr' id=" + e._id + "><div class='td'>" + e.className + "</div><div class='td'>" + e.stage + "</div><div class='td'>" + e.subject + "</div><div class='td'>" + e.description + "</div><div class='td' onclick=viewTeacherProfile('" + e.teacherID._id + "')>" + e.teacherID.username + "</div><div class='td'>" + e.startDate.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + e.endDate.replace("T00:00:00.000Z", "") + "</div></div>")
                    var classID = e._id
                    e.studentID.forEach((e) => {
                        if (e.ID == response.studentID) $("#" + classID).append("<div class='td'>" + e.grade + "</div><div class='td'>" + e.feedBackContent + "</div>")
                    })
                    $("#" + classID).append("<div class='td'><button onclick=myAttended('" + e._id + "')>My attend</button></div>")
                })
                var getClassID = $("#getClassID").val()
                if (getClassID) {
                    $("#" + getClassID).css("background-color", 'Wheat');
                    setTimeout(function() {
                        $("#" + getClassID).css("background-color", 'white');
                    }, 5000)
                }
            }
        },
        error: function(response) { alert('server error'); }
    });
}

//xem danh sách điểm danh của chính mình
function myAttended(classID) {
    $.ajax({
        url: '/guardian/myAttended',
        method: 'get',
        dataType: 'json',
        data: { classID: classID },
        success: function(response) {
            if (response.msg == 'success') {
                var data = response.data
                var absentSlot = 0
                $(".myAttendContent").html("<div class='tr'><div class='td'>Date</div><div class='td'>Note</div><div class='td'>Status</div></div>")
                data.schedule.forEach((e, indexBIG) => {
                    $(".myAttendContent").append("<div class='tr'><div class='td' style='text-align:left;'>" + e.date.replace("T00:00:00.000Z", "") + "<br>At:" + e.time + "</div></div>")
                    e.attend.forEach((e, index) => {
                        if (e.studentID == response.studentID) {
                            if (e.attended == 'absent') absentSlot++;
                            studentIndex = index
                            $(".myAttendContent .tr:nth-child(" + (indexBIG + 2) + ")").append("<div class='td'>" + e.comment + "</div><div class='td'>" + e.attended + "</div>")
                        }
                    })
                })
                var totalSchedual = data.schedule.length
                $(".myAttendContent").append("<h1>Absent rate: " + (absentSlot / totalSchedual * 100) + "% </h1>")
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
        url: '/guardian/getTeacherProfile',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $(".teacherIn4").html("<img style ='max-width:150px;max-height:200px' src='" + data.avatar + "'><p>" + data.username + "</p><p>" + data.email + "</p><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + data._id + "'><input type='hidden' name='studentName' value='" + data.username + "'><button>Chat</button></form>");
                });
                $(".teacherIn4Out").fadeIn(500);
            }
        },
        error: function(response) { alert('server error'); }
    });
}