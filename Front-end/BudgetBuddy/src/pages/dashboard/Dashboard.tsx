import {Sidebar} from "../../components/sidebar/Sidebar.tsx";
import {DashboardContainer, DashboardContent} from "./style.ts";

export function Dashboard() {
    return (
        <DashboardContainer>
            <Sidebar />
            <DashboardContent>
                Dashboard Content
            </DashboardContent>
        </DashboardContainer>
    );
}