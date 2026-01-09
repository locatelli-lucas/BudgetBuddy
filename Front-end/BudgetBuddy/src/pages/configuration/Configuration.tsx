import {Sidebar} from "../../components/sidebar/Sidebar.tsx";
import {useContext} from "react";
import {UserContext} from "../../contexts/UserContext.tsx";
import {
    ConfigurationButtonsContainer,
    ConfigurationContainer,
    ConfigurationContent,
    ConfigurationContentContainer,
    ConfigurationForm
} from "./style.ts";
import {ChangePageButton} from "../../global_styles/buttons/buttons.style.ts";

export function Configuration() {
    const {username, email, monthlyIncome} = useContext(UserContext);



    return (
        <ConfigurationContainer>
            <Sidebar />
            <ConfigurationContentContainer>
                <ConfigurationContent>
                    <ConfigurationButtonsContainer>
                        <ChangePageButton>Account</ChangePageButton>
                        <ChangePageButton>Security</ChangePageButton>
                    </ConfigurationButtonsContainer>
                    <ConfigurationForm>
                        <label htmlFor="username">Nome completo</label>
                        <input type="text" name="username" placeholder={username}/>

                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email" placeholder={email}/>

                        <label htmlFor="monthlyIncome">Renda mensal</label>
                        <input type="number" name="monthlyIncome" placeholder={monthlyIncome.toString()}/>

                        <button>Atualizar dados</button>
                    </ConfigurationForm>
                </ConfigurationContent>
            </ConfigurationContentContainer>

        </ConfigurationContainer>
    )
}