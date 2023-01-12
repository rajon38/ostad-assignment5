const express = require("express");
const protect = require("../middleware/AuthVerify");
const { createToDo,
    selectToDo,
    updateToDo,
    updateStatusToDo,
    removeToDo,
    selectToDoByStatus
} = require('../controllers/toDoListController');
const router = express.Router();

router.post("/createToDo", protect, createToDo);
router.get("/selectToDo", protect, selectToDo);
router.patch("/updateToDo/:id", protect, updateToDo);
router.patch("/updateStatusToDo/:id", protect, updateStatusToDo);
router.delete("/removeToDo/:id", protect, removeToDo);
router.get("/selectToDoByStatus", protect, selectToDoByStatus);



module.exports = router;