import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../model/user.model.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { upload } from '../middlewares/multer.middlewares.js';
import mongoose from 'mongoose';


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);


        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, 'Failed to generate tokens');
    }

};

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
    const { username, email, password, fullName } = req.body;
    if ([username, email, password, fullName].some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username }],
        });

    if (existedUser) {
        throw new ApiError(409, 'User already exists');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar are required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log('Avatar-------------', avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, 'Failed to upload avatar-----');
    }

    const user = await User.create({
        fullName,
        avatar: avatar,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase(),
    });


    const createdUser = await User.findById(user._id)
        .select('-password -refreshToken');         //  select the field which we do not  want to show

    if (!createdUser) {
        throw new ApiError(500, 'Failed to create user');
    }

    return res.status(201).json(new ApiResponse(
        201, 'User created successfully', createdUser,
    ));
});

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //  user or email, password not empty
    //   check if user exists
    //  password check
    //  access token, refresh token generation
    //  send cookie with refresh token(secured cookies)

    const { username, email, password } = req.body;
    console.log('Username, email, password', username, email, password);

    // if([username, email, password].some((field) => field?.trim() === "")){
    //     throw new ApiError(400, "All fields are required");
    // }

    if (!(username || email) || !password) {
        throw new ApiError(400, 'All fields are required');
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loginUser = await User.findById(user._id).select('-password -refreshToken');

    const option = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
        .cookie('accessToken', accessToken, option)
        .cookie('refreshToken', refreshToken, option)
        .json(new ApiResponse(200,
            {
                user: loginUser, accessToken, refreshToken,
            },
            'User logged in successfully',
        ));
});

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1,   // remove  the feild from db
        },
    }, { new: true });

    const option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie('accessToken', option)
        .clearCookie('refreshToken', option)
        .json(new ApiResponse(200, 'User logged out successfully'));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthenticated request');
    }
    try {
        //  verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        if (!decodedToken) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(404, 'Invalid  refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is invalid or used');
        }

        const option = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie('accessToken', accessToken, option)
            .cookie('refreshToken', newRefreshToken, option)
            .json(new ApiResponse(200,
                { accessToken, refreshToken: newRefreshToken },
                'Access token refreshed successfully',
            ));

    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token');
    }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid old password');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, 'Password changed successfully'));


});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, 'User details fetched successfully');
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, username, email } = req.body;

    if (!fullName || !username || !email) {
        throw new ApiError(400, 'All fields are required');
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, email, username,
            },
        },
        { new: true },     // new true means update value will return
    ).select('-password');

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'Account details updated successfully'));

});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(401, 'Avatar file is missing');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(401, 'Error while uploading on Avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url,
        },
        { new: true },
    ).select('-password');

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'avatar updated successfully '));

    //  delete old avatar from cloudinary


});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(401, 'Cover image  file is missing');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(401, 'Error while uploading on Avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url,
        },
        { new: true },
    ).select('-password');

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'CoverImage updated successfully '));


});

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, 'Username is required');
    }

    // aggregation pipeline to get user details and videos

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: 'subscription',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
            },
        },
        {
            $lookup: {
                from: 'subscription',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribeTo',
            },
        },
        {
            $addFields: {
                subscriberCount: { $size: '$subscribers' },
                subscribeToCount: { $size: '$subscribeTo' },
            },
            isSubscribed: {
                $cond: {
                    if: {
                        $in: [req.user?._id, '$subscribers.subscriber'],  //in use in array or object both
                    },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscribeToCount: 1,
                isSubscribed: 1,
                email: 1,
                createdAt: 1,

            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, 'Channel not found');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], 'Channel details fetched successfully'),
        );

});


const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id), //convert string to object id
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner',

                            },
                        },
                    },


                ],
            },
        },
        {},
        {},


        {},
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, 'Watch history fetched successfully'),
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};