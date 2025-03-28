import { Request, Response } from "express";
import adminModel from "../Model/adminModel";
import userModel from "../Model/userModel";
import staffModel from "../Model/staffModel";
import staffPostModel from "../Model/staffPostModel";
import { Http } from "../Utils/enums";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;
        const id = crypto.randomBytes(3).toString("hex");

        const admin = await adminModel.create({ email, token: id });

        return res.status(Http.Created).json({
            message: "Admin account created.",
            data: admin,
            status: Http.Created,
        });
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Admin account not created.",
            data: error.message,
            status: Http.Bad,
        });
    }
}

export const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;
        const { adminID } = req.params;

        const admin = await adminModel.findById(adminID);
        if (!admin) {
            return res.status(Http.Bad).json({
                message: "Admin account not found.",
                status: Http.Bad,
            });
        }

        if (!token || admin.token !== token) {
            return res.status(Http.Bad).json({
                message: "Invalid token. Access denied.",
                status: Http.Bad,
            });
        }

        const verificationAdmin = await adminModel.findByIdAndUpdate(adminID,
            { verify: true, token: admin?.token },
            { new: true }
        )
        if (verificationAdmin) {
            const jwtToken = jwt.sign(
                { id: admin._id },
                process.env.JWT_SECRET!,
                {
                    expiresIn: "2d",
                }
            );

            // req.session.isAuth = true;
            // req.session.adminID = admin._id;

            return res.status(Http.Ok).json({
                message: "Admin Successfully Logged In",
                data: jwtToken,

            });
        }

        return res.status(Http.Ok).json({
            message: "Admin logged in successfully.",
            data: verificationAdmin,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(Http.Server_Error).json({
            message: "Error logging in",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};

export const monitorActivities = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminID } = req.params;

        const admin = await adminModel.findById(adminID);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found.",
                status: 404,
            });
        }
        const recentUsers = await userModel.find().sort({ createdAt: -1 }).limit(10);
        const recentStaff = await staffModel.find().sort({ createdAt: -1 }).limit(10);
        const recentPosts = await staffPostModel.find().sort({ createdAt: -1 }).limit(10);

        const recentFeedback = await staffModel.find({ feedback: { $exists: true, $ne: "" } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("feedback firstName lastName createdAt");

        return res.status(200).json({
            message: "Activities retrieved successfully.",
            data: {
                recentUsers,
                recentStaff,
                recentPosts,
                recentFeedback,
            },
            status: 200,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving activities.",
            error: error.message,
            status: 500,
        });
    }
};

export const suspendStaffTrue = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { companyID, staffID } = req.params;

        const company = await adminModel.findById(companyID);

        if (company && company?.verify) {
            const staff = await staffModel.findById(staffID);
            if (staff) {
                const result = await staffModel.findByIdAndUpdate(
                    staff._id,
                    { isSuspended: true },
                    { new: true }
                );

                return res.status(Http.Created).json({
                    message: `${staff.firstName} ${staff.lastName} Suspension Is Successfully`,
                    data: result,
                    status: Http.Created,
                });
            } else {
                return res.status(Http.Bad).json({
                    message: "Staff Does Not Exist",
                    status: Http.Bad,
                });
            }
        } else {
            return res.status(Http.Bad).json({
                message: "Company Does Not Exist Or Is Not Verified",
                status: Http.Bad,
            });
        }
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Sorry, An Error Occurred, Retry",
            status: Http.Bad,
            error: error.messsage,
        });
    }
};

export const suspendStaffFalse = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { companyID, staffID } = req.params;

        const company = await adminModel.findById(companyID);

        if (company && company?.verify) {
            const staff = await staffModel.findById(staffID);
            if (staff) {
                const result = await staffModel.findByIdAndUpdate(
                    staff._id,
                    { isSuspended: false },
                    { new: true }
                );

                return res.status(Http.Created).json({
                    message: `${staff.firstName} ${staff.lastName} Suspension Is Lifted Successfully`,
                    data: result,
                    status: Http.Created,
                });
            } else {
                return res.status(Http.Bad).json({
                    message: "Staff Does Not Exist",
                    status: Http.Bad,
                });
            }
        } else {
            return res.status(Http.Bad).json({
                message: "Company Does Not Exist Or Is Not Verified",
                status: Http.Bad,
            });
        }
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Sorry, An Error Occurred, Retry",
            status: Http.Bad,
            error: error.messsage,
        });
    }
};