import styled from "styled-components";
import {bodyBgColor, inputLabelColor, robotoFontFamily, windowsBgColor} from "../../global_styles/style.ts";

export const ConfigurationContainer = styled.div`
    display: flex;
    flex-direction: row;
    background: ${bodyBgColor};
    font-family: ${robotoFontFamily};
`
export const ConfigurationContentContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 85vw;
`
export const ConfigurationContent = styled.div`
    border-radius: 20px;
    width: 75vw;
    height: 80vh;
    background: ${windowsBgColor};
    padding: 2rem;
`
export const ConfigurationButtonsContainer = styled.div`
    display: flex;
    height: 10%;
    width: 18%;
    margin-bottom: 1.5rem;
`
export const ConfigurationForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 45%;
`
export const ConfigurationInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    width: 100%;
    
    & label {
        font-weight: bold;
        color: ${inputLabelColor};
    }
    
    & input {
        border: 1px solid ${inputLabelColor};
        border-radius: 5px;
        height: 3rem;
        padding-left: 1rem;
        outline: none;
    }
`