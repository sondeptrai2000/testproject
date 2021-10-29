const { JsonWebTokenError } = require('jsonwebtoken');
const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
var jwt = require('jsonwebtoken');


class guardianController {
    guardianHome(req, res) {

        res.json('Trang chủ guardian')
    }

    async myAttended(req, res) {
        try {
            //lấy _Id của học sinh
            let studentID = req.cookies.student;
            let decodeAccount = jwt.verify(studentID, 'minhson');
            //lấy lịch học
            var data = await ClassModel.findOne({ _id: req.query.classID }, { schedule: 1 }).lean();
            return res.json({ msg: 'success', data: data, studentID: decodeAccount._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });

        }
    }

    allClass(req, res) {
        var params = req.params.id
        var studentName = req.cookies.username
        if (params != "0") return res.render('guardian/allClass', { params, studentName })
        if (params == "0") return res.render('guardian/allClass', { studentName })
    }


    async getClass(req, res) {
        try {
            //lấy _Id của học sinh
            let studentID = req.cookies.student;
            let decodeAccount = jwt.verify(studentID, 'minhson');
            //lấy lớp học sinh đã và đang học
            var classInfor = await ClassModel.find({ "studentID.ID": decodeAccount._id }).populate("teacherID", { username: 1 }).lean();
            return res.json({ msg: 'success', classInfor, studentID: decodeAccount._id });
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
            //lấy _Id của học sinh
            let studentID = req.cookies.student;
            let decodeAccount = jwt.verify(studentID, 'minhson');
            var sosanh = new Date(req.query.dauTuan);
            //lấy lịch trình học tập của tuần hiện tại
            var classInfor = await ClassModel.find({ "studentID.ID": decodeAccount._id, startDate: { $lte: sosanh }, endDate: { $gte: sosanh } }).lean()
            return res.json({ msg: 'success', classInfor, studentID: decodeAccount._id });
        } catch (e) {
            console.log(e)
            return res.json({ msg: 'error' });
        }
    }

}
module.exports = new guardianController