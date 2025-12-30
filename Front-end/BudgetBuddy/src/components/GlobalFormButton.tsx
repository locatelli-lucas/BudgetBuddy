import {FormButton} from "../global_styles/style.ts";

interface Props {
    text: string
    onClick?: () => void;
    type: "button" | "submit" | "reset" | undefined
}

export function GlobalFormButton({text, onClick, type} : Props) {
    return (
        <FormButton onClick={onClick} type={type}>
            {text}
        </FormButton>
    );
}