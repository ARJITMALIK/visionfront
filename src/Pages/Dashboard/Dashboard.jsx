import React, { useState } from 'react';

import Report1 from './Report1';
import Boothwise from './Boothwise';


// ===================================================================================
// DUMMY API HANDLER
// ===================================================================================

const SurveyDashboard = () => {
  return (
    <div className="">
    
     
      <Boothwise/>
      <Report1/>
      
    
    
    </div>
  );
};

// ===================================================================================
// MAIN DASHBOARD COMPONENT
// ===================================================================================
const Dashboard = () => {

  return (
    <div className="min-h-screen bg-gray-50">
   
 <SurveyDashboard />

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