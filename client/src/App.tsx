import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/public/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}