$(document).ready(function() {
    getListRoom();
    unReadMess();
});
//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});

//lấy thông tin phòng học
function tuanoi(room) {
    var roomName = room;
    $('.leftSide h1').html("Room: " + roomName);
    $.ajax({
        url: '/admin/getRoomAndTime',
        method: 'get',
        dataType: 'json',
        success: function(response) {
            if (response.msg == 'success') {
                console.log(response.data)
                $("#time1").html('<div class="td">7:30 to 9:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time2").html('<div class="td">9:45 to 11:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time3").html('<div class="td">13:30 to 15:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time4").html('<div class="td">15:45 to 17:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time5").html('<div class="td">18:15 to 20:15</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $.each(response.data, function(index, data) {
                    $.each(data.room, function(index, room) {
                        if (roomName == room.room) {
                            var caLam = typeTime(room.time)
                            $("#" + caLam + " div:nth-child(" + data.dayOfWeek + ")").append('<i class="fas fa-check-circle"></i>')
                            if (room.status == "None") $("#" + caLam + " div:nth-child(" + data.dayOfWeek + ")").css("color", "red")
                            if (room.status != "None") $("#" + caLam + " div:nth-child(" + data.dayOfWeek + ")").css("color", "green")
                        }
                    });
                });
            }
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//lấy thông tin phòng học
function getListRoom() {
    $.ajax({
        url: '/admin/getRoomAndTime',
        method: 'get',
        dataType: 'json',
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $("#listRoom").html("<h1 style='margin:10px;'>List Room </h1>")
                    $("#listRoom").append("<div class='listOption'><button onclick='deleteRoom()'>Delete room</button></div><hr>")
                    $.each(data.listRoom, function(index, data) {
                        $("#listRoom").append("<div class='list'><button onclick=tuanoi('" + this + "')>" + this + "</button><br><input type='checkbox' class='delete' value='" + this + "'><div>")
                    });
                });
                //lấy trạng thái phongf đâu tiên trong mảng
                tuanoi(response.data[0].listRoom[0]);
            }
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    })
}

//lấy số tin nhắn chưa đọc
function unReadMess() {
    $.ajax({
        url: '/messenger/unreadMess',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                $("#UnreadMessages").html(response.unReadMess)
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}

function deleteRoom() {
    if (confirm("Are you sure you want to delete this?")) {

        var listRoom = [];
        $(".delete").each(function() { if ($(this).is(':checked')) listRoom.push($(this).val()) })
        if (listRoom.length == 0) {
            alert("Chose room")
        } else {
            $.ajax({
                url: '/admin/deleteRoom',
                method: 'post',
                dataType: 'json',
                data: { listRoom: listRoom },
                success: function(response) {
                    if (response.msg == 'success') {
                        getListRoom();
                        alert('Delete success');
                    }
                    if (response.msg == 'error') alert('error')
                },
                error: function(response) { alert('server error'); }
            })
        }
    }
}

//phân ca để dưa vào bảng lịch học
function typeTime(time) {
    var caLam
    if (time == "7:30 to 9:30") caLam = "time1"
    if (time == "9:45 to 11:45") caLam = "time2"
    if (time == "13:30 to 15:30") caLam = "time3"
    if (time == "15:45 to 17:45") caLam = "time4"
    if (time == "18:15 to 20:15") caLam = "time5"
    return caLam
}

function addRoom() {
    var roomName = $("input[name='roomName']").val().toUpperCase();
    if (roomName.trim().length == 0) return alert("Input name of the room!")
    var ca = ["7:30 to 9:30", "9:45 to 11:45", "13:30 to 15:30", "15:45 to 17:45", "18:15 to 20:15"]
    var room = []
    for (var i = 0; i < 5; i++) { room.push({ "room": roomName, "time": ca[i], "status": "None" }) }
    $.ajax({
        url: '/admin/addRoom',
        method: 'post',
        dataType: 'json',
        data: { roomName: room, room: roomName },
        success: function(response) {
            if (response.msg == 'success') {
                getListRoom();
                alert('Add room success');
            }
            if (response.msg == 'error') alert('error')
        },
        error: function(response) { alert('server error'); }
    })
}