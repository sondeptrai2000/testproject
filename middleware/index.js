let AccountModel = require('../models/account');
var jwt = require('jsonwebtoken');

let checkLogin = async(req, res, next) => {
    try {
        var user = await AccountModel.findOne({ username: req.body.username }).lean();
        if (!user) res.json({ msg: 'invalid_Info' });
        if (user) {
            req.user = user
            next();
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "error" })
    }
}


let checkAuth = async(req, res, next) => {
    try {
        var token = req.cookies.token
        let decodeAccount = jwt.verify(token, 'minhson')
        let user = await AccountModel.findOne({ _id: decodeAccount._id }).lean();
        if (user) {
            next();
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/')
    }
}

let checkAdmin = (req, res, next) => {
    if (req.userLocal.role === "admin") {
        next()
    } else {
        res.redirect('/')
    }
}
let checkCoordinator = (req, res, next) => {
    if (req.userLocal.role === "coordinator") {
        next()
    } else {
        res.redirect('/')
    }
}
let checkStudent = (req, res, next) => {
    if (req.userLocal.role === "student") {
        next()
    } else {
        res.redirect('/')
    }
}
module.exports = {
    checkLogin,
    checkAdmin,
    checkAuth,
    checkCoordinator,
    checkStudent,
    checkAuth
}