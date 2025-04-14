import { Http } from "./enums";

export interface iError {
    name: string;
    message: string;
    status: Http;
    success: boolean;
}
