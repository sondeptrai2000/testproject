var express = require('express');
var accounRouter = express.Router();
// var accountController = require('../controller/account.controller')
const { checkLogin, checkAdmin, checkTeacher, checkStudent, checkGuardian, checkAuth } = require('../middleware/index');
const { homeAdmin, homeGuardian, homeStudent, homeTeacher, loginController, getCode, confirmPass, doeditAccount, profile } = require('../controller/account.controller');
// check đăng nhập
accounRouter.post('/dologin', checkLogin, loginController)

accounRouter.use(checkAuth);

//cập nhật thông tin tài khoản
accounRouter.post('/doeditAccount', doeditAccount)
accounRouter.get('/profile', profile)
    //chả về trang home
accounRouter.get('/homeAdmin', checkAdmin, homeAdmin)
accounRouter.get('/homeStudent', checkStudent, homeStudent)
accounRouter.get('/homeTeacher', checkTeacher, homeTeacher)
accounRouter.get('/homeGuardian', checkGuardian, homeGuardian)
    // đổi mật khẩu
accounRouter.get('/getCode', getCode)
accounRouter.post('/confirmPass', confirmPass)
module.exports = accounRouter