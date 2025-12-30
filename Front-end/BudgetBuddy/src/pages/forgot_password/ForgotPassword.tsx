import {
    GlobalForm,
    GlobalFormContainer,
    GlobalFormLink,
    GlobalInput,
    GlobalInputContainer, GlobalLabel
} from "../../global_styles/style.ts";
import {Title} from "../../components/Title.tsx";
import {ForgotPasswordContainer, ForgotPasswordSpan} from "./style.ts";
import {useRef} from "react";
import {GlobalFormButton} from "../../components/GlobalFormButton.tsx";

export function ForgotPassword() {
    const emailInput = useRef<HTMLInputElement>(null);

    return (
        <GlobalFormContainer>
            <Title />
            <GlobalForm>
                <ForgotPasswordContainer>
                    <h2>
                        Esqueceu a senha?
                    </h2>
                    <ForgotPasswordSpan>
                        Digite se e-mail para receber o link de redefinição de senha.
                    </ForgotPasswordSpan>
                </ForgotPasswordContainer>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="email">E-mail</GlobalLabel>
                    <GlobalInput name="email" ref={emailInput} type="email" placeholder="Digite seu e-mail"/>
                </GlobalInputContainer>
                <GlobalFormButton text="Enviar" type="submit"/>
            </GlobalForm>
            <GlobalFormLink to="/login">
                Voltar ao login
            </GlobalFormLink>
        </GlobalFormContainer>
    );
}