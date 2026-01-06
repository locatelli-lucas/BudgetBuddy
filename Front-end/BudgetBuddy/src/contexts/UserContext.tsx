import {createContext} from "react";
import type {UserContextType} from "../types/Types.ts";

export const UserContext = createContext<UserContextType>({} as UserContextType);
