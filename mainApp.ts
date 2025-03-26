import { Application, Request, Response } from "express";
import { Http } from "./Utils/enums";
import user from "./Router/userRouter"
import staff from "./Router/staffRouter"
import admin from "./Router/adminRouter"

export const mainApp = (app: Application) => {
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
}