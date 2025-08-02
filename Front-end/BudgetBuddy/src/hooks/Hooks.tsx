import {useState} from "react";

export function usePasswordVisibility() {
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const handlePasswordVisibility = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setPasswordVisibility(prev => !prev);
    }

    const inputType = passwordVisibility ? "text" : "password";

    return {
        inputType,
        passwordVisibility,
        handlePasswordVisibility
    };
}

export function useFormatNumber() {
    const formatMoneyToNumberStr = (value: string) => {
        return value.replace(/\s/g, '')
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
                .replace(/(\.\d*?)0+$/, '$1')
                .replace(/\.$/, '');
    }
    const formatNumberToMoney = (value: string) => {
        const numValue = Number(value);
        return new Intl.NumberFormat('pt-BR', {
                 style: 'currency',
                 currency: 'BRL',
             }).format(numValue);
    }

    return {
        formatMoneyToNumberStr,
        formatNumberToMoney
    };
}

export function useIsNumeric() {
    const isNumeric = (value: string) => {
        return !isNaN(Number(value)) && !isNaN(parseFloat(value));
    }
    return {
        isNumeric
    };
}