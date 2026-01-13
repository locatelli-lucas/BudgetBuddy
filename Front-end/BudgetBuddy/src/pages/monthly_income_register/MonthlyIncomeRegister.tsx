import {Title} from "../../components/global/Title.tsx";
import {useFormatNumber, useIsNumeric} from "../../hooks/Hooks.tsx";
import {useContext, useEffect, useRef, useState} from "react";
import {GlobalFormButton} from "../../components/buttons/GlobalFormButton.tsx";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {
    GlobalForm,
    GlobalFormContainer, GlobalInput,
    GlobalInputContainer,
    GlobalLabel
} from "../../global_styles/forms/forms.style.ts";
import {UserContext} from "../../contexts/UserContext.tsx";
import {Subtitle} from "../register/style.ts";

export function MonthlyIncomeRegister() {
    const navigate = useNavigate();
    const monthlyIncomeInput = useRef<HTMLInputElement>(null);
    const {formatMoneyToNumberStr, formatNumberToMoney} = useFormatNumber();
    const {isNumeric} = useIsNumeric();
    const [currentValue, setCurrentValue] = useState<string>();
    const {setMonthlyIncome} = useContext(UserContext);


    const handleMonthlyIncomeChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const input = e.key;
        let value: number | string;
        let newValue = "";

        if (isNumeric(input)) {
            if (currentValue) {
                value = formatMoneyToNumberStr(currentValue) + input;
            } else {
                value = input;
            }
            setMonthlyIncome(Number(value))
            newValue = formatNumberToMoney(value);
        } else if (input === "Backspace") {
            if (currentValue && currentValue.length > 0) {
                value = formatMoneyToNumberStr(currentValue).slice(0, -1);
                newValue = formatNumberToMoney(value);
            }
        }

        if(newValue !== "")
            setCurrentValue(newValue);
    };

    useEffect(() => {
        monthlyIncomeInput.current!.value = currentValue || "";
    }, [currentValue]);

    return (
        <GlobalFormContainer height="100vh">
            <Title />
            <Subtitle>Deseja informar sua renda mensal?</Subtitle>
            <GlobalForm onSubmit={() => navigate(`/register/profilepicture`)}>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="monthlyIncome">Renda mensal</GlobalLabel>
                    <GlobalInput ref={monthlyIncomeInput} onKeyDown={e => handleMonthlyIncomeChange(e)} type="text" name="monthlyIncome" placeholder="R$0,00"/>
                </GlobalInputContainer>
                <GlobalFormButton text="Próximo" type="submit" />
            </GlobalForm>
        </GlobalFormContainer>
    );
}