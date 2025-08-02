import {Title} from "../../components/Title.tsx";

import {FcGoogle} from "react-icons/fc";
import {useFormatNumber, useIsNumeric, usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {GoEye, GoEyeClosed} from "react-icons/go";
import {
    GlobalForm,
    GlobalFormContainer, GlobalInput,
    GoogleButton,
    GoogleIcon,
    GoogleLoginSpan, LinkRegisterLogin,
    Visibility
} from "../../global_styles/style.ts";
import {Subtitle} from "./style.ts";
import {useEffect, useRef, useState} from "react";
import type {User} from "../../types/Types.ts";
import {createUser} from "../../services/user-service.ts";
import {LoginCreateButton} from "../../components/LoginCreateButton.tsx";
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

    const createUserReq = async () => {
        try {
            console.log(user)
            const response = await createUser(user);
            console.log(response)
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    const handleMonthlyIncomeChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const input = e.key;
        let value;
        let newValue = "";

        if (isNumeric(input)) {
            if (currentValue) {
                value = formatMoneyToNumberStr(currentValue) + input;
            } else {
                value = input;
            }

            newValue = formatNumberToMoney(value);
            console.log(newValue);
        } else if (input === "Backspace") {
            if (currentValue && currentValue.length > 0) {
                value = formatMoneyToNumberStr(currentValue).slice(0, -1);
                newValue = formatNumberToMoney(value);
            }
        }
        setCurrentValue(newValue);
    };

    useEffect(() => {
        monthlyIncomeInput.current!.value = currentValue || "";
    }, [currentValue]);

    return (
        <GlobalFormContainer>
            <Title />
            <Subtitle>Crie sua conta</Subtitle>
            <GlobalForm>
                <label htmlFor="name">Nome</label>
                <GlobalInput ref={nameInput} onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))} type="text" name="name" placeholder="Digite seu nome" required />
                <label htmlFor="email">E-mail</label>
                <GlobalInput ref={emailInput} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} type="email" name="email" placeholder="Digite seu e-mail" required />
                <label htmlFor="password">Senha</label>
                <div>
                    <GlobalInput ref={passwordInput} onChange={(e) => setUser(prev => ({
                        ...prev, password: e.target.value,
                    }))} type={inputType} placeholder="Digite sua senha" required  />
                    <Visibility onClick={handlePasswordVisibility}>
                        {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                    </Visibility>
                </div>
                <label htmlFor="monthlyIncome">Renda mensal</label>
                <GlobalInput ref={monthlyIncomeInput} onKeyDown={e => handleMonthlyIncomeChange(e)} type="text" name="monthlyIncome" placeholder="R$"/>
                <LoginCreateButton text="Criar conta" onClick={() => createUserReq()} />
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
                <LinkRegisterLogin to="/login" onClick={() => createUserReq()}>
                    Faça login
                </LinkRegisterLogin>
            </div>
        </GlobalFormContainer>
    );
}