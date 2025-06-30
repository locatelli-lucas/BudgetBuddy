import styled from "styled-components";
import {fontFamily, googleColor, hiddenGray, mainColor} from "../../global_styles/style.ts";


export const ContainerLogin = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3em;
`;

export const FormLogin = styled.form`
    display: flex;
    flex-direction: column;
    
    & label {
        font-family: Inter, sans-serif;
        margin-bottom: 0.5em;
        font-weight: 540;
    }
    & input {
        margin-bottom: 1em;
        width: 30em;
        height: 2.8em;
        border-radius: 0.5em;
        border: 1px solid #dadee3;
        padding-left: 1em;
    }
`;