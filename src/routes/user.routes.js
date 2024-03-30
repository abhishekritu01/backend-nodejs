import {Router} from 'express';
import { registerUser, loginUser, logoutUser,refreshAccessToken  } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJwt } from '../middlewares/auth.middleweres.js';


const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}

    ]),
    registerUser);
router.route("/login").post(loginUser);

// secure route
router.route("/logout").post(verifyJwt,logoutUser)

router.route("/refresh-token").post(refreshAccessToken);  // refresh token

export default router;