const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {Schema} = mongoose;

const UserSchema = Schema({
    name:{
        type: String,
        required: [true, "Please Add a Name"]
    },
    email:{
        type: String,
        required: [true,"Please add an Email"],
        unique: true,
        trim: true,
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email"],
    },
    password:{
        type: String,
        required:[true,"Please add a password"],
        minLength:[6, "Password must be up to 6 characters"]
    },
    photo:{
        type: String,
        required:[true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone:{
        type: String,
        default: "+880"
    },
    bio:{
        type:String,
        maxLength:[250, "Bio must not be more than 250 characters"],
        default: "bio"
    }
},
{versionKey:false});




//Encryot password before saving DB
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next;
    }

//Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(this.password, salt);
this.password = hashedPassword;
next();    
});




const profileModel = mongoose.model("profiles", UserSchema);
module.exports=profileModel;