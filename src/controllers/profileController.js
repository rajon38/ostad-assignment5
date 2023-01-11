const profileModel = require('../models/profileModel');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
//generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "7d" });
};

//register User
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400).json({
            status: "fail",
            message: "Please fill in all required fields"
        });
    }
    if (password.length < 6) {
        res.status(400).json({
            status: "fail",
            message: "Password must be up to 6 characters"
        });
    }

    // Check if user email already exists
    const userExists = await profileModel.findOne({ email });

    if (userExists) {
        res.status(400).json({
            status: "fail",
            message: "Email has already been registered"
        });
    }

    // Create new user
    const user = await profileModel.create({
        name,
        email,
        password,
    });

    //   Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 1000 * 86400), // 7 day
        sameSite: "none",
        secure: true,
    });

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400).json({
            status: "fail",
            message: "Invalid user data"
        });
    }
};

//LogIn User
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    //validate request
    if (!email || !password) {
        res.status(400).json({
            status: "fail",
            message: "Please add Email & Password"
        });
    }

    //check if user exists
    const user = await profileModel.findOne({ email });

    if (!user) {
        res.status(400).json({
            status: "fail",
            message: "User not found, please signup"
        });
    }

    //User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //generate Token
    const token = generateToken(user._id);

    //Send HTTP-Only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none"
    });

    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token
        });
    } else {
        res.status(400).json({
            status: "fail",
            message: "Invalid email or password"
        })
    }
};

//Logout User
const userLogout = async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none"
    });
    return res.status(200).json({
        status: "success",
        message: "Successfully Logged Out"
    });
};

//get user data
const getUser = async (req, res) => {
    const user = await profileModel.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio
        });
    } else {
        res.status(400).json({
            status: "fail",
            message: "User not Found"
        })
    }
};

//update user
const updateUser = async (req, res) => {
    const user = await profileModel.findById(req.user._id);

    if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updateUser = await user.save();
        res.status(200).json({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email,
            photo: updateUser.photo,
            phone: updateUser.phone,
            bio: updateUser.bio
        });
    } else {
        res.status(404).json({
            status: "fail",
            message: "User not found"
        });
    }
};

//change password
const changePassword = async (req, res) => {
    const user = await profileModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;

    if (!user) {
        res.status(400).json({
            status: "fail",
            message: "User not found, please signup"
        });
    }

    //validate
    if (!oldPassword || !newPassword) {
        res.status(400).json({
            status: "fail",
            message: "Please add old and new password"
        });
    }

    //check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    //save new password
    if (user && passwordIsCorrect) {
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "Password change successful"
        });
    } else {
        res.status(400).json({
            status: "fail",
            message: "Old password is incorrect"
        });
    }
};

//forget password
const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const user = await profileModel.findOne({ email });

    if (!user) {
        res.status(404).json({
            status: "fail",
            message: "user does not exist"
        })
    }

    // Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    // Create Reste Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // Hash token before saving to DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Save Token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
    }).save();

    // Construct Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Reset Email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>  
        <p>This reset link is valid for only 30minutes.</p>
        <a href=${resetUrl}_clicktracking=off>${resetUrl}</a>
        <p>Regards...</p>
        <p>Pinvent Team</p>
      `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({
            status: "success",
            message: "Reset Email Sent"
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: "Email not sent, please try again"
        });
    }
};

// reset password
const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        res.status(404).json({
            status: "fail",
            message: "Invalid or Expired Token"
        });
    }

    // Find user
    const user = await profileModel.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
        status: "success",
        message: "Password Reset Successful, Please Login"
    });
};

module.exports = {
    registerUser,
    userLogin,
    userLogout,
    getUser,
    updateUser,
    changePassword,
    forgetPassword,
    resetPassword
}