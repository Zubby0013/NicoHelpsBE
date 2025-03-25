import { Document, Schema, Types, model } from "mongoose";

interface iUser {
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
    rate: number;
    feedback: string;
    company: {};
}

interface iUserData extends iUser, Document { }

const userModel = new Schema<iUserData>(
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
        address: {
            type: String
        },
        password: {
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
        feedback: {
            type: String
        },
        rate: {
            type: Number
        },
        verify: {
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

export default model<iUserData>("users", userModel)