import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteList from "./pages/SiteList.jsx";
import NewSite from "./pages/NewSite.jsx";
import SiteLayout from "./pages/SiteLayout.jsx";
import SiteAssessment from "./pages/SiteAssessment.jsx";
import AuditTool from "./pages/AuditTool.jsx";
import ObservationTool from "./pages/ObservationTool.jsx";
import PersonaTool from "./pages/PersonaTool.jsx";
import InterventionMatrix from "./pages/InterventionMatrix.jsx";
import ReportCard from "./pages/ReportCard.jsx";

function App() {
  return (
    <main className="app-shell">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteList />} />
          <Route path="/sites/new" element={<NewSite />} />
          <Route path="/sites/:siteId" element={<SiteLayout />}>
            <Route index element={<Navigate to="assessment" replace />} />
            <Route path="assessment" element={<SiteAssessment />} />
            <Route path="audit" element={<AuditTool />} />
            <Route path="observations" element={<ObservationTool />} />
            <Route path="personas" element={<PersonaTool />} />
            <Route path="interventions" element={<InterventionMatrix />} />
            <Route path="report-card" element={<ReportCard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
