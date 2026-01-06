import {SideBarProfileContainer} from "../../global_styles/sidebar/sidebar.style.ts";

interface Props {
    username: string;
}

export function SidebarProfile(props: Props) {
    return (
        <SideBarProfileContainer>
            <span>{props.username}</span>
        </SideBarProfileContainer>
    )

}