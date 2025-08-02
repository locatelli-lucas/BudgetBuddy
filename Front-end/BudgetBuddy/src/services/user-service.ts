import type {Login, User} from "../types/Types.ts";
import {API} from "./API.ts";

export async function createUser (user : User) {
    try {
        const res = await API.post("/users", user);
        return res.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export async function loginUser(login : Login) {
    try {
        return await API.post("/users/login", login)
            .then(res => console.log(res.data));
    } catch(error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}