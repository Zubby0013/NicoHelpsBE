import { Request, Response } from "express";
import { Http } from "../Utils/enums";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../Model/userModel";
import staffModel from "../Model/staffModel";
import { Types } from "mongoose";
import adminModel from "../Model/adminModel";

//Auth
export const registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, phoneNumber, password, address, firstName, lastName, state, lga } = req.body;


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = crypto.randomBytes(3).toString("hex");
        const admin = await adminModel.findOne();


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
        admin?.allUsers.push(user._id!);

        await admin?.save();


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

        const user = await userModel.findById(userID);

        if (!token) {
            return res.status(Http.Bad).json({
                message: "Verification token is required.",
                status: Http.Bad,
            });
        }
        if (!user) {
            return res.status(Http.Bad).json({
                message: "This user does not exist.",
                status: Http.Bad,
            });
        }
        if (user?.token !== token) {
            return res.status(Http.Bad).json({
                message: "Incorrect token provided.",
                status: Http.Bad,
            });
        }

        const verificationUser = await userModel.findByIdAndUpdate(
            userID,
            { verify: true, token: user?.token },
            { new: true }
        );

        return res.status(Http.Ok).json({
            message: "User verified successfully",
            data: verificationUser,
            status: Http.Ok,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(Http.Bad).json({
            message: "Error verifying user",
            error: error.message,
            status: Http.Bad,
        });
    }
};


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

export const logoutUser = async (
    req: any,
    res: Response
): Promise<Response> => {
    try {
        req.session.destroy();

        return res.status(Http.Ok).json({
            message: "Logged Out Account Successfully, GoodBye",
        });
    } catch (error: any) {
        return res.status(404).json({
            message: "Error Logging out Account",
            status: Http.Bad,
            error: error.messsage,
        });
    }
};


//getuser
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

//feedBack comment
export const createFeedback = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userID, workerID } = req.params;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(Http.Bad).json({
                message: "Rating and comment are required.",
                status: Http.Bad,
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(Http.Bad).json({
                message: "Rating must be between 1 and 5.",
                status: Http.Bad,
            });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(Http.Bad).json({
                message: "User not found.",
                status: Http.Bad,
            });
        }

        const worker = await staffModel.findById(workerID);
        if (!worker) {
            return res.status(Http.Bad).json({
                message: "Worker not found.",
                status: Http.Bad,
            });
        }

        const updatedWorker = await staffModel.findByIdAndUpdate(
            workerID,
            {
                $push: {
                    feedback: {
                        user: userID,
                        rating,
                        comment,
                    },
                },
            },
            { new: true }
        );

        return res.status(Http.Created).json({
            message: "Feedback submitted successfully.",
            data: updatedWorker,
            status: Http.Created,
        });

    } catch (error: any) {
        return res.status(Http.Server_Error).json({
            message: "Error submitting feedback",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};

export const getAverageRating = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { workerID } = req.params;

        const worker = await staffModel.findById(workerID);
        if (!worker) {
            return res.status(Http.Bad).json({
                message: "Worker not found.",
                status: Http.Bad,
            });
        }

        const feedbacks = worker.feedback;
        if (feedbacks.length === 0) {
            return res.status(Http.Ok).json({
                message: "No feedback available.",
                averageRating: 0,
                status: Http.Ok,
            });
        }

        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = totalRating / feedbacks.length;

        return res.status(Http.Ok).json({
            message: "Average rating calculated successfully.",
            averageRating: averageRating.toFixed(2),
            totalFeedbacks: feedbacks.length,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(Http.Server_Error).json({
            message: "Error calculating average rating.",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};


export const editFeedback = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userID, workerID } = req.params;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                message: "Rating and comment are required.",
                status: 400,
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5.",
                status: 400,
            });
        }

        const worker = await staffModel.findById(workerID);
        if (!worker) {
            return res.status(Http.Bad).json({
                message: "Worker not found.",
                status: Http.Bad,
            });
        }

        const feedbackIndex = worker.feedback.findIndex(fb => fb.user.toString() === userID);
        if (feedbackIndex === -1) {
            return res.status(Http.Bad).json({
                message: "Feedback not found.",
                status: Http.Bad,
            });
        }

        worker.feedback[feedbackIndex].rating = rating;
        worker.feedback[feedbackIndex].comment = comment;
        await worker.save();

        return res.status(Http.Ok).json({
            message: "Feedback updated successfully.",
            data: worker,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(Http.Server_Error).json({
            message: "Error updating feedback.",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};

export const deleteFeedback = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userID, workerID } = req.params;

        const worker = await staffModel.findById(workerID);
        if (!worker) {
            return res.status(Http.Bad).json({
                message: "Worker not found.",
                status: Http.Bad,
            });
        }

        const feedbackIndex = worker.feedback.findIndex(fb => fb.user.toString() === userID);
        if (feedbackIndex === -1) {
            return res.status(Http.Bad).json({
                message: "Feedback not found.",
                status: Http.Bad,
            });
        }

        worker.feedback.splice(feedbackIndex, 1);
        await worker.save();

        return res.status(Http.Ok).json({
            message: "Feedback deleted successfully.",
            data: worker,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(Http.Server_Error).json({
            message: "Error deleting feedback.",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};
