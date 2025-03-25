import { Document, Schema, Types, model } from "mongoose";

interface iStaff {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber: string;
    token: string;
    state: string;
    lga: string;
    verify: boolean;
    started: boolean;
    nin: number;
    bvn: number;
    company: {};
}

interface iStaffData extends iStaff, Document { }

const staffModel = new Schema<iStaffData>(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        email: {
            type: String,
            unique: true
        },
        nin: {
            type: Number,
            unique: true
        },
        bvn: {
            type: Number,
            unique: true
        },
        address: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        state: {
            type: String
        },
        token: {
            type: String,
            unique: true
        },
        lga: {
            type: String
        },
        verify: {
            type: Boolean,
            default: false
        },
        started: {
            type: Boolean,
            default: false
        },
        company: {
            type: Types.ObjectId,
            ref: "admins",
        },
    },
    { timestamps: true }
);

export default model<iStaffData>("staffs", staffModel)