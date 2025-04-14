import { Application, NextFunction, Request, Response } from "express";
import { Http } from "./Utils/enums";
import user from "./Router/userRouter"
import staff from "./Router/staffRouter"
import admin from "./Router/adminRouter"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { mainError } from "./error/mainError";
import { handleError } from "./error/handleError";
dotenv.config();

export const mainApp = (app: Application) => {
    try {
        app.use('/nicohelps/api', user)
        app.use('/nicohelps/api', staff)
        app.use('/nicohelps/api', admin)
        app.get("/", (req: Request, res: Response) => {
            try {
                return res.status(Http.Ok).json({
                    message: "Welcome to NicoHelps Api 🧨🧨🎁"
                })
            } catch (error) {
                res.status(Http.Server_Error).json({
                    message: "Default error "
                })
            }
        });

        const mongoClientUri = process.env.MONGO_DB_URL_ONLINE!;


        app.get("/oplog", async (req: Request, res: Response) => {
            const client = new MongoClient(mongoClientUri);

            try {
                await client.connect();
                const localDB = client.db("local");
                const oplogCollection = localDB.collection("oplog.rs");

                const oplogEntries = await oplogCollection
                    .find()
                    .sort({ $natural: -1 })
                    .limit(10)
                    .toArray();
                res.json(oplogEntries);
            } catch (error) {
                res.status(500).json({ error: "Error fetching oplog", details: error });
            } finally {
                await client.close();
            }
        });

        app.all("*", (req: Request, res: Response, next: NextFunction) => {
            next(
                new mainError({
                    name: `Route Error`,
                    message: `Route Error: This page, ${req.originalUrl} does not exist`,
                    status: Http.Bad,
                    success: false,
                })
            );
        });

        app.use(handleError);
    } catch (error) {
        console.error()
        return error
    }

}