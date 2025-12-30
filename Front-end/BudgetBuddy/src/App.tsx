import './global_styles/fonts.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./pages/login/Login.tsx";
import {Register} from "./pages/register/Register.tsx";
import {ForgotPassword} from "./pages/forgot_password/ForgotPassword.tsx";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<h1>Page not found</h1>}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/forgotpassword" element={<ForgotPassword />}/>
          <Route path="/:email/dashboard" />
        </Routes>
      </BrowserRouter>
  )
}

export default App
