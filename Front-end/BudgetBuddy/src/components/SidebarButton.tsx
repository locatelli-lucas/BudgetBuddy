import type {IconType} from "react-icons";
import {SidebarButtonContainer} from "../global_styles/style.ts";

interface Props {
    icon: IconType,
    label: string
}

export function SidebarButton(props: Props) {
    return (
        <SidebarButtonContainer>
            <props.icon />
            <span>{props.label}</span>
        </SidebarButtonContainer>
    )
}