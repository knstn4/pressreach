import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { GeneratorPage } from "./pages/GeneratorPage";
import { TextImprovementPage } from "./pages/TextImprovementPage";
import DistributionPage from "./pages/DistributionPage";
import DistributionHistoryPage from "./pages/DistributionHistoryPage";
import MediaManagementPage from "./pages/MediaManagementPage";
import DashboardPage from "./pages/DashboardPage";
import ReleaseDetailPage from "./pages/ReleaseDetailPage";
import BrandingPage from "./pages/BrandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <GeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/improve-text"
          element={
            <ProtectedRoute>
              <TextImprovementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distribution"
          element={
            <ProtectedRoute>
              <DistributionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distribution/history"
          element={
            <ProtectedRoute>
              <DistributionHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/media-management"
          element={
            <ProtectedRoute>
              <MediaManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/releases/:id"
          element={
            <ProtectedRoute>
              <ReleaseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branding"
          element={
            <ProtectedRoute>
              <BrandingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <ScrollToTop />
    </Router>
  );
}

export default App;
