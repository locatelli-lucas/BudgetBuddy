import './global_styles/fonts.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/register/Register.tsx";
import {ForgotPassword} from "./pages/forgot_password/ForgotPassword.tsx";
import {Dashboard} from "./pages/dashboard/Dashboard.tsx";
import {Configuration} from "./pages/configuration/Configuration.tsx";
import {UserContext} from "./contexts/UserContext.tsx";
import {useState} from "react";
import type {UserContextType} from "./types/Types.ts";

function App() {
  const [user, setUser] = useState<UserContextType | null>(null);

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<h1>Page not found</h1>}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/forgotpassword" element={<ForgotPassword />}/>

          <UserContext.Provider value={{user, setUser} as unknown as UserContextType}>
              <Route path="/:id/dashboard" element={<Dashboard />}/>
              <Route path="/:id/configuracoes" element={<Configuration />}/>
          </UserContext.Provider>
        </Routes>
      </BrowserRouter>
  )
}

export default App
