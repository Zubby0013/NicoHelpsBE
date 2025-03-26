import { Document, Schema, Types, model } from "mongoose";

interface iPost {
    image: string;
    description: string;
    title: string;
    staffFirstName: string;
    staffLastName: string;

    staff: {};
}

interface iPostData extends iPost, Document { }

const staffPostModel = new Schema<iPostData>(
    {
        image: {
            type: String
        },
        description: {
            type: String
        },
        title: {
            type: String
        },
        staffFirstName: {
            type: String
        },
        staffLastName: {
            type: String
        },

        staff: {
            type: Types.ObjectId,
            ref: "staffs",
        },
    },
    { timestamps: true }
);

export default model<iPostData>("staffposts", staffPostModel)