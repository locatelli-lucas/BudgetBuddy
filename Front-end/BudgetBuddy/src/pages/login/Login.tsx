import {Title} from "../../components/Title.tsx";

import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import {usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {
    GlobalForm,
    GlobalFormContainer, GlobalInput,
    GoogleButton,
    GoogleIcon,
    GoogleLoginSpan, GlobalFormLink,
    Visibility, GlobalInputContainer, GlobalLabel
} from "../../global_styles/style.ts";
import {GlobalFormButton} from "../../components/GlobalFormButton.tsx";
import {useRef, useState} from "react";
import {getUserByEmail} from "../../services/user-service.ts";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {ForgotPasswordLink, LabelLinkContainer, LoginPasswordContainer} from "./style.ts";


export function Login() {
    const navigate = useNavigate();
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })

    const handleLoginButtonClick = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await getUserByEmail(loginData.email);
            navigate(`/${loginData.email}/dashboard`);
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