import './global_styles/fonts.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/register/Register.tsx";
import {ForgotPassword} from "./pages/forgot_password/ForgotPassword.tsx";
import {Dashboard} from "./pages/dashboard/Dashboard.tsx";
import {Configuration} from "./pages/configuration/Configuration.tsx";
import {UserContext} from "./contexts/UserContext.tsx";
import {useState} from "react";

function App() {
  const [id, setId] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);

  return (
      <UserContext.Provider value={{
        id,
        username,
        email,
        monthlyIncome,
        setId,
        setUsername,
        setEmail,
        setMonthlyIncome
      }}>
          <BrowserRouter>
              <Routes>
                  <Route path="*" element={<h1>Page not found</h1>}/>
                  <Route path="/login" element={<Login />}/>
                  <Route path="/register" element={<Register />}/>
                  <Route path="/forgotpassword" element={<ForgotPassword />}/>
                  <Route path="/:id/dashboard" element={<Dashboard />}/>
                  <Route path="/:id/configuracoes" element={<Configuration />}/>
              </Routes>
          </BrowserRouter>
      </UserContext.Provider>

  )
}

export default App
