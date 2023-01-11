const profileModel = require('../models/profileModel');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                status: "fail",
                message: "Not authorized, please login"
            });
        }

        //verify Token
        const verified = jwt.verify(token, process.env.JWT_TOKEN);

        //get user id from token
        const user = await profileModel.findById(verified.id).select("-password");

        if (!user) {
            res.status(401).json({
                status: "fail",
                message: "User not found"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: "fail",
            message: "Not authorized, please login"
        });
    }
}

module.exports = protect;