import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "User registered successfully"
    });
});


// const loginUser = asyncHandler(async (req, res, next) => {
//     res.status(200).json({
//         success: true,
//         message: "User logged in successfully"
//     });
// });

export {registerUser };