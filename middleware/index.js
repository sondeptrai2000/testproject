let AccountModel = require('../models/account');
var jwt = require('jsonwebtoken');

let checkLogin = async(req, res, next) => {
    try {
        var user = await AccountModel.findOne({ username: req.body.username }, { username: 1, role: 1, password: 1 }).lean();
        if (!user) return res.json({ msg: 'invalid_Info' });
        req.user = user
        next();
    } catch (error) {
        console.log(error)
        res.json({ message: "error" })
    }
};
//check đăng nhập
let checkAuth = async(req, res, next) => {
    var token = req.cookies.token
    if (!token) return res.redirect('/warning');
    let decodeAccount = jwt.verify(token, 'minhson');
    let user = await AccountModel.findOne({ _id: decodeAccount._id }, { role: 1 }).lean();
    if (!user) return res.redirect('/warning');
    req.userLocal = user;
    next();
};

let checkAdmin = (req, res, next) => {
    if (req.userLocal.role != "admin") return res.redirect('/warning');
    next();
};
let checkTeacher = (req, res, next) => {
    if (req.userLocal.role != "teacher") return res.redirect('/warning');
    next();
};

let checkStudent = (req, res, next) => {
    if (req.userLocal.role != "student") return res.redirect('/warning');
    next();
};

let checkGuardian = (req, res, next) => {
    if (req.userLocal.role != "guardian") return res.redirect('/warning');
    next();
};

module.exports = {
    checkLogin,
    checkAdmin,
    checkTeacher,
    checkStudent,
    checkGuardian,
    checkAuth
}