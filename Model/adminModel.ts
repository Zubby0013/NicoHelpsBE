import { Document, Schema, Types, model } from "mongoose";

interface iAdmin {

    token: string;
    verify: boolean;
    allUsers: Array<{}>;
    allStaffs: Array<{}>;
}

interface iAdminData extends iAdmin, Document { }

const adminModel = new Schema<iAdminData>(
    {

        verify: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
            unique: true
        },
        allStaffs: [
            {
                type: Types.ObjectId,
                ref: "staffs",
            },
        ],
        allUsers: [
            {
                type: Types.ObjectId,
                ref: "users",
            },
        ],
    },
    { timestamps: true }
);

export default model<iAdminData>("admins", adminModel)