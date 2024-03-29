import {Router} from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJwt } from '../middlewares/auth.middleweres.js';


const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}

    ]),
    registerUser);
router.route("/login").get(loginUser);

// secure route
router.route("/logout").post(verifyJwt,logoutUser)

export default router;