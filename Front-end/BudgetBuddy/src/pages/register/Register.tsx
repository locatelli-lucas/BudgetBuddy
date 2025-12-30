import {Title} from "../../components/Title.tsx";

import {FcGoogle} from "react-icons/fc";
import {useFormatNumber, useIsNumeric, usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {GoEye, GoEyeClosed} from "react-icons/go";
import {
    GlobalForm,
    GlobalFormContainer, GlobalInput,
    GoogleButton,
    GoogleIcon,
    GoogleLoginSpan, GlobalFormLink,
    Visibility, GlobalInputContainer, GlobalLabel
} from "../../global_styles/style.ts";
import {Subtitle} from "./style.ts";
import {useEffect, useRef, useState} from "react";
import type {User} from "../../types/Types.ts";
import {createUser, testCall} from "../../services/user-service.ts";
import {GlobalFormButton} from "../../components/GlobalFormButton.tsx";
import * as React from "react";

export function Register() {
    const nameInput = useRef<HTMLInputElement>(null);
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const monthlyIncomeInput = useRef<HTMLInputElement>(null);
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();
    const {formatMoneyToNumberStr, formatNumberToMoney} = useFormatNumber();
    const {isNumeric} = useIsNumeric();
    const [currentValue, setCurrentValue] = useState<string>();
    const [user, setUser] = useState<User>({
        name: "",
        email: "",
        password: "",
        monthlyIncome: 0,
        role: "USER"
    });

    const createUserReq = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // if(user)
            //     return await createUser(user).then(res => console.log(res.data));
            await testCall()
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    const handleMonthlyIncomeChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const input = e.key;
        let value: number | string;
        let newValue = "";

        if (isNumeric(input)) {
            if (currentValue) {
                value = formatMoneyToNumberStr(currentValue) + input;
            } else {
                value = input;
            }
            setUser(prev => ({...prev, monthlyIncome: Number(value)}))
            newValue = formatNumberToMoney(value);
        } else if (input === "Backspace") {
            if (currentValue && currentValue.length > 0) {
                value = formatMoneyToNumberStr(currentValue).slice(0, -1);
                newValue = formatNumberToMoney(value);
            }
        }

        if(newValue !== "")
            setCurrentValue(newValue);
    };

    useEffect(() => {
        console.log(user)
    }, [user])

    useEffect(() => {
        monthlyIncomeInput.current!.value = currentValue || "";
    }, [currentValue]);

    return (
        <GlobalFormContainer>
            <Title />
            <Subtitle>Crie sua conta</Subtitle>
            <GlobalForm onSubmit={createUserReq}>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="name">Nome</GlobalLabel>
                    <GlobalInput ref={nameInput} onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))} type="text" name="name" placeholder="Digite seu nome" required />
                </GlobalInputContainer>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="email">E-mail</GlobalLabel>
                    <GlobalInput ref={emailInput} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} type="email" name="email" placeholder="Digite seu e-mail" required />
                </GlobalInputContainer>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="password">Senha</GlobalLabel>
                    <div>
                        <GlobalInput ref={passwordInput} onChange={(e) => setUser(prev => ({
                            ...prev, password: e.target.value,
                        }))} type={inputType} placeholder="Digite sua senha" required  />
                        <Visibility onClick={handlePasswordVisibility}>
                            {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                        </Visibility>
                    </div>
                </GlobalInputContainer>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="monthlyIncome">Renda mensal</GlobalLabel>
                    <GlobalInput ref={monthlyIncomeInput} onKeyDown={e => handleMonthlyIncomeChange(e)} type="text" name="monthlyIncome" placeholder="R$0,00"/>
                </GlobalInputContainer>
                <GlobalFormButton text="Criar conta" type="submit" />
                <GoogleLoginSpan>
                    <hr />
                    <span>ou faça login com</span>
                    <hr />
                </GoogleLoginSpan>
                <GoogleButton>
                    <GoogleIcon>
                        <FcGoogle />
                    </GoogleIcon>
                    <span>Continuar com Google</span>
                </GoogleButton>
            </GlobalForm>
            <div>
                <span>Já tem uma conta? </span>
                <GlobalFormLink to="/login">
                    Faça login
                </GlobalFormLink>
            </div>
        </GlobalFormContainer>
    );
}