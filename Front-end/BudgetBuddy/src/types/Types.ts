export type User = {
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