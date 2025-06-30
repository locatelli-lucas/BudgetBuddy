import {Title} from "../../components/title/Title.tsx";
import {ContainerLogin, FormLogin, GoogleButton, GoogleLoginSpan, LoginButton, Visibility} from "./style.ts";
import {useState} from "react";

import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";

export function Login() {
    const [passwordVisibility, setPasswordVisibility] = useState("password");
    const [eyeIcon, setEyeIcon] = useState(<GoEye />);

    const handlePasswordVisibility = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if(passwordVisibility === "password") {
            setPasswordVisibility("text");
            setEyeIcon(<GoEyeClosed />);
        } else {
            setPasswordVisibility("password");
            setEyeIcon(<GoEye />);
        }
    }

    return (
        <ContainerLogin>
            <Title />
            <FormLogin>
                <label htmlFor="email">E-mail</label>
                <input type="email" placeholder="Digite seu e-mail" required />
                <div>
                    <label htmlFor="password">Senha</label>
                    <a>Esqueceu a senha?</a>
                </div>

                <div>
                    <input type={passwordVisibility} placeholder="Digite sua senha" required  />
                    <Visibility onClick={handlePasswordVisibility}>{eyeIcon}</Visibility>
                </div>
                <LoginButton>
                    Login
                </LoginButton>
                <GoogleLoginSpan>
                    <hr />
                    <span>ou faça login com</span>
                    <hr />
                </GoogleLoginSpan>
                <GoogleButton>
                    <FcGoogle />
                    <a>Continuar com Google</a>
                </GoogleButton>
            </FormLogin>
        </ContainerLogin>
    );
}