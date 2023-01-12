const mongoose = require('mongoose');

const DataSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    ToDoSubject: {
        type: String,
        required: true
    },
    ToDoDescription: {
        type: String,
        default: "Description"
    },
    ToDoStatus: {
        type: String,
        required: true
    },
    ToDoCreateDate: {
        type: Date
    },
    ToDoUpdateDate: {
        type: Date
    }
},
    { versionKey: false });

const ToDoListModel = mongoose.model('todolists', DataSchema);
module.exports = ToDoListModel;