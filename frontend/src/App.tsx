import { MemoryRouter, Routes, Route } from "react-router-dom"
import { Report } from "./pages/Report"

export default function App() {
  return (
    <MemoryRouter initialEntries={["/report/mock-c"]}>
      <Routes>
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </MemoryRouter>
  )
}
