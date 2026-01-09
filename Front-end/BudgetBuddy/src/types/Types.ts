import type {Dispatch, SetStateAction} from "react";

export type User = {
    id?: number,
    name: string,
    email: string,
    password: string,
    monthlyIncome: number,
    role: "USER" | "ADMIN"
}

export type UserContextType = {
    id: number,
    username: string,
    email: string,
    monthlyIncome: number,
    setId: Dispatch<SetStateAction<number>>,
    setUsername: Dispatch<SetStateAction<string>>,
    setEmail: Dispatch<SetStateAction<string>>,
    setMonthlyIncome: Dispatch<SetStateAction<number>>
}

export type LoginType = {
    email: string,
    password: string
}

export type Page = {
    pageNumber: number,
    size: number
}

export type TokenType = {
    type: string,
    token: string
}