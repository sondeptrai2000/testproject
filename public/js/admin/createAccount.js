var fileData;
var myFile;
var fileDataUpdate;
var myFileUpdate;

$(document).ready(function() {
    //chạy hàm đếm số lượng giáo viên trong lớp và hiển thị số trang và giáo viên
    countAccount();
    unReadMess();
    //thêm năm vào xem lịch
    year();
});

async function year() {
    for (var a = 2012; a < 2030; a++) {
        $("#chonNam").append("<option value='" + a + "' >" + a + "</option>")
    }
    var date = new Date()
    $("#chonNam option[value='" + date.getFullYear() + "']").attr('selected', 'selected');
    setCalender();
}

//thoát modal box bằng cách ấn ra ngàoi form
$(window).on('click', function(e) {
    if ($(e.target).is('.createAccountOut')) $('.createAccountOut').fadeOut(1500);
    if ($(e.target).is('.updateFormOut')) $('.updateFormOut').fadeOut(1500);
    if ($(e.target).is('.SchedualOut')) $('.SchedualOut').fadeOut(1500);
});

//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});

//xử lý file khi tạo tài khoản
$('#myFile').on('change', function() {
    var filereader = new FileReader();
    filereader.onload = function(event) {
        fileData = event.target.result;
        var dataURL = filereader.result;
        $("#output").attr("src", dataURL);
    };
    myFile = $('#myFile').prop('files')[0];
    console.log('myfile', myFile)
    filereader.readAsDataURL(myFile)
});
//xử lý file khi câpj nhật thông tin tài khoản
$('#myFileUpdate').on('change', function() {
    var filereaderUpdate = new FileReader();
    filereaderUpdate.onload = function(event) {
        fileDataUpdate = event.target.result;
        var dataURLUpdate = filereaderUpdate.result;
        $("#currentAvatar").attr("src", dataURLUpdate);
    };
    myFileUpdate = $('#myFileUpdate').prop('files')[0];
    console.log('myfileUpdate', myFileUpdate)
    filereaderUpdate.readAsDataURL(myFileUpdate)
});


