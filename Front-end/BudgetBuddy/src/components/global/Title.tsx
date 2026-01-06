import Image from "../../assets/images/Title.png";
import {GlobalTitle} from "../../global_styles/titles/titles.style.ts";

export function Title() {
    return (
        <>
            <img src={Image} alt="Logo" />
            <GlobalTitle>Budget Buddy</GlobalTitle>
        </>
    );
}