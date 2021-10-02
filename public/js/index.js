$(window).on('click', function(e) {
    if ($(e.target).is('#forGotPassOut')) {
        $('#forGotPassOut').slideUp(500);
    }
});

function getCode() {
    if ($("#emailForgot").val().trim().endsWith("@gmail.com") == false) return alert("Enter your email!")
    $.ajax({
        url: '/account/getCode',
        method: 'get',
        data: { email: $("#emailForgot").val() },
        success: function(response) {
            if (response.msg == 'success') alert("code Sent")
            if (response.msg == 'email not found') alert('email not found');
        },
        error: function(response) { alert('server error'); }
    })
}

function newPass() {
    if ($("#newPassForgot").val().trim() == "") return alert('Input new password!');
    if ($("#newPassForgot").val() != $("#confirmPassForgot").val()) return alert('new password and confirm password is not matched!');
    var formData = { email: $("#emailForgot").val(), newPass: $("#newPassForgot").val(), codeForgot: $("#codeForgot").val(), }
    $.ajax({
        url: '/account/confirmPass',
        method: 'post',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') alert("success")
            if (response.msg == 'invalidCode') alert('Invalid Code! Try again.');
        },
        error: function(response) { alert('server error'); }
    })

}

function logIn() {
    if ($("#username").val().trim() == "" || $("#password").val().trim() == "") return alert('Input email and password!');
    var formData = { username: $("#username").val(), password: $("#password").val() }
    $.ajax({
        url: '/account/dologin',
        method: 'post',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') window.location.href = '/account/' + response.data;
            if (response.msg == 'invalid_Info') alert('Username or password is invalid');
            if (response.msg == 'error') alert(' error');
        },
        error: function(response) {
            alert('server error');
        }
    })
}