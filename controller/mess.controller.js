const AccountModel = require('../models/account')
const chatModel = require('../models/messenger');
var jwt = require('jsonwebtoken');

class messtController {
    //ấn chat vào người bất kỳ r dẫn đến form chat và lịch sử
    async makeConnection(req, res, next) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //kiểm tra xem đã trò chuyện với nhau chưa
            var condition1 = { person1: account._id, person2: req.body.studentID };
            var condition2 = { person1: req.body.studentID, person2: account._id };
            var check = await chatModel.findOne({ $or: [condition1, condition2] });
            //chưa thì sẽ tạo mới cuộc trò chuyện
            var now = Date().toString().split("GMT")[0];
            if (!check) {
                await chatModel.create({ person1: account._id, person2: req.body.studentID, message: { ownermessenger: "Hệ thống", messContent: "Đã kết nối! Ấn vào để chat", time: now } })
            } else {
                await chatModel.updateOne({ _id: check._id }, { updateTime: now });
            }
            next();
        } catch (e) {
            console.log(e)
            return res.json({ msg: 'user not found' })
        }
    }

    //render giao diện chat cùng với lịch sử chat
    async chatForm(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            // lấy tin nhắn cuối cùng trong mảng message để hiển thị trong lịch sử chat
            var data1 = await chatModel.find({ $or: [{ person1: account._id }, { person2: account._id }] }, { message: { $slice: -1 }, }).populate({ path: 'person1', select: ' username avatar' }).populate({ path: 'person2', select: ' username avatar' }).sort({ updateTime: -1 }).lean();
            if (data1.length == 0) return res.render("message/emptyChat.ejs", { role: account.role, senderName: account.username, senderAvatar: account.avatar, senderID: account._id });
            //xác định người gửi trong đoạn chat đầu tiên để hiển thị
            var listID = []
            data1.forEach(data => { listID.push(data._id) });
            if (account._id.toString() == data1[0].person1._id.toString()) {
                var formData = { senderID: data1[0].person1._id, senderName: data1[0].person1.username, receiverID: data1[0].person2._id, receiverName: data1[0].person2.username }
            } else {
                var formData = { senderID: data1[0].person2._id, senderName: data1[0].person2.username, receiverID: data1[0].person1._id, receiverName: data1[0].person1.username }
            }
            return res.render("message/chatBoxHistory.ejs", { data1, formData, listID, role: account.role })
        } catch (e) {   
            console.log(e) 
            return res.json('error')
        }
    };

    //lấy cuộc hội thoại
    async getMessenger(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //lấy trạng thái read của cuọc hồi thoại
            var chatInfor = await chatModel.findOne({ _id: req.query._idRoom }, { read: 1 }).lean();
            //lấy chưa read thì sẽ thêm id vào read để thành read (Note: cuộc trò chuyện có 2 người, nếu mảng read = 2 thì nghĩa là cả 2 đã đọc)
            if (!chatInfor.read.includes(account._id)) await chatModel.findOneAndUpdate({ _id: req.query._idRoom }, { $push: { read: account._id } });
            //trả về cuộc trò chuyện
            var data = await chatModel.findOne({ _id: req.query._idRoom }).populate({ path: 'person1', select: ' username avatar', }).populate({ path: 'person2', select: ' username avatar', }).lean()
            return res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e);
            return res.json({ msg: 'error' });
        }
    };
    //gửi thông báo số tin nhắn chưa đọc
    async unreadMess(req, res) {
        try {
            //lấy thông tin tài khoản từ middleware
            var account = req.userLocal;
            //lấy trạng thái read của cuọc hồi thoại
            let PMS = req.cookies.PMS;
            var unReadMess = await chatModel.find({ $or: [{ person1: account._id }, { person2: account._id }], read: { $nin: account._id } }).lean().countDocuments()
            return res.json({ msg: 'success', unReadMess, username: PMS.name });
        } catch (e) {
            console.log(e);
            return res.json({ msg: 'error' });
        }
    }

    async addChat(req, res) {
        try {
            //lấy thông tin người gửi và người nhận
            var condition = req.body.condition;
            var receiver = await AccountModel.findOne(condition, { username: 1, avatar: 1, chat: 1 }).lean();
            //lấy thông tin người dùng từ middleware
            var sender = req.userLocal
            if (receiver && receiver._id.toString() != sender._id.toString()) {
                //kiểm tra xem đã trò chuyện với nhau chưa
                var condition1 = { person1: sender._id, person2: receiver._id };
                var condition2 = { person1: receiver._id, person2: sender._id };
                var check = await chatModel.findOne({ $or: [condition1, condition2] });
                //nếu chưa sẽ tạo cuộc trò chuyện mới
                if (!check) {
                    var now = Date().toString().split("GMT")[0]
                    var createConnection = { person1: sender._id, person2: receiver._id, message: { ownermessenger: "Hệ thống", messContent: "Đã kết nối! Ấn vào để chat", time: now } }
                    var data = await chatModel.create(createConnection);
                    return res.json({ msg: 'createSuccess', receiver, idRoom: data._id });
                }
                return res.json({ msg: 'conversation is already exist ', receiverID: receiver._id, idRoom: check._id });
            }
            return res.json({ msg: 'user not found' })
        } catch (error) {
            console.log(error)
            return res.json({ msg: 'error' })
        }
    }
}

module.exports = new messtController;