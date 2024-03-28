import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../model/user.model.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
// get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {  username, email, password, fullName } = req.body;
    if ([ username, email, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username}]
        })

    if (existedUser) {
         throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avatarLocalPath ){
        throw new ApiError(400, "Avatar are required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar-------------", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar-----");
    }

    const user = await User.create({
        fullName,
        avatar: avatar,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
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