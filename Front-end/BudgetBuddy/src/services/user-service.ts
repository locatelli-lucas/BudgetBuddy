import type {Login, Page, User} from "../types/Types.ts";
import {API, configAPI} from "./API.ts";

export async function createUser (user : User) {
    try {
        return await API.post("/users", user).then(res => {
            return res.data as User;
        });
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export async function loginUser(login : Login) {
    try {
        return await API.post("/users/login", login)
            .then(res => {
                if (res.data.token) {
                    localStorage.setItem("tokenType", res.data.type);
                    localStorage.setItem("tokenValue", res.data.token);
                    configAPI();
                }
            });
    } catch(error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}

export async function getUserByEmail(email: string) : Promise<User> {
    try {
        return await API.get(`/users/email/${email}`).then(res => {
            return res.data as User;
        });
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
}

export async function getAllUsers(page : Page) : Promise<void | User[]> {
    try {
        return await API.get("/users", {
            params: {
                page: page.pageNumber,
                size: page.size
            }
        }).then(res => console.log(res))
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
}

export async function testCall() {
    return await API.get("/test/open")
}