var mongoose = require('mongoose');
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => handleError(error));
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    person1: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    person2: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    read: [{ type: String }],
    message: [{
        ownermessengerID: String,
        ownermessenger: String,
        messContent: String,
        time: { type: String }
    }],
    updateTime: { type: Date, default: Date.now }
}, { collection: 'chats' });

var chatModel = mongoose.model('chats', chatSchema);

module.exports = chatModel