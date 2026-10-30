import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import CaseIntelligence from './pages/CaseIntelligence';
import RiskAndPriority from './pages/RiskAndPriority';
import LegalAssistant from './pages/LegalAssistant';
import DatasetPage from './pages/DatasetPage';
import LegalResearch from './pages/LegalResearch';
import DraftStudio from './pages/DraftStudio';


function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-slate-950 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Lawyer Workspace Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="draft-studio" element={<DraftStudio />} />
            <Route path="research" element={<LegalResearch />} />
            <Route path="cases" element={<Cases />} />
            <Route path="documents" element={<Documents />} />
            <Route path="intelligence" element={<CaseIntelligence />} />
            <Route path="risk-priority" element={<RiskAndPriority />} />
            <Route path="dataset" element={<DatasetPage />} />
            <Route path="assistant" element={<LegalAssistant />} />
          </Route>


          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}