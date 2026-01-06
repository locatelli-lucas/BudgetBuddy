import {SideBarProfileContainer} from "../../global_styles/sidebar/sidebar.style.ts";

interface Props {
    userName: string;
}

export function SidebarProfile(props: Props) {
    return (
        <SideBarProfileContainer>
            <span>{props.userName}</span>
            <a>Ver perfil</a>
        </SideBarProfileContainer>
    )

}