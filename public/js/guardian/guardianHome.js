var fileData;
var myFile;

$(document).ready(function() {
    //lấy thông tin cá nhân
    studentProfile();
    //lấy lịch học
    unReadMess();
    //thêm năm vào xem lịch
    year();
});

function year() {
    for (var a = 2012; a < 2030; a++) {
        $("#chonNam").append("<option value='" + a + "' >" + a + "</option>")
    }
    var date = new Date()
    console.log(date.getFullYear())
    $("#chonNam option[value='" + date.getFullYear() + "']").attr('selected', 'selected');
    test();
}
//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});
//thoát update form
$(window).on('click', function(e) {
    if ($(e.target).is('.updateProfileOut')) {
        $('.updateProfileOut').slideUp(1500);
    }
});

$('#myFile').on('change', function() {
    var filereader = new FileReader();
    filereader.onload = function(event) {
        fileData = event.target.result;
        var dataURL = filereader.result;
        $("#currentAvatar").attr("src", dataURL);
    };
    myFile = $('#myFile').prop('files')[0];
    console.log('myfile', myFile)
    filereader.readAsDataURL(myFile)
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
                $("#UnreadMessages").html(response.unReadMess)
                $("#welcome").html("Welcome " + response.username);
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}


//lấy lịch học 
function test() {
    firstDayOfYear = $("#chonNam").val() + "-01-01";
    lastDayofYear = $("#chonNam").val() + "-12-31";
    //lấy các ngày trong năm
    for (var arr = [], dt = new Date(firstDayOfYear); dt <= new Date(lastDayofYear); dt.setDate(dt.getDate() + 1)) {
        var date = new Date(dt)
        var month = (date.getMonth() + 1).toString().padStart(2, "0");
        var lol = date.getFullYear() + "-" + month + "-" + date.getDate().toString().padStart(2, "0");
        arr.push({ "ngay": lol, "thu": (date.getDay() + 1) });
    }
    //chia thành các tuần từ thứ 2 to CN
    var tuan = []
    var checkTuanDau = false
    var RemoveYear = $("#chonNam").val() + "-";
    for (var i = 0; i < arr.length; i++) {
        var d = new Date(arr[i].ngay);
        var n = d.getDay();
        //xét tuần đầu tiên
        if (arr[i].thu != 2 && i < 7 && checkTuanDau == false) {
            var case1 = arr[i].ngay.replace(RemoveYear, "") + ' to ' + arr[i].ngay.replace(RemoveYear, "");
            var case2 = arr[i].ngay.replace(RemoveYear, "") + ' to ' + arr[7 - n].ngay.replace(RemoveYear, "");
            if (arr[i].thu == 1) tuan.push(case1);
            if (arr[i].thu != 1) tuan.push(case2);
            checkTuanDau = true;
        }

        if (arr[i].thu == 2) {
            if (i + 6 < arr.length) {
                var case1 = arr[i].ngay.replace(RemoveYear, "") + ' to ' + arr[i + 6].ngay.replace(RemoveYear, "");
                tuan.push(case1);
            }

            if (i + 6 >= arr.length) {
                var case2 = arr[i].ngay.replace(RemoveYear, "") + ' to ' + arr[arr.length - 1].ngay.replace(RemoveYear, "");
                tuan.push(case2);
            }
        }
    }
    //đưa các tuần vào thẻ select và đặt select cho tuần hiện tại.
    $("#chonTuan").html("")
    const date1 = new Date();
    var month = date1.getMonth() + 1
        //lấy thời gian hiện tại để so sánh và lấy tuần
    var now = date1.getFullYear() + "-" + month.toString().padStart(2, "0") + "-" + date1.getDate().toString().padStart(2, "0");
    for (var u = 0; u < tuan.length; u++) {
        $("#chonTuan").append('<option value="' + tuan[u] + '">' + tuan[u] + '</option>');
        dauTuan = RemoveYear + tuan[u].split(" to ")[0]
        cuoiTuan = RemoveYear + tuan[u].split(" to ")[1]
        if ((dauTuan <= now) && (now => cuoiTuan)) {
            $('#chonTuan option:selected').removeAttr('selected');
            $("#chonTuan option[value='" + tuan[u] + "']").attr('selected', 'selected');
        }
    }
    tuanoi()
};

//lấy các ngày trong khoảng thời gian học
var getDaysArray = function(start, end) {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};

//lấy thông tin lịch trình học, làm việc
function tuanoi() {
    var AddYear = $("#chonNam").val() + "-";
    var tuan = $("#chonTuan").val();
    var dauTuan = AddYear + tuan.split(" to ")[0];
    var cuoiTuan = AddYear + tuan.split(" to ")[1];

    //chỉnh fomat date giống Type Date trong mongoDB để so sánh 
    // link src hàm moment ở head
    var start = moment(new Date(dauTuan)).format('YYYY-MM-DD[T00:00:00.000Z]');
    var end = moment(new Date(cuoiTuan)).format('YYYY-MM-DD[T00:00:00.000Z]');
    var a = getDaysArray(new Date(dauTuan), new Date(cuoiTuan));
    $("#ngay").html("<div class='td'>Day</div>")
        //tùy biến ngày vào html
    a.forEach(element => {
        var dayOfChosenWeek = (element.getFullYear() + "-" + (element.getMonth() + 1).toString().padStart(2, "0") + "-" + element.getDate())
        $("#ngay").append("<div class='td'>" + dayOfChosenWeek.replace(AddYear, "") + "</div>");
    });
    //lấy thông tin lịch học
    $.ajax({
        url: '/guardian/getSchedule',
        method: 'get',
        dataType: 'json',
        data: { dauTuan: dauTuan },
        success: function(response) {
            if (response.msg == 'success') {
                $("#time1").html('<div class="td">7:30 to 9:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time2").html('<div class="td">9:45 to 11:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time3").html('<div class="td">13:30 to 15:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time4").html('<div class="td">15:45 to 17:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time5").html('<div class="td">18:15 to 20:15</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $.each(response.classInfor, function(index, classInfor) {
                    $.each(classInfor.schedule, function(index, schedule) {
                        if (start <= schedule.date && schedule.date <= end) {
                            //ghi thông tin lịch học, làm việc vào bảng
                            var caLam = typeTime(schedule.time)
                            $("#" + caLam + " div:nth-child(" + schedule.day + ")").append("<a href='/guardian/allClass/" + classInfor._id + "'>" + classInfor.className + "</a><br> Room: " + schedule.room)
                        }
                    });
                });
            }
            if (response.msg == 'error') {
                alert("error")
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
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

//lấy thông tin học sinh
function studentProfile() {
    $.ajax({
        url: '/account/Profile',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                $(".content").show();
                $("#idProfile").text(response.data._id);
                $("#avatarProfile").attr("src", response.data.avatar);
                $("#usernameProfile").html("Full Name: " + response.data.username);
                $("#firstNameProfile").val(response.data.firstName);
                $("#lastNameProfile").val(response.data.lastName);
                $("#genderProfile").html("Gender: " + response.data.sex);
                $("#emailProfile").html("Email: " + response.data.email);
                $("#phoneProfile").html("Phone: " + response.data.phone);
                $("#birthdayProfile").html("BirthDay: " + response.data.birthday);
                $("#addressProfile").html("Address: " + response.data.address);
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//đưa thông tin cũ vào form update thông tin
function updateProfile() {
    $("#currentAvatar").attr("src", $("#avatarProfile").attr("src"));
    $("#avatarOldProfile").val($("#avatarProfile").attr("src"));
    $("#idProfileUpdate").html($("#idProfile").text());
    $("#usernameUpdate").val($("#usernameProfile").text().split("Full Name: ")[1]);
    $("#firstNameUpdate").val($("#firstNameProfile").val());
    $("#lastNameUpdate").val($("#lastNameProfile").val());
    $("#genderUpdate option:selected").removeAttr("selected");
    var gender = $("#genderProfile").text().split("Gender: ")[1]
    $("#genderUpdate option[value='" + gender + "']").attr("selected", "selected");
    $("#emailUpdate").val($("#emailProfile").text().split("Email: ")[1]);
    $("#phoneUpdate").val($("#phoneProfile").text().split("Phone: ")[1]);
    $("#birthdayUpdate").val($("#birthdayProfile").text().split("BirthDay: ")[1]);
    $("#addressUpdate").val($("#addressProfile").text().split("Address: ")[1]);
    $(".updateProfileOut").toggle(2000);
}

//tiến hành cập nhật thông tin
function doUpdateProfile() {
    if (!fileData) {
        fileData = "none"
    }
    var password = $("#newPassWord").val()
    var formData1 = {
        sex: $("#genderUpdate").val(),
        username: $("#firstNameUpdate").val() + " " + $("#lastNameUpdate").val(),
        firstName: $("#firstNameUpdate").val(),
        lastName: $("#lastNameUpdate").val(),
        email: $("#emailUpdate").val(),
        phone: $("#phoneUpdate").val(),
        address: $("#addressUpdate").val(),
        birthday: $("#birthdayUpdate").val(),
        avatar: $('#currentAvatar').attr('src'),
    };
    $.ajax({
        url: '/account/doeditAccount',
        method: 'post',
        dataType: 'json',
        data: {
            id: $("#idProfile").text(),
            password: password,
            formData1: formData1,
            file: fileData,
            oldLink: $('#avatarOldProfile').val(),
        },
        success: function(response) {
            if (response.msg == 'success') {
                studentProfile();
                $('.updateProfileOut').slideUp(1500);
            }
            if (response.msg == 'Account already exists') alert("Account already exists")
            if (response.msg == 'Phone already exists') alert("Phone already exists")
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    })
}