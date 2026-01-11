import styled from "styled-components";
import {googleColor, hiddenGray, inputLabelColor, mainColor, robotoFontFamily} from "../style.ts";

type FormButtonProps = {
    marginTop?: string;
}

type ChangePageButtonProps = {
    isClicked: boolean;
}

export const Visibility = styled.button`
    transform: scale(1.4);
    margin-left: -40px;
    border: none;
    background: none;
    color: ${hiddenGray};
    padding: 1rem 0 0 0.5rem;
`
export const FormButton = styled.button<FormButtonProps>`
    color: #ffffff;
    background-color: ${mainColor};
    font-weight: 600;
    width: 30rem;
    height: 2.8em;
    border-radius: 0.5em;
    border: none;
    cursor: pointer;
    margin-top: ${props => props.marginTop};
`
export const GoogleButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 1.5em;
    color: ${hiddenGray};
    background-color: ${googleColor};
    font-weight: 600;
    width: 31.5em;
    height: 2.8em;
    border-radius: 0.5em;
    border-style: none;
    margin-top: 1em;
    position: relative;
    
    & span {
        position: relative;
        color: ${hiddenGray};
    }
`
export const ChangePageButton = styled.button<ChangePageButtonProps>`
    width: 50%;
    font-family: ${robotoFontFamily};
    color: ${props => props.isClicked ? `${mainColor}` : `${inputLabelColor}`};
    border-bottom: ${props => props.isClicked ? `2px solid ${mainColor}` : `none`};
    transition: 0.1s ease-in-out;
    
    &:hover {
        cursor: pointer;
    }
`