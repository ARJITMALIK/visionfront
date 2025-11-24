// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your new layout
import AppLayout from './Pages/AppLayout';

// Import your page components using your specified paths
import LoginPage from './Pages/LoginPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import Dashboard from './Pages/Dashboard/Dashboard';
import WebsiteSettings from './Pages/GeneralSettings/WebsiteSettings';
import AllUsers from './Pages/Users/AllUsers';
import AddEmoji from './Pages/Emoji/AddEmoji';
import AllEmoji from './Pages/Emoji/AllEmoji';
import AddElection from './Pages/Elections/AddElection';
import AllElections from './Pages/Elections/AllElections';
import AllSurveyData from './Pages/SurveyData/AllSurveyData';
import AddQuestions from './Pages/Questions/AddQuestions';
import AllQuestions from './Pages/Questions/AllQuestions';
import AddOption from './Pages/QuestionOptions/AddOption';
import AllOptions from './Pages/QuestionOptions/AllOptions';
import AddZone from './Pages/Zone/AddZone';
import AllZone from './Pages/Zone/AllZone';
import AddParty from './Pages/Party/AddParty';
import AllParty from './Pages/Party/AllParty';
import AddCandidates from './Pages/Candidates/AddCandidates';
import AllCandidates from './Pages/Candidates/AllCandidates';
import AddNotification from './Pages/Notification/AddNotification';
import AddDistricts from './Pages/Districts/AddDistricts';
import AllDistricts from './Pages/Districts/AllDistricts';
import AddLoksabha from './Pages/Loksabha/AddLoksabha';
import AllLoksabha from './Pages/Loksabha/AllLoksabha';
import TeamTracking from './Pages/Live/TeamTracking';
import LiveMap from './Pages/Live/LiveMap';
import BoothAssign from './Pages/Users/BoothAssign';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes (No Layout) --- */}
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* --- Main App Routes (Wrapped in AppLayout) --- */}
        <Route 
          path="/*" 
          element={
            <AppLayout>
              <Routes>
                {/* Define all your layout-based pages here */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/teamtrack" element={<TeamTracking />} />
                <Route path="/livemap" element={<LiveMap/>} />
                <Route path="/allusers" element={<AllUsers />} />
                <Route path="/assignbooth" element={<BoothAssign />} />
                <Route path="/addemoji" element={<AddEmoji />} />
                <Route path="/allemoji" element={<AllEmoji />} />
                <Route path="/addelection" element={<AddElection />} />
                <Route path="/allelection" element={<AllElections />} />
                <Route path="/allsurveydata" element={<AllSurveyData />} />
                <Route path="/addquestions" element={<AddQuestions />} />
                <Route path="/allquestions" element={<AllQuestions />} />
                <Route path="/addoption" element={<AddOption />} />
                <Route path="/alloptions" element={<AllOptions />} />
                <Route path="/addbooth" element={<AddZone />} />
                <Route path="/allbooth" element={<AllZone />} />
                
                <Route path="/addparty" element={<AddParty />} />
                <Route path="/allparty" element={<AllParty />} />
                <Route path="/addcandidates" element={<AddCandidates />} />
                <Route path="/allcandidates" element={<AllCandidates />} />
                <Route path="/notification" element={<AddNotification />} />
                <Route path="/add-vidhan" element={<AddDistricts />} />
                <Route path="/all-vidhan" element={<AllDistricts />} />
                <Route path="/addloksabha" element={<AddLoksabha />} />
                <Route path="/allloksabha" element={<AllLoksabha />} />


                {/* IMPORTANT: Use the path that your Sidebar expects for active styling */}
                <Route path="/settings/website" element={<WebsiteSettings />} />

                {/* A catch-all to redirect any unknown path within the app to the dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </AppLayout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;