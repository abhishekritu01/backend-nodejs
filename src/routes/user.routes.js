import { Router } from 'express';
import {
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
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJwt } from '../middlewares/auth.middleweres.js';


const router = Router();

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser);

router.route('/login').post(loginUser);

// secure route
router.route('/logout').post(verifyJwt, logoutUser);

router.route('/refresh-token').post(refreshAccessToken);  // refresh token

router.route('change-password').post(verifyJwt, changeCurrentPassword);  // change password

router.route('getCurrentUser').get(verifyJwt, getCurrentUser);  // get current user

router.route('updateAccountDetails').patch((updateAccountDetails));  // update account details

router.route('/avatar').patch(upload.single('avatar'), verifyJwt, updateUserAvatar);  // update avatar

router.route('/cover-image').patch(upload.single('coverImage'), verifyJwt, updateUserCoverImage);  // update cover image

router.route('/c/:username').get(getUserChannelProfile); // get user channel profile     /c/:username  used for channel profile

router.route('watch-History').get(verifyJwt, getWatchHistory);  // get watch history

export default router;