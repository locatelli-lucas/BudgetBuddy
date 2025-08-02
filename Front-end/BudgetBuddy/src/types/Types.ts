export type User = {
    name: string,
    email: string,
    password: string,
    monthlyIncome: number,
    role: "USER" | "ADMIN"
}