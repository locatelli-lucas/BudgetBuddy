import {FormButton} from "../global_styles/style.ts";

interface Props {
    text: string
    onClick?: () => void;
}

export function LoginCreateButton({text, onClick} : Props) {
    return (
        <FormButton onClick={onClick}>
            {text}
        </FormButton>
    );
}