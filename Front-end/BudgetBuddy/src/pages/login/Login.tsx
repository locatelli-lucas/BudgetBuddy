import {Title} from "../../components/global/Title.tsx";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import {usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {GlobalFormButton} from "../../components/buttons/GlobalFormButton.tsx";
import {useRef, useState} from "react";
import {loginUser} from "../../services/user-service.ts";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {ForgotPasswordLink, LabelLinkContainer, LoginPasswordContainer} from "./style.ts";
import {
    GlobalForm,
    GlobalFormContainer, GlobalFormLink, GlobalInput,
    GlobalInputContainer,
    GlobalLabel
} from "../../global_styles/forms/forms.style.ts";
import {GoogleButton, Visibility} from "../../global_styles/buttons/buttons.style.ts";
import {GoogleIcon, GoogleLoginSpan} from "../../global_styles/google/google.style.ts";
import type {LoginType} from "../../types/Types.ts";

export function Login() {
    const navigate = useNavigate();
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    // const {setId, setUsername, setEmail, setMonthlyIncome} = useContext(UserContext);
    const [loginData, setLoginData] = useState<LoginType>({
        email: "",
        password: ""
    })

    const handleLoginButtonClick = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // await getUserByEmail(loginData.email).then(res => {
            //     // setId(res.id!);
            //     // setUsername(res.name);
            //     // setEmail(res.email);
            //     // setMonthlyIncome(res.monthlyIncome);
            //
            // })
            await loginUser(loginData).then(res => {
                console.log("Logged in user:", loginData);

                console.log(localStorage.getItem("username"))

                navigate(`/${res!.id}/dashboard`);
            })
        } catch (error) {
            console.error("Error logging in:", error);
        }
    }

    return (
        <GlobalFormContainer>
            <Title />
            <GlobalForm onSubmit={handleLoginButtonClick}>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="email">E-mail</GlobalLabel>
                    <GlobalInput ref={emailInput} onChange={e => setLoginData(prev => ({...prev, email: e.target.value}))} type="email" placeholder="Digite seu e-mail" required />
                </GlobalInputContainer>
                <LoginPasswordContainer>
                    <LabelLinkContainer>
                        <GlobalLabel htmlFor="password">Senha</GlobalLabel>
                        <ForgotPasswordLink to="/forgotpassword">
                            Esqueceu a senha?
                        </ForgotPasswordLink>
                    </LabelLinkContainer>
                    <div>
                        <GlobalInput ref={passwordInput} onChange={e => setLoginData(prev => ({...prev, password: e.target.value}))} type={inputType} placeholder="Digite sua senha" required  />
                        <Visibility onClick={handlePasswordVisibility}>
                            {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                        </Visibility>
                    </div>
                </LoginPasswordContainer>
                <GlobalFormButton text="Login" type="submit" />
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
            <GlobalFormLink to="/register">
                Crie uma conta
            </GlobalFormLink>
        </GlobalFormContainer>
    );
}