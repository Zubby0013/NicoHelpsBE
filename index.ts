import cors from "cors";
import env from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import { mainApp } from "./mainApp";
import { dbConfig } from "./Utils/dbConfig";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import MongoDB from "connect-mongodb-session";
env.config()

const MongoDBStore = MongoDB(session);
const store = new MongoDBStore({
    uri: process.env.MONGO_DB_URL_ONLINE!,
    collection: "sessions",
});

const app: Application = express();
const port = parseInt(process.env.PORT!);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", process.env.APP_URL_DEPLOY!);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(
    cors({
        origin: [process.env.APP_URL_DEPLOY!],
        credentials: true,
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 24 * 60,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            domain: process.env.APP_URL_DEPLOY! || process.env.APP_URL!,
        },
        store,
    })
);

app.use(cookieParser(process.env.SESSION_SECRET!));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

mainApp(app);

const server = app.listen(port, () => {
    console.clear();

    console.log("Loading . . . . . . . .");

    setTimeout(() => {
        console.log(
            `Server Connected Successfully On Port ${process.env.PORT!} 🔥🔥`
        );

        const memoryUsage = process.memoryUsage();
        const rssInMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);

        console.log("Current Heap, Memory, and Process Usage (in MB):");
        console.log({
            residentSetSize: `${rssInMB} MB`,
            heapTotal: `${(memoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`,
            externalMemory: `${(memoryUsage.external / (1024 * 1024)).toFixed(2)} MB`,
        });

        if (Number(rssInMB) > 512) {
            console.warn(
                `⚠️ WARNING: Memory usage exceeded the 512MB limit! Current RSS: ${rssInMB} MB`
            );
        } else {
            console.log(
                `✅ You're on track! Current RSS: ${rssInMB} MB out of 512MB.`
            );
        }

        dbConfig();
        clearTimeout;
    }, 2000);
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