import styled from "styled-components";
import {bodyBgColor, windowsBgColor} from "../../global_styles/style.ts";

export const ConfigurationContainer = styled.div`
    display: flex;
    flex-direction: row;
    background: ${bodyBgColor};
`
export const ConfigurationContentContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
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
    margin-bottom: 3rem;
`
export const ConfigurationForm = styled.form`
    
`