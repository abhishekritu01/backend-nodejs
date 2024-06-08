import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import { ApiError } from '../utils/ApiError.js';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    // never use thorw inside try catch block because it will not be caught by the error handler middleware
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            res.send(401).json({ message: "Invalid Token" });
        }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        throw new ApiError(401, error.message || "Unauthorized");
    }
});
