import styled from "styled-components";
import {fontFamily, googleColor, hiddenGray, mainColor} from "../../global_styles/style.ts";


export const ContainerLogin = styled.div`
    font-family: ${fontFamily};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3em;
    height: 98vh;
`;

export const FormLogin = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1em;
    
    & label {
        position: relative;
        font-family: Inter, sans-serif;
        font-weight: 540;
        top: 0.5em;
    }
    & input {
        width: 30em;
        height: 2.8em;
        border-radius: 0.5em;
        border: 1px solid ${hiddenGray};
        color: ${hiddenGray};
        padding-left: 1em;
    }
    
    & a {
        position: relative;
        color: ${mainColor};
        margin-left: 14em;
        top: 0.5em;
    }
`;

export const Visibility = styled.button`
    transform: scale(1.4);
    margin-left: -40px;
    border: none;
    background: none;
    color: ${hiddenGray};
`
export const LoginButton = styled.button`
    color: white;
    background-color: ${mainColor};
    font-weight: 600;
    width: 31.5em;
    height: 2.8em;
    border-radius: 0.5em;
    border-style: none;
`
export const GoogleLoginSpan = styled.div`
    position: relative;
    display: flex;
    gap: 1em;
    top: 1em;
    
    & span {
        color: ${hiddenGray};
    }
    
    & hr {
        background: #4B5768;
        width: 8em;
        height: 1px;
        border: none
    }
`

export const GoogleButton = styled.button`
    color: #4B5768;
    background-color: ${googleColor};
    font-weight: 600;
    width: 31.5em;
    height: 2.8em;
    border-radius: 0.5em;
    border-style: none;
    margin-top: 1em;
    & a {
        position: relative;
        color: #4B5768;
    }
`