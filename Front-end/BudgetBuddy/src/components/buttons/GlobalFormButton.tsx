import {FormButton} from "../../global_styles/buttons/buttons.style.ts";

interface Props {
    text: string
    onClick?: () => void;
    type: "button" | "submit" | "reset" | undefined;
    marginTop?: string;
}

export function GlobalFormButton({text, onClick, type, marginTop} : Props) {
    return (
        <FormButton onClick={onClick} type={type} marginTop={marginTop}>
            {text}
        </FormButton>
    );
}