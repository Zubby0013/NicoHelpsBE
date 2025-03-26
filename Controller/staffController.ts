import { Request, Response } from "express";
import staffModel from "../Model/staffModel";
import { Http } from "../Utils/enums";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import staffPostModel from "../Model/staffPostModel";

//Auth
export const registerStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, phoneNumber, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = crypto.randomBytes(3).toString("hex");

        const staff = await staffModel.create({
            email,
            phoneNumber,
            password: hashedPassword,
            token: id,

        })

        return res.status(Http.Ok).json({
            message: "register staff successful",
            data: staff,
            status: Http.Ok
        })
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Error registering staff",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const verifyStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;
        const { staffID } = req.params;

        const staff = await staffModel.findById(staffID)

        if (!token) {
            return res.status(Http.Bad).json({
                message: "Verification token is required.",
                status: Http.Bad,
            });
        }
        if (!staff) {
            return res.status(Http.Bad).json({
                message: "This staff does not exist.",
                status: Http.Bad,
            });
        }
        if (staff?.token !== token) {
            return res.status(Http.Bad).json({
                message: "Incorrect token provided.",
                status: Http.Bad,
            });
        }

        const verificationstaff = await staffModel.findByIdAndUpdate(staffID,
            { verify: true, token: staff?.token },
            { new: true }
        )

        return res.status(Http.Ok).json({
            message: "verifying staff successfully",
            data: verificationstaff,
            status: Http.Ok
        })
    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error verifying staff",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const loginStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        const staff = await staffModel.findOne({ email });

        if (staff) {
            if (staff?.verify === true) {
                const validatePassword = await bcrypt.compare(
                    password,
                    staff?.password
                );

                if (validatePassword) {
                    const jwtToken = jwt.sign(
                        { id: staff._id },
                        process.env.JWT_SECRET!,
                        {
                            expiresIn: "2d",
                        }
                    );

                    // req.session.isAuth = true;
                    // req.session.staffID = staff._id;

                    return res.status(Http.Ok).json({
                        message: "staff Successfully Logged In",
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
                    message: "staff Has Not Been Verified",
                    status: Http.Bad,
                });
            }
        } else {
            return res.status(Http.Bad).json({
                message: "staff Does Not Exist",
                status: Http.Bad,
            });
        }


    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error logging staff",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const staffFirstLogin = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { firstName, lastName, address, state, lga, nin, bvn } = req.body;
        const { staffID } = req.params;

        const staff = await staffModel.findById(staffID);

        if (staff) {
            if (staff.verify === true) {
                const salt = await bcrypt.genSalt(10);
                const hashedNin = await bcrypt.hash(nin, salt);
                const hashedBvn = await bcrypt.hash(bvn, salt);
                const result = await staffModel.findByIdAndUpdate(
                    staff._id,
                    {
                        firstName: firstName,
                        lastName: lastName,
                        staffAddress: address,
                        state: state,
                        lga: lga,
                        bvn: hashedBvn,
                        nin: hashedNin,
                        started: true,
                    },
                    { new: true }
                );
                return res.status(Http.Ok).json({
                    message: "Successfully Updated Account Details",
                    data: result,
                    status: Http.Ok,
                });
            } else {
                return res.status(Http.Bad).json({
                    message: "Account Not Verified Or No Token Found",
                    status: Http.Bad,
                });
            }
        } else {
            return res.status(Http.Bad).json({
                message: "Account Does Not Exist",
                status: Http.Bad,
            });
        }
    } catch (error: any) {
        return res.status(Http.Bad).json({
            message: "Error Updating staffs First Login",
            status: Http.Bad,
            error: error.messsage,
        });
    }
};

export const deleteStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { staffID } = req.params;

        const staff = await staffModel.findByIdAndDelete(staffID);


        return res.status(Http.Ok).json({
            message: "staff account Successfully deleted",
            data: staff,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding staff account",
            error: error.message,
            status: Http.Bad
        })
    }
}

//getstaff
export const getOneStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { staffID } = req.params;

        const staff = await staffModel.findById(staffID);


        return res.status(Http.Ok).json({
            message: "one staff account Successfully found",
            data: staff,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding staff account",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const getAllStaff = async (req: Request, res: Response): Promise<Response> => {
    try {

        const staff = await staffModel.find();


        return res.status(Http.Ok).json({
            message: "All staffs account Successfully found",
            data: staff,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error finding staffs account",
            error: error.message,
            status: Http.Bad
        })
    }
}

//createPost
export const createPost = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { staffID } = req.params;
        const { image, description, title, } = req.body;

        const details = await staffModel.findById(staffID);

        if (staffID) {
            const staff = await staffPostModel.create({
                image: image,
                description: description,
                title: title,
                staffFirstName: details?.firstName,
                staffLastName: details?.lastName,
            });

            return res.status(Http.Ok).json({
                message: "staff post Successfully",
                data: staff,
                status: Http.Ok,
            });
        } else {
            return res.status(Http.Bad).json({
                message: "staff not found",
                status: Http.Bad,
            });
        }

    } catch (error: any) {
        console.log(error)
        return res.status(Http.Bad).json({
            message: "Error creating staff post",
            error: error.message,
            status: Http.Bad
        })
    }
}

export const getStaffPosts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { staffID } = req.params;

        const staff = await staffModel.findById(staffID);
        if (!staff) {
            return res.status(Http.Bad).json({
                message: "Staff not found.",
                status: Http.Bad,
            });
        }

        const posts = await staffPostModel.find({ staffID });

        if (posts.length === 0) {
            return res.status(Http.Ok).json({
                message: "No posts found for this staff member.",
                data: [],
                status: Http.Ok,
            });
        }

        return res.status(Http.Ok).json({
            message: "Staff posts retrieved successfully.",
            data: posts,
            status: Http.Ok,
        });

    } catch (error: any) {
        console.log(error);
        return res.status(Http.Server_Error).json({
            message: "Error retrieving staff posts.",
            error: error.message,
            status: Http.Server_Error,
        });
    }
};