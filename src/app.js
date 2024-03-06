import { urlencoded } from 'express';
import express from 'express';
import cors from 'cors';
import cookiParser from 'cookie-parser';

const app = express();

// cors is used to allow the request from different origin to access the resources
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})); 

//  express.json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object.
app.use(express.json({ 
    limit: "30kb"
}));

// urlencoded is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. from url
app.use(express.urlencoded({extended: true,limit: "30kb"}));

// static files are served from the public folder
app.use(express.static("public"));

// cookie parser is used to parse the cookies from the request headers and populate req.cookies 
app.use(cookiParser());

export { app};