import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: DB_NAME // Optionally specify the database name
        });
        console.log(`Connected to the database: ${connectionInstance.connection.host}`);
        // console.log("Database name: ", connectionInstance);
    } catch (error) {
        console.log("Error: ", error);
        throw error;
        process.exit(1);
    }
}

export default connectDb;