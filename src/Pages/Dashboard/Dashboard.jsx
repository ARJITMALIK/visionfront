import React, { useState } from 'react';

import Report1 from './Report1';
import Boothwise from './Boothwise';


// ===================================================================================
// DUMMY API HANDLER
// ===================================================================================

const SurveyDashboard = () => {
  return (
    <div className="space-y-6">
    
     
      <Boothwise/>
      <Report1/>
      
    
    
    </div>
  );
};

// ===================================================================================
// MAIN DASHBOARD COMPONENT
// ===================================================================================
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('surveys');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-0.5 text-sm">Real-time survey monitoring and analytics</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
              </div>
              <span className="font-medium text-red-500">Live</span>
            </div>
          </div>
          
         
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'surveys' && <SurveyDashboard />}
       
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">© 2025 Survey Analytics Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;