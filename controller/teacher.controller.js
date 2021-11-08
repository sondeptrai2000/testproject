const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
const assignRoomAndTimeModel = require('../models/assignRoomAndTime');
const studyRouteModel = require('../models/studyRoute');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

// set up mail sever
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: 'sownenglishedu@gmail.com', pass: 'englishwithsown' },
    tls: { rejectUnauthorized: false }
});

class teacherController {
    async teacherHome(req, res) {
        try {
            res.render('teacher/teacherHome')
        } catch (e) {
            console.log(e)
            res.json("lỗi")
        }
    }

    //tìm kiến 1 lơps học
    async searchClass(req, res) {
        try {
            console.log(req.query.className);
            var classInfor = await ClassModel.findOne({ className: req.query.className }).lean();
            console.log(classInfor)
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json("lỗi")
        }
    };

    async allClass(req, res) {
        try {
            var params = req.params.id
            var teacherName = req.cookies.username
            if (params != "0") return res.render('teacher/allClass', { params, teacherName })
            if (params == "0") return res.render('teacher/allClass', { teacherName })
        } catch (e) {
            console.log(e)
            res.json("lỗi")
        }
    };
    //đếm số lượng lớp dựa trên trạng thái của lớp học
    async countClass(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //số lớp hiển thị trên 1 trang
            var classPerPage = 20
            var numberOfClass = await ClassModel.find({ teacherID: account, classStatus: req.query.status }, { _id: 1 }).lean().countDocuments()
            var soTrang = numberOfClass / classPerPage + 1
            res.json({ msg: 'success', soTrang, numberOfClass });
        } catch (e) {    
            console.log(e)
            res.json({ msg: 'error' });
        }
    };

    //lấy tất cả cacs lớp đang hoạt động
    async getAllClass(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //số lớp trên 1 trang
            var classPerPage = 20
            var skip = classPerPage * parseInt(req.query.page)
            var classInfor = await ClassModel.find({ teacherID: account, classStatus: req.query.status }, { schedule: 0, studentID: 0, classStatus: 0 }).skip(skip).limit(classPerPage).lean();
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    };

    async getSchedule(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //lấy thời điểm đầu tuần để lấy khóa học đang hoạt động trong khoảng thời gian đó. 
            var sosanh = new Date(req.query.dauTuan)
            var classInfor = await ClassModel.find({ teacherID: account, startDate: { $lte: sosanh }, endDate: { $gte: sosanh } }, { className: 1, schedule: 1 });
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async attendedListStudent(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.idClass }, { schedule: { $elemMatch: { _id: req.query.idattend } } }, { schedule: 1 }).populate({ path: "schedule.attend.studentID", select: "username avatar" }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doTakeAttended(req, res) {
        try {
            var now = new Date();
            //cập nhật điểm danh cho học sinh
            await ClassModel.updateOne({ _id: req.body.idClass, "schedule._id": req.body.schedule }, { $set: { "schedule.$.attend": req.body.attend, "schedule.$.status": "success" } });
            //nếu là lịch học đã được update (giáo viên bận và đã được chuyển lịch dạy sang ngày khác thì chuyển trạng thái của phòng đó thành none để thành phòng trống)
            if (req.body.scheduleStatus == 'update') await assignRoomAndTimeModel.updateOne({ dayOfWeek: req.body.scheduleDay, room: { $elemMatch: { room: req.body.scheduleRoom, time: req.body.scheduleTime } } }, { $set: { "room.$.status": "None" } });
            //nếu đó là buổi học cuối cùng (so sánh time) thì sẽ chuyển trạng thái các phòng của lớp đó thành none 
            var theLastCourse = new Date(req.body.lastDate.split("T00:00:00.000Z")[0]);
            if (now >= theLastCourse) {
                //chuyển phòng thành none 
                for (var i = 0; i < req.body.time.length; i++) { await assignRoomAndTimeModel.update({ dayOfWeek: req.body.day[i], room: { $elemMatch: { room: req.body.room[i], time: req.body.time[i] } } }, { $set: { "room.$.status": "None" } }) }
                //cập nhật trạng thái của lớp là đã kết thúc
                await ClassModel.updateOne({ _id: req.body.idClass }, { classStatus: 'Finished' });
            }
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async studentAssessment(req, res) {
        try {
            //thông tin lớp học
            var classInfor = req.body.classInfor;
            // cập nhật điểm, đánh giá của giáo viên về học sinh trong lớp
            await ClassModel.updateOne({ _id: req.body.classID, 'studentID.ID': req.body.studentId }, {
                $set: { "studentID.$.grade": req.body.grade, "studentID.$.feedBackContent": req.body.comment }
            });
            // cập nhật thông tin về tiến độ của học sinh trong bảng thông tin cá nhân
            await AccountModel.updateOne({ _id: req.body.studentId }, { studentStatus: "studying", "$set": { "progess.$[progess].stageClass.$[stageClass].status": req.body.grade } }, {
                "arrayFilters": [{ "progess.stage": classInfor[2] }, { "stageClass.classID": req.body.classID }]
            });
            // lấy tiến độ học tập của học sinh từ bảng thông tin cá nhân
            var progess = await AccountModel.findOne({ _id: req.body.studentId }, { progess: 1, aim: 1, email: 1, username: 1, stage: 1 });
            //lấy số lượng pass các khóa học để so sánh với số lượng class trong giai đoạn. == thì đã hoàn thành hết các lớp trong giai đoạn đó và sẽ tiến hành chuyển tiépe giai đoạn 
            var Passed = 0;
            //đếm số môn đã Pass để xét chuyển giai đoạn
            progess.progess.forEach((e, index) => { if (e.stage == classInfor[2]) e.stageClass.forEach((check, index) => { if (check.status != "Restudy" && check.status != "studying") Passed++ }) });
            // lấy lộ trình mà học sinh đang theo học để xem xét chuyển giai đoạn
            var route = await studyRouteModel.findOne({ routeName: classInfor[1] }, { routeSchedual: 1 })
            var indexOfNextClass;
            //số môn học trong 1 giai đoạn
            var numberOfSubject;
            route.routeSchedual.forEach((e, index) => {
                if (e.stage == classInfor[2]) {
                    numberOfSubject = e.routeabcd;
                    indexOfNextClass = index + 1;
                }
            });
            //Nếu học sinh trượt môn mà trước đó giáo viên đã chấm qua môn ( chức năng update grade ) và chuyển giai đoạn
            if (req.body.grade == "Restudy") {
                if (progess.stage != classInfor[2]) {
                    console.log("Restudy")
                        // cập nhật lại thông tin về các giao đoạn trước đó
                    var preStage = route.routeSchedual[indexOfNextClass - 1].stage;
                    //xóa classID vào bảng thông tin lộ trình của các học sinh ( progess)
                    await AccountModel.updateOne({ _id: req.body.studentId }, { stage: preStage, $pull: { progess: { stage: progess.stage } } });
                }
            } else {
                //xem xét chuyển giai đoạn hoặc tiếp tục các môn tiếp theo
                //check xem học sinh đã hoàn thành các lớp của giai đoạn hiện tại chưa
                console.log(Passed)
                if (Passed == numberOfSubject.length + 1) {
                    //kiểm tra xem lộ trình học của học sinh đã kết thúc chưa. Check theo aim mà học sinh đã đăng ký.
                    if (classInfor[2] == progess.aim) {
                        await AccountModel.updateOne({ _id: req.body.studentId }, { studentStatus: "end" })
                        var content = progess.username + " have completed the registration course. Route: " + classInfor[1] + ". Stage: " + classInfor[2] + ". Please contact the center to confirm the information.";
                        var mainOptions = { from: 'sownenglishedu@gmail.com', to: progess.email, subject: 'Notification', text: content }
                        await transporter.sendMail(mainOptions)
                    } else {
                        // chuyển giai đoạn tiếp theo
                        var nextStage = route.routeSchedual[indexOfNextClass].stage
                        await AccountModel.updateOne({ _id: req.body.studentId }, { stage: nextStage, $push: { progess: { stage: nextStage, stageClass: [{ classID: "", name: "", status: "Pass" }] } } })
                    }
                }
            }
            res.json({ msg: 'success' });
        } catch (e) {
            res.json({ msg: 'error' });
        }
    }

    async allClassStudent(req, res) {
        try {
            var selectedClassInfor = await ClassModel.find({ _id: req.query.abc }, { studentID: 1 }).populate('studentID.ID', { avatar: 1, username: 1, aim: 1, email: 1 }).lean();
            res.json({ msg: 'success', data: selectedClassInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async attendedList(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.id }, { "schedule.date": 1, "schedule._id": 1, "schedule.day": 1, "schedule.room": 1, "schedule.status": 1, "schedule.time": 1 }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }
}



module.exports = new teacherController