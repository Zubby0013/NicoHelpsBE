import { Request, Response } from "express";
import { Http } from "../Utils/enums";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../Model/userModel";

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, phoneNumber, password, address, firstName, lastName, state, lga } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = crypto.randomBytes(3).toString("hex");

        const user = await userModel.create({
            email,
            phoneNumber,
            password: hashedPassword,
            address,
            firstName,
            lastName,
            token: id,
            state,
            lga
        })

        return res.status(Http.Ok).json({
            message: "register user successful",
            data: user,
            status: Http.Ok
        })
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Error registering user",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const verifyUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;
        const { userID } = req.params;

        const user = await userModel.findById(userID)

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required.",
                status: 400,
            });
        }
        if (!user) {
            return res.status(404).json({
                message: "This user does not exist.",
                status: Http.Bad,
            });
        }
        if (user?.token !== token) {
            return res.status(400).json({
                message: "Incorrect token provided.",
                status: 400,
            });
        }

        const verificationUser = await userModel.findByIdAndUpdate(userID,
            { verify: true, token: user?.token },
            { new: true }
        )

        return res.status(Http.Ok).json({
            message: "verifying user successfully",
            data: verificationUser,
            status: Http.Ok
        })
    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error verifying user",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (user) {
            if (user?.verify === true) {
                const validatePassword = await bcrypt.compare(
                    password,
                    user.password
                );

                if (validatePassword) {
                    const jwtToken = jwt.sign(
                        { id: user._id },
                        process.env.JWT_SECRET!,
                        {
                            expiresIn: "2d",
                        }
                    );

                    // req.session.isAuth = true;
                    // req.session.userID = user._id;

                    return res.status(Http.Ok).json({
                        message: "user Successfully Logged In",
                        data: jwtToken,

                    });
                } else {
                    return res.status(Http.Bad).json({
                        message: "Password is Incorrect",
                        status: Http.Bad,
                    });
                }
            } else {
                return res.status(Http.Bad).json({
                    message: "user Has Not Been Verified",
                    status: Http.Bad,
                });
            }
        } else {
            return res.status(Http.Bad).json({
                message: "user Does Not Exist",
                status: Http.Bad,
            });
        }


    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error logging user",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userID } = req.params;

        const user = await userModel.findByIdAndDelete(userID);


        return res.status(Http.Ok).json({
            message: "user account Successfully deleted",
            data: user,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding user account",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const getOneUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userID } = req.params;

        const user = await userModel.findById(userID);


        return res.status(Http.Ok).json({
            message: "one user account Successfully found",
            data: user,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding user account",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const getAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {

        const user = await userModel.find();


        return res.status(Http.Ok).json({
            message: "All users account Successfully found",
            data: user,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding users account",
            error: error.message,
            status: Http.Bad
        })
    }
}