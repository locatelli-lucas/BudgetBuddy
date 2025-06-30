import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./pages/login/Login.tsx";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<h1>Page not found</h1>}/>
          <Route path="/login" element={<Login />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
