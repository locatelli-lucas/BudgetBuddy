import type {IconType} from "react-icons";
import {SidebarButtonContainer, SideBarButtonIcon} from "../../global_styles/sidebar/sidebar.style.ts";

interface Props {
    icon: IconType,
    label: string
    clicked: boolean
    onClick: () => void
}

export function SidebarButton(props: Props) {
    return (
        <SidebarButtonContainer clicked={props.clicked} onClick={props.onClick}>
            <SideBarButtonIcon>
                <props.icon />
            </SideBarButtonIcon>
            <span>{props.label}</span>
        </SidebarButtonContainer>
    )
}