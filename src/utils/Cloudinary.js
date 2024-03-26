import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFIlePath) =>{
    try {
        if(!localFIlePath) return null;
    //     upload file on cloudinary
        const response =  await cloudinary.uploader.upload(localFIlePath,{
            resource_type:"auto",

        })
        console.log("File uploaded Successfully on cloudinary",response.url);
        return response.url;

    } catch (error){
        fs.unlinkSync(localFIlePath);   // remove file from local storage as operation failed
        return null;
    }
}

export {uploadOnCloudinary};