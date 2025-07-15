export type User = {
    name: string,
    email: string,
    password: string,
    monthlyIncome: string,
    role: "USER" | "ADMIN"
}