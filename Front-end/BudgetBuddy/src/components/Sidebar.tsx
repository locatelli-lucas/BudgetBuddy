import {GlobalTitle, SidebarContainer} from "../global_styles/style.ts";
import {MdOutlineLogout, MdOutlineSettings} from "react-icons/md";
import {SidebarButton} from "./SidebarButton.tsx";
import {HiOutlineSquares2X2} from "react-icons/hi2";
import {LuArrowRightLeft, LuWallet} from "react-icons/lu";
import {PiInvoiceBold} from "react-icons/pi";
import {FiTrendingDown} from "react-icons/fi";
import {GiBullseye} from "react-icons/gi";
import {SideBarList} from "../pages/dashboard/style.ts";

export function Sidebar() {
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
           <GlobalTitle />
           <SideBarList>
               {iconsLabels.map((item, index) => (
                   <li key={index}>
                       <SidebarButton icon={item.icon} label={item.label} />
                   </li>
               ))}
           </SideBarList>
           <div>
               <MdOutlineLogout />
               <span>Sair</span>
           </div>
       </SidebarContainer>
    )
}