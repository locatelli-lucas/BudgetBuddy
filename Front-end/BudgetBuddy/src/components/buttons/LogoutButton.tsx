import {MdOutlineLogout} from "react-icons/md";
import {LogoutButtonContainer} from "../../global_styles/sidebar/sidebar.style.ts";
import {useNavigate} from "react-router-dom";

export function LogoutButton() {
    const navigate = useNavigate();

    return (
        <LogoutButtonContainer onClick={() => navigate("/login")}>
            <MdOutlineLogout />
            <span>Sair</span>
        </LogoutButtonContainer>
    )
}