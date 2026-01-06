import styled from "styled-components";
import {fontFamily, robotoFontFamily} from "../style.ts";

export const sidebarBg = "#1a1a1a";
export const sidebarColor = "#FFFFFF"
export const sideBarButtonHoverBg = "#333333";

interface SidebarButtonProps {
    clicked: boolean;
}

export const SidebarContainer = styled.div`
    background: ${sidebarBg};
    color: ${sidebarColor};
    width: 15vw;
    height: 100vh;
    position: relative;
    padding-top: 2rem;
`

export const SidebarButtonContainer = styled.div<SidebarButtonProps>`
    height: 3.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-left: 1.5rem;
    font-family: ${robotoFontFamily};
    background: ${props => props.clicked ? "#299e92" : "transparent"};
    
    &:hover {
        background: ${props => props.clicked ? "#299e92" : sideBarButtonHoverBg};
    }
`
export const SideBarButtonIcon = styled.div`
    font-size: 1.5rem;
`
export const SideBarTitle = styled.h2`
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 0 0 2rem 0;
    font-family: ${fontFamily};
`
export const LogoutButtonContainer = styled.div`
    border-radius: 4px;
    background: #262626;
    width: 80%;
    height: 3.2rem;
    font-size: 1.3rem;
    font-family: ${robotoFontFamily};
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: center;
    padding-left: 0.7rem;
    margin: 0 0 2rem 10%;
    cursor: pointer;
    
    &:hover {
        background: #333333;
    }
`
export const SideBarProfileContainer = styled.div`
    width: 100%;
    height: 6rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    padding-left: 10%;
    gap: 0.4rem;
    border-top: 1px solid #bababa;
    
    & span {
        font-family: ${robotoFontFamily};
        font-size: 1.1rem;
    }
    
    & a {
        font-family: ${robotoFontFamily};
        font-size: 0.8rem;
        cursor: pointer;
        color: #bababa;
        
        &:hover {
            text-decoration: underline;
        }
    }
`
export const SideBarList = styled.ul`
    list-style-type: none;
    margin-bottom: 16rem;
`