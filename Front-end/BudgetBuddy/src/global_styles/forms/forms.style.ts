import styled from "styled-components";
import {fontFamily, hiddenGray, mainColor, robotoFontFamily} from "../style.ts";
import {Link} from "react-router-dom";

interface GlobalFormContainerProps {
    height?: string;
}

export const GlobalForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    
    & label {
        position: relative;
        font-family: ${fontFamily};
        font-weight: 530;
        top: 0.5em;
    }
    
    & a {
        position: relative;
        color: ${mainColor};
        top: 0.5em;
        cursor: pointer;
    }
    
    & button {
        cursor: pointer;
    }
`
export const GlobalInput = styled.input`
    width: 30em;
    height: 2.8em;
    border-radius: 0.5em;
    border: 1px solid ${hiddenGray};
    color: ${hiddenGray};
    padding-left: 1em;
`

export const GlobalFormContainer = styled.div<GlobalFormContainerProps>`
    font-family: ${fontFamily};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3em;
    height: ${props => props.height || "100vh"};
`
export const GlobalFormLink = styled(Link)`
    color: ${mainColor};
    font-weight: 600;
    text-decoration: none;
`
export const GlobalInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
`

export const GlobalLabel = styled.label`
    font-family: ${robotoFontFamily};
    font-weight: 600;
`