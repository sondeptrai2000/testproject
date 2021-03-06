const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
var jwt = require('jsonwebtoken');


class studentController {
    studentHome(req, res) {
        res.json('Trang chủ student')
    }

    async myAttended(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            var data = await ClassModel.findOne({ _id: req.query.classID }, { schedule: 1 }).lean();
            res.json({ msg: 'success', data: data, studentID: account._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });

        }
    }

    allClass(req, res) {
        var params = req.params.id
        var studentName = req.cookies.username
        if (params != "0") return res.render('student/allClass', { params, studentName })
        if (params == "0") return res.render('student/allClass', { studentName })
    }


    async getClass(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            var classInfor = await ClassModel.find({ "studentID.ID": account._id }).populate("teacherID", { username: 1 }).lean();
            res.json({ msg: 'success', classInfor, studentID: account._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    getTeacherProfile(req, res) {
        AccountModel.find({ _id: req.query.abc }, { username: 1, email: 1, avatar: 1 }).lean().exec(function(err, data) {
            if (err) {
                return res.json({ msg: 'error' });
            } else {
                return res.json({ msg: 'success', data: data });
            }
        })
    }

    allClassStudent(req, res) {
        ClassModel.find({ _id: req.query.abc }).populate('studentID.ID', { username: 1, email: 1, avatar: 1 }).lean().exec((err, selectedClassInfor) => {
            if (err) {
                return res.json({ msg: 'error' });
            } else {
                return res.json({ msg: 'success', data: selectedClassInfor });
            }
        })
    }

    async getSchedule(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            var classInfor = await ClassModel.find({ "studentID.ID": account._id }).lean()
            return res.json({ msg: 'success', classInfor, studentID: account._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

}
module.exports = new studentController