import cors from "cors";
import env from "dotenv";
import express, { Application } from "express";
import { mainApp } from "./mainApp";
import { dbConfig } from "./Utils/dbConfig";
env.config()

const app: Application = express();
const Port = parseInt(process.env.PORT!)

app.use(cors());
app.use(express.json());

mainApp(app)

const server = app.listen(Port, () => {
    console.log("server is up and running", Port);
    dbConfig()
});

process.on("uncaughtException", (error: Error) => {
    console.log("uncaughtException", error);

    process.exit(1);
})

process.on("unhandledRejection", (reason: any) => {
    console.log("unhandledRejection", reason);

    server.close(() => {
        process.exit(1);
    })
})