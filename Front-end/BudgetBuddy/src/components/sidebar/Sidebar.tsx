import {MdOutlineSettings} from "react-icons/md";
import {SidebarButton} from "./SidebarButton.tsx";
import {HiOutlineSquares2X2} from "react-icons/hi2";
import {LuArrowRightLeft, LuWallet} from "react-icons/lu";
import {PiInvoiceBold} from "react-icons/pi";
import {FiTrendingDown} from "react-icons/fi";
import {GiBullseye} from "react-icons/gi";
import {SidebarTitle} from "./SidebarTitle.tsx";
import {useContext, useState} from "react";
import {LogoutButton} from "../buttons/LogoutButton.tsx";
import {SidebarProfile} from "./SidebarProfile.tsx";
import {SidebarContainer, SideBarList} from "../../global_styles/sidebar/sidebar.style.ts";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../../contexts/UserContext.tsx";

export function Sidebar() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const {id, username} = useContext(UserContext);
    const iconsLabels = [
        {
            icon: HiOutlineSquares2X2,
            label: "Dashboard",
            route: "/dashboard"
        },
        {
            icon: LuWallet,
            label: "Saldos",
            route: "/saldos"
        },
        {
            icon: LuArrowRightLeft,
            label: "Transações",
            route: "/transacoes"
        },
        {
            icon: PiInvoiceBold,
            label: "Contas",
            route: "/contas"
        },
        {
            icon: FiTrendingDown,
            label: "Gastos",
            route: "/gastos"
        },
        {
            icon: GiBullseye,
            label: "Metas",
            route: "/metas"
        },
        {
            icon: MdOutlineSettings,
            label: "Configurações",
            route: "/configuracoes"
        }
    ];

    const handleButtonClick = (route: string, index: number) => {
        setActiveIndex(index);
        navigate(`/${id}${route}`);
    }

    return (
       <SidebarContainer>
           <SidebarTitle />
           <SideBarList>
               {iconsLabels.map((item, index) => (
                   <SidebarButton key={index} icon={item.icon} label={item.label} clicked={activeIndex === index} onClick={() => handleButtonClick(item.route, index)} />
               ))}
           </SideBarList>
           <LogoutButton />
           <SidebarProfile username={username}/>
       </SidebarContainer>
    )
}