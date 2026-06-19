import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteList from "./pages/SiteList.jsx";
import NewSite from "./pages/NewSite.jsx";
import SiteAssessment from "./pages/SiteAssessment.jsx";

function App() {
  return (
    <main className="app-shell">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteList />} />
          <Route path="/sites/new" element={<NewSite />} />
          <Route path="/sites/:siteId" element={<SiteAssessment />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
