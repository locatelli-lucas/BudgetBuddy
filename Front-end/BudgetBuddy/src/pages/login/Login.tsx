import {Title} from "../../components/title/Title.tsx";
import {ContainerLogin, FormLogin} from "./style.ts";
import {useState} from "react";

import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";

export function Login() {
    const [passwordVisibility, setPasswordVisibility] = useState("password");
    const [eyeIcon, setEyeIcon] = useState(<GoEye />);

    const handlePasswordVisibility = () => {
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
                <label htmlFor="password">Senha</label>
                <div>
                    <input type={passwordVisibility} placeholder="Digite sua senha" required  />
                    <button onClick={handlePasswordVisibility}>{eyeIcon}</button>
                </div>

            </FormLogin>
        </ContainerLogin>
    );
}