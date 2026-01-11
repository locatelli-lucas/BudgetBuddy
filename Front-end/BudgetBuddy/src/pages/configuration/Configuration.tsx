import {Sidebar} from "../../components/sidebar/Sidebar.tsx";
import {useContext, useRef, useState} from "react";
import {UserContext} from "../../contexts/UserContext.tsx";
import {
    ConfigurationButtonsContainer,
    ConfigurationContainer,
    ConfigurationContent,
    ConfigurationContentContainer,
    ConfigurationForm, ConfigurationInputContainer
} from "./style.ts";
import {ChangePageButton} from "../../global_styles/buttons/buttons.style.ts";
import {GlobalFormButton} from "../../components/buttons/GlobalFormButton.tsx";

export function Configuration() {
    const {username, email, monthlyIncome} = useContext(UserContext);
    const [isClickedAccount, setIsClickedAccount] = useState<boolean>(true);
    const [isClickedSecurity, setIsClickedSecurity] = useState<boolean>(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const monthlyIncomeRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        return undefined;
    }

    const handleAccountClick = () => {
        if (!isClickedAccount) {
            setIsClickedAccount(true);
            setIsClickedSecurity(false);
        }
    }

    const handleSecurityClick = () => {
        if (!isClickedSecurity) {
            setIsClickedAccount(false);
            setIsClickedSecurity(true);
        }
    }

    return (
        <ConfigurationContainer>
            <Sidebar />
            <ConfigurationContentContainer>
                <ConfigurationContent>
                    <ConfigurationButtonsContainer>
                        <ChangePageButton onClick={handleAccountClick} isClicked={isClickedAccount}>Conta</ChangePageButton>
                        <ChangePageButton onClick={handleSecurityClick} isClicked={isClickedSecurity}>Segurança</ChangePageButton>
                    </ConfigurationButtonsContainer>
                    <ConfigurationForm>
                        <ConfigurationInputContainer>
                            <label htmlFor="username">Nome completo</label>
                            <input ref={nameRef} type="text" name="username" placeholder={username}/>
                        </ConfigurationInputContainer>
                        <ConfigurationInputContainer>
                            <label htmlFor="email">E-mail</label>
                            <input ref={emailRef} type="email" name="email" placeholder={email}/>
                        </ConfigurationInputContainer>
                        <ConfigurationInputContainer>
                            <label htmlFor="monthlyIncome">Renda mensal</label>
                            <input ref={monthlyIncomeRef} type="number" name="monthlyIncome" placeholder={String(monthlyIncome)}/>
                        </ConfigurationInputContainer>
                        <GlobalFormButton text="Atualizar dados" onClick={handleButtonClick()} type="submit" marginTop="1rem"/>
                    </ConfigurationForm>
                </ConfigurationContent>
            </ConfigurationContentContainer>

        </ConfigurationContainer>
    )
}