// làm trống thông tin tạo tài khoản
async function reset() {
    $("#createAccount input").val('');
    $("#submitAccount").val("Submit");
    $("#output").attr('src', '');
    fileData = undefined
    myFile = undefined
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

//đếm số tk để hiển thị theo danh sachs trang
function countAccount() {
    var role = $("#accountFilter").val();
    var studentStatus = $("#studentFilter").val();
    if (role != 'student') $('#option .td:nth-child(3)').hide();
    if (role == 'student') $('#option .td:nth-child(3)').show();
    var condition
    if (role == 'teacher') condition = { "role": role }
    if (role == 'student') condition = { "role": role, "studentStatus": studentStatus }
    console.log(condition)
    $.ajax({
        url: '/admin/countAccount',
        method: 'get',
        dataType: 'json',
        data: { condition: condition },
        success: function(response) {
            if (response.msg == 'success') {
                $("#soTrang").html("Page: <select onchange=getAccount()></select>");
                //hiển thị số trang vào thẻ select cho dễ chọn trang
                for (let i = 1; i < response.soTrang; i++) { $("#soTrang select").append("<option value='" + (i - 1) + "'>" + i + "</option>") }
                $("#number").html("Total: " + response.numberOfAccount);
                //hiển thị thông tin các tài khoản theo role và số trang.
                getAccount();
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//lấy danh sách theo role
function getAccount() {
    var role = $("#accountFilter").val()
    var page = $("#soTrang select").val()
    var studentStatus = $("#studentFilter").val()
    $(".tableInforType").html("");
    var tableInfor = "<div class='tr'>\
        <div class='td'>Avatar</div>\
        <div class='td'>Phone</div>\
        <div class='td'>Address</div>\
        <div class='td'>Birthday</div>\
        <div class='td'>Action</div></div>"
    $(".tableAccount").html(tableInfor);
    var condition
    if (role == 'teacher') condition = { "role": role }
    if (role == 'student') condition = { "role": role, "studentStatus": studentStatus }
    console.log(condition)
    $.ajax({
        url: '/admin/getAccount',
        method: 'get',
        dataType: 'json',
        data: { sotrang: page, condition: condition },
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $(".tableAccount").append("<div class='tr' id ='" + data._id + "' onclick=search('" + data.email + "','load1')><div class='td'><img  src='" + data.avatar + "'><figcaption>" + data.username + "</figcaption></div><div class='td'>" + data.phone + "</div><div class='td'>" + data.address + "</div><div class='td'>" + data.birthday + "</div><div class='td'><i  class='far fa-edit' onclick=updateForm('" + data._id + "')></i><i class='fas fa-calendar-alt' onclick=viewSchedual('" + data._id + "','" + data.role + "')></i><i class='far fa-trash-alt' onclick=deleteAccount('" + data._id + "','" + data.role + "')></i></div></div >");
                });
                //hiển thị thông tin chi tiết trang form bên phải
                search(response.data[0].email, "load1")
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

function deleteAccount(id, role) {
    if (confirm("Are you sure you want to delete this?")) {
        $.ajax({
            url: '/admin/deleteAccount',
            method: 'post',
            dataType: 'json',
            data: { id: id, role: role },
            success: function(response) {
                if (response.msg == 'success') countAccount();
            },
            error: function(response) {
                alert('server error');
            }
        });
    }
}

//lấy các ngày trong khoảng thời gian học
var getDaysArray = function(start, end) {
    var dt = new Date(start)
    for (var arr = []; dt <= end; dt.setDate(dt.getDate() + 1)) { arr.push(new Date(dt)); }
    return arr;
};
//chia 3 làm việc để in vào bảng theo id
function typeTime(time) {
    var caLam
    if (time == "7:30 to 9:30") caLam = "time1"
    if (time == "9:45 to 11:45") caLam = "time2"
    if (time == "13:30 to 15:30") caLam = "time3"
    if (time == "15:45 to 17:45") caLam = "time4"
    if (time == "18:15 to 20:15") caLam = "time5"
    return caLam

}

//cấu tạo lịch
function setCalender() {
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
    if ($("#viewID").val() && $("#viewRole").val()) viewSchedual($("#viewID").val(), $("#viewRole").val())
};

//xem lịch học , làm việc
function viewSchedual(id, role) {
    $("#viewID").val(id)
    $("#viewRole").val(role)

    //lấy thông tin lịch trình học, làm việc
    var AddYear = $("#chonNam").val() + "-";
    var tuan = $("#chonTuan").val();
    var dauTuan = AddYear + tuan.split(" to ")[0];
    var cuoiTuan = AddYear + tuan.split(" to ")[1];

    var formData = { dauTuan: dauTuan, cuoiTuan: cuoiTuan, id: id, role: role };
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
        url: '/admin/getSchedule',
        method: 'get',
        dataType: 'json',
        data: formData,
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
                            $("#" + caLam + " div:nth-child(" + schedule.day + ")").append("" + classInfor.className + "</a><br> Room: " + schedule.room)
                        }
                    });
                });
                $(".SchedualOut").fadeIn(500);
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

//phân loại đăng ký khóa học dựa vào role cho cả create and update
function routeType(action) {
    if (action === 'create') {
        var routeName = $('#routeTypeS').val();
        $('#levelS').html('');
        $("#Aim").html('');
    } else if (action === 'update') {
        var routeName = $('#routeTypeSUpdate').val();
        $('#levelSUpdate').html('');
        $("#AimUpdate").html('');
    }
    $.ajax({
        url: '/admin/getStage',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName },
        success: function(response) {
            if (response.msg == 'success') {
                if (action === 'create') {
                    $.each(response.data, function(index, data) {
                        $.each(data.routeSchedual, function(index, routeSchedual) {
                            var update = "<option value='" + routeSchedual.stage + "'>" + routeSchedual.stage + "</option>"
                            $("#levelS").append(update);
                            $("#Aim").append(update);
                        });
                    });
                } else if (action === 'update') {
                    $.each(response.data, function(index, data) {
                        if ($("#routeTypeSUpdate").val() == data.routeName) {
                            $.each(data.routeSchedual, function(index, routeSchedual) {
                                var update = "<option value='" + routeSchedual.stage + "'>" + routeSchedual.stage + "</option>"
                                $("#levelSUpdate").append(update);
                                $("#AimUpdate").append(update);
                            });
                        }
                    });
                }
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//hiệu ứng chọn các buổi học sinh có thể học tập tại trung tâm
function choseTime(action) {
    if (action == "update") {
        $("#availbleTimeUpdate input").each(function() {
            if ($(this).is(':checked')) {
                if ($(this).val() == "All") {
                    $("#availbleTimeUpdate input").prop('checked', false);
                    $(this).prop('checked', true);
                }
            }
        })
    }
    if (action == "create") {
        $("#availbleTime input").each(function() {
            if ($(this).is(':checked')) {
                if ($(this).val() == "All") {
                    $("#availbleTime input").prop('checked', false);
                    $(this).prop('checked', true);
                }
            }
        })
    }
}

//ấn hiển đăgn ký khóa học dựa theo role cho việc tạo tài khoản. Học sinh sẽ hiển ra còn giáo viên sẽ đóng lại vì không cần thiết
$("#role").change(async function() {
    var accountRole = $('#role').val();
    if (accountRole == "teacher") {
        $('.typeRole').slideUp();
        $('.typeRole').html('');
    }
    if (accountRole != "teacher") {
        $('.typeRole').html(" Route<select id='routeTypeS' onchange=routeType('create')></select>Level<select id='levelS'></select>Aim<select id='Aim'></select>Guardian name:<input type='text' name='guardianName'>Guardian phone: <input type='number' name='guardianPhone'>Guardian email:<input type='text' name='guardianEmail'>Available time to study:<div id='availbleTime' style='width:100%;padding:0;margin-top:10px;'><ul>Morning<input type='checkbox' class='checkTtime' onchange=choseTime('create') value='Morning'></ul><ul>Afternoon<input type='checkbox' class='checkTtime' onchange=choseTime('create') value='Afternoon'></ul><ul>Night<input type='checkbox' class='checkTtime' onchange=choseTime('create') value='Night'></ul><ul>All<input type='checkbox' class='checkTtime' onchange=choseTime('create') value='All'></ul></div>")
        getRoute('create')
        $('.typeRole').slideDown()
    }
});

//lấy cái lộ trình học để chọn trong cả 2 form tạo và update tài khoản
function getRoute(type) {
    var id
    if (type == 'create') id = "#routeTypeS";
    if (type == 'update') id = "#routeTypeSUpdate";
    $.ajax({
        url: '/admin/getRoute',
        method: 'get',
        dataType: 'json',
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) { $(id).append("<option value='" + data.routeName + "'>" + data.routeName + "</option>") });
            }
        }
    })
}




//chuyền thông tin cũ vào form cập nhật thông tin
function updateForm(id) {
    $('#levelSUpdate').html('');
    $("#AimUpdate").html('');
    $.ajax({
        url: '/admin/editAccount',
        method: 'get',
        dataType: 'json',
        data: { updateid: id },
        success: function(response) {
            if (response.msg == 'success') {
                var account = response.account
                $("#currentRole").val(account.role)
                $("#currentAvatar").attr("src", account.avatar)
                $("#PersonID").val(id)
                $("#oldAvatar").val(account.avatar);
                $("#firstNameUpdate").val(account.firstName)
                $("#lastNameUpdate").val(account.lastName)
                $('#genderUpdate option:selected').removeAttr('selected');
                $("#genderUpdate option[value='" + account.sex + "']").attr('selected', 'selected');
                $("#emailUpdate").val(account.email)
                $("#phoneUpdate").val(account.phone)
                $("#addressUpdate").val(account.address)
                $("#birthdayUpdate").val(account.birthday)
                console.log(account)
                if (account.role == "student") {
                    $('.typeRoleUpdate').html(" Route:<select id='routeTypeSUpdate' onchange=routeType('update')></select>Level<select id='levelSUpdate'></select>Aim<select id='AimUpdate'></select>Guardian name:<input type='text' name='guardianNameUpdate'>Guardian phone: <input type='number' name='guardianPhoneUpdate'>Guardian email:<input type='text' name='guardianEmailUpdate'>Available time to study:<div id='availbleTimeUpdate' style='width:100%;padding:0;margin-top:10px;'><ul>Morning<input type='checkbox' class='checkTtimeUpdate' onchange=choseTime('update') value='Morning'></ul><ul>Afternoon<input type='checkbox' class='checkTtimeUpdate' onchange=choseTime('update') value='Afternoon'></ul><ul>Night<input type='checkbox' class='checkTtimeUpdate' onchange=choseTime('update') value='Night'></ul><ul>All<input type='checkbox' class='checkTtimeUpdate' onchange=choseTime('update') value='All'></ul></div>")
                    getRoute('update')
                    $("input[name='guardianNameUpdate']").val(account.relationship.username)
                    $("input[name='guardianPhoneUpdate']").val(account.relationship.phone)
                    $("input[name='guardianEmailUpdate']").val(account.relationship.email)
                    $('.typeRoleUpdate').slideDown()
                    $("#availbleTimeUpdate input").each(function() { if (account.availableTime.includes($(this).val())) $(this).prop('checked', true); })
                    $.each(response.targetxxx, function(index, targetxxx) {
                        if (targetxxx.routeName == account.routeName) {
                            $("#routeTypeSUpdate").append("<option value='" + targetxxx.routeName + "'>" + targetxxx.routeName + "</option>");
                            $("#routeTypeSUpdate option[value='" + account.routeName + "']").attr('selected', 'selected');
                            $.each(targetxxx.routeSchedual, function(index, routeSchedual) {
                                $("#levelSUpdate").append("<option value='" + routeSchedual.stage + "'>" + routeSchedual.stage + "</option>");
                                $('#levelSUpdate option:selected').removeAttr('selected');
                                $("#levelSUpdate option[value='" + account.stage + "']").attr('selected', 'selected');
                                $("#AimUpdate").append("<option value='" + routeSchedual.stage + "'>" + routeSchedual.stage + "</option>");
                                $('#AimUpdate option:selected').removeAttr('selected');
                                $("#AimUpdate option[value='" + account.aim + "']").attr('selected', 'selected');
                            });
                        }
                    });
                }

                if (account.role == "teacher") {
                    $('.typeRoleUpdate').slideUp();
                    $('.typeRoleUpdate').html('');
                }

                $(".updateFormOut").fadeIn(500);

            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}



//thực hiện đăng ký và lưu tài khỏan vào đb
$("#myform").submit(async function(event) {
    event.preventDefault();
    var role = $("#role").val()
    if (role == "student") {
        //lấy các thời gian học sinh có thể đi học tại trung tâm
        var availableTime = []
        $("#availbleTime input").each(function() {
            if ($(this).is(':checked')) {
                if ($(this).val() == "All") {
                    availableTime.length = 0
                    availableTime.push($(this).val())
                    $("#availbleTime input").prop('checked', false);
                    $(this).prop('checked', true);
                } else {
                    availableTime.push($(this).val())
                }
            }
        })
        if (availableTime.length == 3) availableTime = ["All"]
        if (availableTime.length == 0) alert("Enter time that student can study!")
    }
    //thôn tin bắt buộc của giáo viên or học sinh
    var formData1 = {
        sex: $("#gender").val(),
        username: $("#firstName").val() + " " + $("#lastName").val(),
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        email: $("#email").val(),
        role: role,
        phone: $("#phone").val(),
        address: $("#address").val(),
        birthday: $("#birthday").val(),
    };
    var formData2;
    //thông tin bổ sung dựa trên role
    if (role != "teacher") {
        formData1["stage"] = $("#levelS").val()
        formData1["routeName"] = $("#routeTypeS").val()
        formData1["aim"] = $("#Aim").val()
        formData1["startStage"] = $("#levelS").val()
        formData1["availableTime"] = availableTime
        formData2 = {
            role: "guardian",
            username: $("input[name='guardianName']").val(),
            phone: $("input[name='guardianPhone']").val(),
            email: $("input[name='guardianEmail']").val(),
        };
    }
    $.ajax({
        url: '/admin/doCreateAccount',
        method: 'post',
        dataType: 'json',
        data: { password: $("#password").val(), filename: myFile.name, file: fileData, student: formData1, phuhuynh: formData2 },
        success: function(response) {
            if (response.msg == 'success') {
                reset();
                getAccount();
                $(".createAccountOut").slideUp();
                alert('Sign Up success');
            }
            if (response.msg == 'Email or phone already exists') alert('Email or phone already exists');
            if (response.msg == 'Guardian email or phone already exists') alert('Guardian email or phone already exists');
            if (response.msg == 'error') alert('error');
        },
        error: function(response) {
            alert('server error');
        }
    })

});

//thực hiện cập nhật thông tin tài khỏan vào đb
//giống kha khá với tạo tài khoản
$("#myformUpdate").submit(function(event) {
    event.preventDefault();
    var role = $("#currentRole").val()
    if (!fileDataUpdate) fileDataUpdate = "none";
    if (role == 'student') {
        //lấy các thời gian học sinh có thể đi học tại trung tâm
        var availableTime = []
        $("#availbleTimeUpdate input").each(function() {
            if ($(this).is(':checked')) {
                if ($(this).val() == "All") {
                    availableTime.length = 0
                    availableTime.push($(this).val())
                    $("#availbleTimeUpdate input").prop('checked', false);
                    $(this).prop('checked', true);
                } else { availableTime.push($(this).val()) }
            }
        });
        if (availableTime.length == 3) availableTime = ["All"];
        if (availableTime.length == 0) alert("Enter time that student can study!");
    }
    var formData1 = {
        sex: $("#gender").val(),
        username: $("#firstNameUpdate").val() + " " + $("#lastNameUpdate").val(),
        firstName: $("#firstNameUpdate").val(),
        lastName: $("#lastNameUpdate").val(),
        email: $("#emailUpdate").val(),
        role: role,
        phone: $("#phoneUpdate").val(),
        address: $("#addressUpdate").val(),
        birthday: $("#birthdayUpdate").val(),
    };
    var formData2
    if (role != "teacher") {
        formData1["stage"] = $("#levelSUpdate").val()
        formData1["routeName"] = $("#routeTypeSUpdate").val()
        formData1["aim"] = $("#AimUpdate").val()
        formData1["availableTime"] = availableTime
        formData2 = {
            role: "guardian",
            username: $("input[name='guardianNameUpdate']").val(),
            phone: $("input[name='guardianPhoneUpdate']").val(),
            email: $("input[name='guardianEmailUpdate']").val(),
        }
    }
    $.ajax({
        url: '/admin/doeditAccount',
        method: 'post',
        dataType: 'json',
        //Note: oldLink: là link avatar cũ
        data: { id: $("#PersonID").val(), oldLink: $('#oldAvatar').val(), password: $("#passwordUpdate").val(), formData1: formData1, formData2: formData2, file: fileDataUpdate, },
        success: function(response) {
            if (response.msg == 'success') {
                alert('update success');
                $('.updateFormOut').fadeOut(2000);
                getAccount();
            }
        },
        error: function(response) {
            alert('server error');
        }
    })

})


//tìm kiếm thông tin qua email hoặc số điện thoại cho học sinh và hiển thị thông tin sang form bên phải
function search(email, type) {
    if ($("#search").val().trim() == '' && type != 'load1') return alert("Enter phone or email!")
    var condition = {}
    if (email != "") {
        condition["email"] = email
    } else {
        var search = $("#search").val().toString().trim()
        if (isNaN(search) == true) condition["email"] = search
        if (isNaN(search) == false) condition["phone"] = search
    }
    $.ajax({
        url: '/admin/search',
        method: 'get',
        dataType: 'json',
        data: { condition: condition },
        success: function(response) {
            if (response.msg == 'success') {
                $(".tableAccount .tr:not(:nth-child(1))").css("background-color", 'white');
                $("#" + response.data._id).css("background-color", 'Wheat');
                $(".rightSideContent").html("")
                if (response.data.role == "teacher") {
                    $(".rightSideContent").append("<div style='width:100%;text-align:center;'><img src='" + response.data.avatar + "'></div><p>Name: " + response.data.username + "</p>Gender: " + response.data.sex + "</p>Email: " + response.data.email + "</p><p>Phone: " + response.data.phone + "</p><p>Role: " + response.data.role + "</p><p>BirthDay: " + response.data.birthday + "</p><p>Address: " + response.data.address + "</p>")
                } else {
                    if (response.data.role == "student") {
                        var data = response.data
                        var relationship = data.relationship
                    } else {
                        var relationship = response.data
                        var data = relationship.relationship
                    }
                    $(".rightSideContent").append("<div style='width:100%;text-align:center;'><img src='" + response.data.avatar + "'></div><p>Name: " + data.username + "</p><p>Gender: " + data.sex + "</p><p>Email: " + data.email + "</p><p>Phone: " + data.phone + "</p><p>Available Time to study: " + data.availableTime + "</p><p>Role: " + data.role + "</p><p>BirthDay: " + data.birthday + "</p><p>Address: " + data.address + "</p>")
                    $(".rightSideContent").append("<h2>Current academic status</h2>")
                    $(".rightSideContent").append("<p>Route: " + data.routeName + " </p><p>Start level: " + data.startStage + " </p><p>Current level: " + data.stage + " </p><p>Aim : " + data.aim + "</p>")
                    $(".rightSideContent").append("<h2>Study progress</h2>")
                    $(".rightSideContent").append("<a href='/admin/studentClass/" + data._id + "' target='_blank'>Click here to see more about progress</a>");
                    //hiển thị lộ trình học của học sinh
                    var progress = data.progess
                    progress.forEach((e) => {
                        $(".rightSideContent").append("<h3>Stage: " + e.stage + "</h3>")
                        $(".rightSideContent").append("<div class='tr' id='headerProgress'><div class='td'>Subject</div><div class='td'>Status</div></div>")
                        e.stageClass.forEach((e) => {
                            if (e.classID != "") $(".rightSideContent").append("<div class='tr'><div class='td'>" + e.name + " </div><div class='td'> " + e.status + " </div></div>")
                        })
                    })
                    $(".rightSideContent").append("<h2>Guardian information</h2>")
                    $(".rightSideContent").append("<p>Name: " + relationship.username + " </p><p>Phone: " + relationship.phone + " </p><p>Email : " + relationship.email + "</p>")
                }
                $(".seacherInforOut").fadeIn(500)
            }
            if (response.msg == 'err') alert(' err');
            if (response.msg == 'none') alert('không tim thấy user');
        },
        error: function(response) {
            alert('server error');
        }
    })
}