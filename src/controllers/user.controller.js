import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User registered successfully"
    });
});


const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User logged in successfully"
    });
});

export {registerUser, loginUser };