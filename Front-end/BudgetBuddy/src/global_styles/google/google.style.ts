import styled from "styled-components";
import {hiddenGray} from "../style.ts";

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

export const GoogleIcon = styled.div`
    transform: scale(2.0);
    position: relative;
    top: 0.2em;
`