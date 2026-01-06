import {MdOutlineLogout} from "react-icons/md";
import {LogoutButtonContainer} from "../../global_styles/sidebar/sidebar.style.ts";

export function LogoutButton() {
    return (
        <LogoutButtonContainer>
            <MdOutlineLogout />
            <span>Sair</span>
        </LogoutButtonContainer>
    )
}