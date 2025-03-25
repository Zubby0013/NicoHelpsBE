import { error } from "console";
import env from "dotenv";
import { connect, Error } from "mongoose";

env.config()

export const dbConfig = async () => {
    try {
        return await connect('mongodb://localhost:27017/nicohelpsDB').then(() => {
            console.log("Database Connected ⚡⚡");
        }).catch((error: Error) => console.error());
    } catch (error) {
        console.error()
        return error
    }
}