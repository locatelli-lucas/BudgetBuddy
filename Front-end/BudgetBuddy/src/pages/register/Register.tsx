import {Title} from "../../components/global/Title.tsx";
import {FcGoogle} from "react-icons/fc";
import {useFormatNumber, useIsNumeric, usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {GoEye, GoEyeClosed} from "react-icons/go";
import {Subtitle} from "./style.ts";
import {useContext, useEffect, useRef, useState} from "react";
import type {User} from "../../types/Types.ts";
import {createUser} from "../../services/user-service.ts";
import {GlobalFormButton} from "../../components/buttons/GlobalFormButton.tsx";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {
    GlobalForm,
    GlobalFormContainer, GlobalFormLink, GlobalInput,
    GlobalInputContainer,
    GlobalLabel
} from "../../global_styles/forms/forms.style.ts";
import {GoogleButton, Visibility} from "../../global_styles/buttons/buttons.style.ts";
import {GoogleIcon, GoogleLoginSpan} from "../../global_styles/google/google.style.ts";
import {UserContext} from "../../contexts/UserContext.tsx";

export function Register() {
    const navigate = useNavigate();
    const nameInput = useRef<HTMLInputElement>(null);
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const monthlyIncomeInput = useRef<HTMLInputElement>(null);
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();
    const {formatMoneyToNumberStr, formatNumberToMoney} = useFormatNumber();
    const {isNumeric} = useIsNumeric();
    const [currentValue, setCurrentValue] = useState<string>();
    const {setId, setUsername, setEmail, setMonthlyIncome} = useContext(UserContext);
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
            if(user) await createUser(user).then(res => {
                setId(user.id!);
                setUsername(user.name);
                setEmail(user.email);
                setMonthlyIncome(user.monthlyIncome);
                navigate(`/${res.id}/dashboard`);
            });
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
        monthlyIncomeInput.current!.value = currentValue || "";
    }, [currentValue]);

    return (
        <GlobalFormContainer height="120vh">
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