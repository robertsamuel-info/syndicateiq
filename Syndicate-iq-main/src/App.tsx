import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Spinner } from './components/ui/Progress';

// Lazy load pages for code splitting
const Intro = lazy(() => import('./pages/Intro').then((module) => ({ default: module.Intro })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const DocumentProcessing = lazy(() => import('./pages/DocumentProcessing').then((module) => ({ default: module.DocumentProcessing })));
const DueDiligence = lazy(() => import('./pages/DueDiligence').then((module) => ({ default: module.DueDiligence })));
const DueDiligenceWorkflow = lazy(() => import('./pages/DueDiligenceWorkflow').then((module) => ({ default: module.DueDiligenceWorkflowPage })));
const CovenantMonitoring = lazy(() => import('./pages/CovenantMonitoring').then((module) => ({ default: module.CovenantMonitoring })));
const ESGMonitoring = lazy(() => import('./pages/ESGMonitoring').then((module) => ({ default: module.ESGMonitoring })));
const ESGVeritas = lazy(() => import('./pages/ESGVeritas').then((module) => ({ default: module.ESGVeritas })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <Spinner />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Intro page - no layout */}
      <Route path="/" element={<Intro />} />
      
      {/* All other pages - with MainLayout */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/document-processing"
        element={
          <MainLayout>
            <DocumentProcessing />
          </MainLayout>
        }
      />
      <Route
        path="/due-diligence"
        element={
          <MainLayout>
            <DueDiligence />
          </MainLayout>
        }
      />
      <Route
        path="/due-diligence-workflow"
        element={
          <MainLayout>
            <DueDiligenceWorkflow />
          </MainLayout>
        }
      />
      <Route
        path="/covenant-monitoring"
        element={
          <MainLayout>
            <CovenantMonitoring />
          </MainLayout>
        }
      />
      <Route
        path="/esg-monitoring"
        element={
          <MainLayout>
            <ESGMonitoring />
          </MainLayout>
        }
      />
      <Route
        path="/esg-veritas"
        element={
          <MainLayout>
            <ESGVeritas />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
