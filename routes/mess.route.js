var express = require('express');
var messRoute = express.Router();
const messController = require('../controller/mess.controller');

const { checkAuth } = require('../middleware/index');

messRoute.use(checkAuth);

messRoute.post('/makeConnection', messController.makeConnection, messController.chatForm)
messRoute.get('/getMessenger', messController.getMessenger)
messRoute.get('/chatForm', messController.chatForm)
messRoute.post('/addChat', messController.addChat)
messRoute.get('/unreadMess', messController.unreadMess)

module.exports = messRoute