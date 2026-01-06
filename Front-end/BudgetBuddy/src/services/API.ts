import axios from "axios";

export const API = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

export function configAPI() {
    const tokenType = localStorage.getItem("tokenType")
    const tokenValue = localStorage.getItem("tokenValue")
    API.interceptors.request.use(config => {
        if(tokenType && tokenValue) {
            config.headers.Authorization = `${tokenType} ${tokenValue}`;
        }
        return config;
    });
}