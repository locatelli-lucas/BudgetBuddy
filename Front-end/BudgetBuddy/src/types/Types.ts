export type User = {
    id?: number,
    name: string,
    email: string,
    password: string,
    monthlyIncome: number,
    role: "USER" | "ADMIN"
}

export type Login = {
    email: string,
    password: string
}

export type Page = {
    pageNumber: number,
    size: number
}