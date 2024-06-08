import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

// cors is used to allow requests from different origins to access the resources
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Parse JSON requests
app.use(express.json({ limit: "30kb" }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

// Serve static files from the public folder
app.use(express.static("public"));

// Parse cookies from request headers
app.use(cookieParser());

// Import user routes
import userRouter from  "../src/routes/user.routes.js";

// use of imported routes
// in first use get request but we have to segregate  the routes  thats why we use app.use as middleware
app.use("/api/v1/users", userRouter);

export { app };
