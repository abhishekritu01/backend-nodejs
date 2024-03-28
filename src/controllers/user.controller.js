import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../model/user.model.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
//     steps to check user registration
//     1. get the user data from the request body
//     2.check data validation using joi || data is empty ?
//     3. check if the user is already registered|| username or email already exists
//     4. check for images and  avatar
//     5. upload the image to the cloudinary
//     6. hash the password
//     7. create user object  ----> create entry in the database
//     8. remove password and refresh token field from the response
//     9. check for user creation success
//     10. return the response
    const {  username, email, password, fullName } = req.body;
    if ([ username, email, password, fullName].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // const existedUser = await User.findOne({ email });
    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username}]
        })

    if (existedUser) {
         throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath ){
        throw new ApiError(400, "Avatar are required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }

//      create user obj
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImageUrl?.url ||""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(new ApiResponse(
        201, "User created successfully", createdUser
    ));



} );


const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User logged in successfully"
    });
});

export {registerUser, loginUser }