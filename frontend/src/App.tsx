import { MemoryRouter, Routes, Route } from "react-router-dom"
import { Landing } from "./pages/Landing"
import { Analyzing } from "./pages/Analyzing"
import { Report } from "./pages/Report"

export default function App() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </MemoryRouter>
  )
}
