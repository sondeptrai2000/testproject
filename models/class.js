var mongoose = require('mongoose')
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => handleError(error));
const Schema = mongoose.Schema;
const classSchema = new Schema({
    className: String,
    routeName: String,
    stage: String,
    subject: String,
    description: String,
    timeToStudy: [{ type: String }],
    studentID: [{
        ID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
        grade: { type: String, default: "Has not been commented yet" },
        feedBackContent: { type: String, default: "Has not been commented yet" },
    }],
    teacherID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    schedule: [{
        date: Date,
        day: String,
        time: String,
        room: String,
        status: String,
        attend: [{
            studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
            comment: { type: String, default: "" },
            attended: { type: String }
        }]
    }],
    endDate: Date,
    startDate: Date,
    classStatus: { type: String, default: "Processing" },
}, { collection: 'class', timestamps: true });

var classModel = mongoose.model('class', classSchema)
module.exports = classModel