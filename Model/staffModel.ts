import { Document, Schema, Types, model } from "mongoose";

interface iFeedback {
    user: Types.ObjectId;
    rating: number;
    comment: string;
}

interface iStaff {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    password: string;
    phoneNumber: string;
    token: string;
    state: string;
    lga: string;
    verify: boolean;
    started: boolean;
    nin: number;
    bvn: number;
    company: {};

    rate: number;
    feedback: iFeedback[];

    allStaffPost: Array<{}>;
}

interface iStaffData extends iStaff, Document { }

const staffModel = new Schema<iStaffData>(
    {
        firstName: { type: String },
        lastName: { type: String },
        password: { type: String },
        email: { type: String, unique: true },
        nin: { type: Number, unique: true },
        bvn: { type: Number, unique: true },
        address: { type: String },
        phoneNumber: { type: String },
        state: { type: String },
        token: { type: String, unique: true },
        lga: { type: String },
        verify: { type: Boolean, default: false },
        started: { type: Boolean, default: false },

        feedback: [
            {
                user: { type: Types.ObjectId, ref: "users" },
                rating: { type: Number, min: 1, max: 5 },
                comment: { type: String, },
            }
        ],
        rate: { type: Number, default: 0 },
        allStaffPost: [
            {
                type: Types.ObjectId,
                ref: "staffposts",
            },
        ],

        company: { type: Types.ObjectId, ref: "admins" },
    },
    { timestamps: true }
);

export default model<iStaffData>("staffs", staffModel);
