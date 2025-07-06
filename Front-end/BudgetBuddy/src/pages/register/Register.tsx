import {Title} from "../../components/title/Title.tsx";

import {FcGoogle} from "react-icons/fc";
import {usePasswordVisibility} from "../../hooks/Hooks.tsx";
import {GoEye, GoEyeClosed} from "react-icons/go";
import {
    GlobalForm,
    GlobalFormContainer,
    GoogleButton,
    GoogleIcon,
    GoogleLoginSpan, LinkRegisterLogin,
    LoginCreateButton,
    Visibility
} from "../../global_styles/style.ts";
import {Subtitle} from "./style.ts";

export function Register() {
    const {inputType, passwordVisibility, handlePasswordVisibility} = usePasswordVisibility();

    return (
        <GlobalFormContainer>
            <Title />
            <Subtitle>Crie sua conta</Subtitle>
            <GlobalForm>
                <label htmlFor="name">Nome</label>
                <input type="text" placeholder="Digite seu nome" required />
                <label htmlFor="email">E-mail</label>
                <input type="email" placeholder="Digite seu e-mail" required />
                <label htmlFor="password">Senha</label>
                <div>
                    <input type={inputType} placeholder="Digite sua senha" required  />
                    <Visibility onClick={handlePasswordVisibility}>
                        {passwordVisibility ? <GoEyeClosed /> : <GoEye />}
                    </Visibility>
                </div>
                <LoginCreateButton>
                    Login
                </LoginCreateButton>
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
                <LinkRegisterLogin to="/login">
                    Faça login
                </LinkRegisterLogin>
            </div>

        </GlobalFormContainer>
    );
}