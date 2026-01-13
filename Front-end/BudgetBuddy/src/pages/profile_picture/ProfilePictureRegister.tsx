import {Title} from "../../components/global/Title.tsx";
import {useContext, useEffect, useRef} from "react";
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

export function ProfilePictureRegister() {
    const navigate = useNavigate();
    const profilePictureInput = useRef<HTMLInputElement>(null);
    const {username, email profilePicture, setProfilePicture} = useContext(UserContext);

    const handleFormSubmit = () => {
        if(!profilePicture) {

        }
    }

    useEffect(() => {
        setProfilePicture(profilePictureInput.current!.value)
    }, [profilePictureInput.current])

    return (
        <GlobalFormContainer height="100vh">
            <Title />
            <Subtitle>Selecione sua foto de perfil</Subtitle>
            <GlobalForm onSubmit={() => navigate(`/register/profilepicture`)}>
                <GlobalInputContainer>
                    <GlobalLabel htmlFor="profilePicture">Foto de perfil</GlobalLabel>
                    <GlobalInput ref={profilePictureInput} type="file" name="profilePicture"/>
                </GlobalInputContainer>
                <GlobalFormButton text="Criar conta" type="submit" />
            </GlobalForm>
        </GlobalFormContainer>
    );
}