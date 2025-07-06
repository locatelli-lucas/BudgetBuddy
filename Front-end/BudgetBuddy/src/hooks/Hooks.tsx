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