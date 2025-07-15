import {Title} from "../../components/Title.tsx";

import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import {usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {
    GlobalForm,
    GlobalFormContainer,
    GoogleButton,
    GoogleIcon,
    GoogleLoginSpan, LinkRegisterLogin,
    Visibility
} from "../../global_styles/style.ts";
import {LoginCreateButton} from "../../components/LoginCreateButton.tsx";

export function Login() {
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();

    return (
        <GlobalFormContainer>
            <Title />
            <GlobalForm>
                <label htmlFor="email">E-mail</label>
                <input type="email" placeholder="Digite seu e-mail" required />
                <div>
                    <label htmlFor="password">Senha</label>
                    <a>Esqueceu a senha?</a>
                </div>

                <div>
                    <input type={inputType} placeholder="Digite sua senha" required  />
                    <Visibility onClick={handlePasswordVisibility}>
                        {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                    </Visibility>
                </div>
                <LoginCreateButton text="Login"/>
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