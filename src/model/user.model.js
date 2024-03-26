import mongoose ,{ Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,  // Cloudinary image URL
        required: true,
    },
    coverImage:{
        type: String,  // Cloudinary image URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
        // required: false
    },
}, {timestamps: true});

// we will use this method to generate the token and not use arrow function because we need to access the user object using this
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();

    // try{
    //     const salt = await bcrypt.genSalt(10);
    //     this.password = await bcrypt.hash(this.password, salt);
    //     next();
    // }catch(error){
    //     next(error);
    // }
});


userSchema.methods.isPasswordMatch = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// -----------------------------use of jwt

// access token
userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        // 1. payload  2. secret key  3. options
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE
        }
    )
}
// refresh token
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE
        }
    )
}

const User = mongoose.model("User", userSchema);