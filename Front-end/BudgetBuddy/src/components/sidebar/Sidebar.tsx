import {MdOutlineSettings} from "react-icons/md";
import {SidebarButton} from "./SidebarButton.tsx";
import {HiOutlineSquares2X2} from "react-icons/hi2";
import {LuArrowRightLeft, LuWallet} from "react-icons/lu";
import {PiInvoiceBold} from "react-icons/pi";
import {FiTrendingDown} from "react-icons/fi";
import {GiBullseye} from "react-icons/gi";
import {SidebarTitle} from "./SidebarTitle.tsx";
import {useState} from "react";
import {LogoutButton} from "../buttons/LogoutButton.tsx";
import {SidebarProfile} from "./SidebarProfile.tsx";
import {SidebarContainer, SideBarList} from "../../global_styles/sidebar/sidebar.style.ts";

export function Sidebar() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const iconsLabels = [
        {
            icon: HiOutlineSquares2X2,
            label: "Dashboard"
        },
        {
            icon: LuWallet,
            label: "Saldos"
        },
        {
            icon: LuArrowRightLeft,
            label: "Transações"
        },
        {
            icon: PiInvoiceBold,
            label: "Contas",
        },
        {
            icon: FiTrendingDown,
            label: "Gastos"
        },
        {
            icon: GiBullseye,
            label: "Metas"
        },
        {
            icon: MdOutlineSettings,
            label: "Configurações"
        }
    ];

    return (
       <SidebarContainer>
           <SidebarTitle />
           <SideBarList>
               {iconsLabels.map((item, index) => (
                   <SidebarButton key={index} icon={item.icon} label={item.label} clicked={activeIndex === index} onClick={() => setActiveIndex(index)} />
               ))}
           </SideBarList>
           <LogoutButton />
           <SidebarProfile userName="Lucas"/>
       </SidebarContainer>
    )
}