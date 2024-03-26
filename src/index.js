/*
// -------------1 basic server setup----------------
import mongoose from 'mongoose';
import {DB_NAME} from  "./constants";
import express from 'express';

const app = express();

;(async ()=>{
    try{
        await mongoose.connect(`${process.env.DB_NAME}/${DB_NAME}`,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to the database");

        app.on("error", (err)=>{
            console.log("Error: ", err);
            throw err;
        });

        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        });
      
    }catch(error){
        console.log("Error: ", error);
        throw err;
    }
 
})();
*/


// -------------2 basic server setup----------------

// require('dotenv').config({path: "./.env"});
import express from 'express';
import dotenv from 'dotenv';
import connectDb from '../src/db/index.js';

dotenv.config({
    path: "./.env"
});

connectDb().then(()=>{
    const app = express();
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });

    //  check for the error
    app.on("error", (err)=>{
        console.log("Error: ", err);
        throw err;
    });

}).catch((error)=>{
    console.log("Mongo connection failed ", error);
    throw error;
});

const app = express();


