const ToDoListModel = require('../models/toDoListModel');

//create TODO
const createToDo = async (req, res) => {
    const { ToDoSubject, ToDoDescription, ToDoStatus } = req.body;

    let ToDoCreateDate = Date.now();
    let ToDoUpdateDate = Date.now();

    //validation
    if (!ToDoSubject || !ToDoStatus) {
        res.status(400).json({
            status: "fail", message: "Please fill in the required fields"
        });
    }

    const toDo = await ToDoListModel.create({
        user: req.user.id,
        ToDoSubject,
        ToDoDescription,
        ToDoStatus,
        ToDoCreateDate,
        ToDoUpdateDate
    });

    res.status(201).json(toDo);

};

//select TODO
const selectToDo = async (req, res) => {
    const toDo = await ToDoListModel.find({ user: req.user.id }).sort("-ToDoCreateDate");
    res.status(200).json(toDo);
}

//update TODO
const updateToDo = async (req, res) => {
    const { ToDoSubject, ToDoDescription } = req.body;
    const { id } = req.params;
    let ToDoUpdateDate = Date.now();

    const toDo = await ToDoListModel.findById(id);

    //if todo does not exit
    if (!toDo) {
        res.status(404).json({
            status: "fail", message: "ToDo does not exits"
        });
    }

    if (toDo.user.toString() !== req.user.id) {
        res.status(401).json({
            status: "fail", message: "User not authorized"
        });
    }

    //update
    await ToDoListModel.findByIdAndUpdate(
        { _id: id },
        {
            ToDoSubject,
            ToDoDescription,
            ToDoUpdateDate
        }
    );
    res.status(200).json({ status: "true", message: "ToDo Updated" });
}

//updatestatus TODO
const updateStatusToDo = async (req, res) => {
    const { ToDoStatus } = req.body;
    const { id } = req.params;
    let ToDoUpdateDate = Date.now();

    const toDo = await ToDoListModel.findById(id);

    //if todo does not exit
    if (!toDo) {
        res.status(404).json({
            status: "fail", message: "ToDo does not exits"
        });
    }

    if (toDo.user.toString() !== req.user.id) {
        res.status(401).json({
            status: "fail", message: "User not authorized"
        });
    }

    //update
    await ToDoListModel.updateOne(
        { _id: id },
        {
            ToDoStatus,
            ToDoUpdateDate
        }
    );
    res.status(200).json({ status: "true", message: "ToDoStatus Updated" });
}

//remove TODO
const removeToDo = async (req, res) => {
    const { id } = req.params;
    const toDo = await ToDoListModel.findById(id);

    if (!toDo) {
        res.status(404).json({
            status: "fail", message: "ToDo does not exits"
        });
    }

    if (toDo.user.toString() !== req.user.id) {
        res.status(401).json({
            status: "fail", message: "User not authorized"
        });
    }

    await ToDoListModel.remove({ _id: id });
    res.status(200).json({ message: "ToDo Deleted" });
}

//select TODO by Status
const selectToDoByStatus = async (req, res) => {
    let user = req.user.id
    let ToDoStatus = req.body['ToDoStatus']
    const toDo = await ToDoListModel.find({ user: user, ToDoStatus: ToDoStatus }).sort("-ToDoCreateDate");
    res.status(200).json(toDo);
}
module.exports = {
    createToDo,
    selectToDo,
    updateToDo,
    updateStatusToDo,
    removeToDo,
    selectToDoByStatus
}