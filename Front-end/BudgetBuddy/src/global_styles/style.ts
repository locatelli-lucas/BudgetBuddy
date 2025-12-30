import styled from "styled-components";
import {Link} from "react-router-dom";

export const mainColor = "#299e92";
export const hiddenGray = "#999DA3";
export const fontFamily = "Montserrat, sans-serif";
export const labelFontFamily = "Roboto, sans-serif"
export const googleColor = "#E4E7EB";
export const darkTextColor = "#191d24";

interface GlobalProps {
    isMoneyInput?: boolean;
}

export const GlobalTitle = styled.h1`
    position: relative;
    font-family: ${fontFamily};
    margin: -1em 0;
    color: ${mainColor};
`;

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
`;

export const GlobalMoneySign = styled.span`
    
`

export const GlobalInput = styled.input<GlobalProps>`
    width: 30em;
    height: 2.8em;
    border-radius: 0.5em;
    border: 1px solid ${hiddenGray};
    color: ${hiddenGray};
    padding-left: 1em;
`

export const GlobalFormContainer = styled.div`
    font-family: ${fontFamily};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3em;
    margin-top: 5em;
    margin-bottom: 5em;
`;

export const Visibility = styled.button`
    transform: scale(1.4);
    margin-left: -40px;
    border: none;
    background: none;
    color: ${hiddenGray};
    padding: 1rem 0 0 0.5rem;
`
export const FormButton = styled.button`
    color: #ffffff;
    background-color: ${mainColor};
    font-weight: 600;
    width: 26rem;
    height: 2.8em;
    border-radius: 0.5em;
    border: none;
    cursor: pointer;
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
        background: ${hiddenGray};
        width: 8em;
        height: 1px;
        border: none;
        margin-bottom: 1em;
    }
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

export const GoogleIcon = styled.div`
    transform: scale(2.0);
    position: relative;
    top: 0.2em;
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
    font-family: ${labelFontFamily};
    font-weight: 600;
`