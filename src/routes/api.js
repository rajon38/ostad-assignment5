const express = require("express");
const {
    registerUser,
    userLogin,
    userLogout,
    getUser,
    updateUser,
    changePassword,
    forgetPassword,
    resetPassword
} = require("../controllers/profileController");
const protect = require("../middleware/AuthVerify")
const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/userLogin", userLogin);
router.get("/userLogout", userLogout);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);
router.patch("/changePassword", protect, changePassword);
router.post("/forgetPassword", forgetPassword);
router.put("/resetPassword/:resetToken", resetPassword);

module.exports = router;