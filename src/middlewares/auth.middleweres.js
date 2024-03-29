import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import { ApiError } from '../utils/ApiError.js';

export const verifyJwt=asyncHandler(async(req,res,next)=> {

   try{
       // const tocken = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
       const tocken = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","");

       if(!tocken){
           return res.status(401).json({message:"Unauthenticated"});
       }

       const decodedToken = jwt.verify(tocken, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
           if(err){
               throw new ApiError(401, "Unauthenticated");
           }
           req.user = user;
           next();
       });

       const user  = await User.findById(decodedToken._id)
           .select("-password -refreshToken")

       if(!user){
           throw new ApiError(404, "User not found");

       }
       req.user = user;
       next();

   }catch(error){
       throw new ApiError(401,error?.message ||"Unauthorized" );
   }

})