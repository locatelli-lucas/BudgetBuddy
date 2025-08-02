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
    GoogleLoginSpan, LinkRegisterLogin,
    Visibility
} from "../../global_styles/style.ts";
import {LoginCreateButton} from "../../components/LoginCreateButton.tsx";
import {useRef, useState} from "react";
import {loginUser} from "../../services/user-service.ts";

export function Login() {
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })

    const handleLoginButtonClick = async () => {
        if(!emailInput.current || !passwordInput.current) return;
        await loginUser(loginData);
        console.log("Login successful");
    }

    return (
        <GlobalFormContainer>
            <Title />
            <GlobalForm>
                <label htmlFor="email">E-mail</label>
                <GlobalInput ref={emailInput} onChange={e => setLoginData(prev => ({...prev, email: e.target.value}))} type="email" placeholder="Digite seu e-mail" required />
                <div>
                    <label htmlFor="password">Senha</label>
                    <a>Esqueceu a senha?</a>
                </div>
                <div>
                    <GlobalInput ref={passwordInput} onChange={e => setLoginData(prev => ({...prev, password: e.target.value}))} type={inputType} placeholder="Digite sua senha" required  />
                    <Visibility onClick={handlePasswordVisibility}>
                        {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                    </Visibility>
                </div>
                <LoginCreateButton text="Login" onClick={handleLoginButtonClick} />
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
            <LinkRegisterLogin to="/register">
                Crie uma conta
            </LinkRegisterLogin>
        </GlobalFormContainer>
    );
}