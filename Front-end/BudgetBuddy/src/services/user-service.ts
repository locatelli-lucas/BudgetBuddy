import type {User} from "../types/Types.ts";
import {API} from "./API.ts";

export const createUser = async (user : User) => {
    try {
        const res = await API.post("/users", user);
        return res.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}