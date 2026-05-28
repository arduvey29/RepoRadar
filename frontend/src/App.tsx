import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Landing } from "./pages/Landing"
import { Analyzing } from "./pages/Analyzing"
import { Report } from "./pages/Report"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
