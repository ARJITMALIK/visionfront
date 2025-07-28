import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { 
  Users, UserCheck, UserCog, UserX, TrendingUp, Activity, BarChart3, Target, 
  MapPin, Clock, Phone, MessageSquare, CheckCircle, AlertCircle, Zap, 
  Eye, Calendar, Navigation, Signal, Battery, Wifi, Camera, Shield
} from 'lucide-react';
import LiveTracking from './LiveTracking';
import LiveMap from './LiveMap';

// ===================================================================================
// DUMMY API HANDLER
// ===================================================================================
const handleApiSubmission = async (chartTitle, data) => {
  console.log(`[API SIMULATION] Submitting data for: ${chartTitle}`);
  console.log("[API SIMULATION] Data:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[API SIMULATION] Submission for ${chartTitle} complete.`);
};

// ===================================================================================
// MOCK DATA FOR SURVEY DASHBOARD
// ===================================================================================
const totalRecordsData = { survey: 10025, qc: 2, zc: 4, ot: 257 };
const ageData = [
  { name: 'Above 60', value: 1179, label: '৬০ ৰ ওপৰত' },
  { name: '46-60', value: 2175, label: '৪৬-৬০' },
  { name: '36-45', value: 2718, label: '৩৬-৪৫' },
  { name: '24-35', value: 3086, label: '২৪-৩৫' },
  { name: '18-23', value: 871, label: '১৮-২৩' },
];
const AGE_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
const genderData = [
    { name: 'Male', value: 4446, label: 'পুৰুষ' },
    { name: 'Female', value: 5576, label: 'মহিলা' },
    { name: 'Other', value: 7, label: 'অন্যান্য' },
];
const GENDER_COLORS = ['#3B82F6', '#EC4899', '#8B5CF6'];
const educationData = [
  { name: 'Literate', value: 2698, label: 'অশিক্ষিত' },
  { name: 'Primary', value: 3933, label: 'প্ৰাথমিক' },
  { name: 'High School Pass', value: 1783, label: 'হাইস্কুল উত্তীৰ্ণ' },
  { name: '12th Pass', value: 1033, label: 'দ্বাদশ উত্তীৰ্ণ' },
  { name: 'Graduate', value: 538, label: 'স্নাতক' },
  { name: 'Postgraduate', value: 44, label: 'স্নাতকোত্তৰ' },
];
const EDUCATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];
const economicStatusData = [
    { name: 'Middle Class', value: 6380, label: 'মধ্যবিত্ত' },
    { name: 'Poor', value: 2794, label: 'দুখীয়া' },
    { name: 'Very Poor', value: 204, label: 'অতি দুখীয়া' },
    { name: 'Rich', value: 141, label: 'ধনী' },
];
const ECONOMIC_STATUS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const occupationData = [
  { name: 'Housewife', value: 4158, label: 'গৃহিণী' },
  { name: 'Student (Male)', value: 184, label: 'ছাত্র' },
  { name: 'Student (Female)', value: 279, label: 'ছাত্রী' },
  { name: 'Farmer', value: 1208, label: 'কৃষক' },
  { name: 'Retired', value: 29, label: 'অৱসৰপ্ৰাপ্ত' },
  { name: 'Small Business', value: 495, label: 'সৰু ব্যৱসায়' },
  { name: 'Private Job', value: 184, label: 'ব্যক্তিগত চাকৰি' },
  { name: 'Government Job', value: 168, label: 'চৰকাৰী চাকৰি' },
  { name: 'Big Business', value: 17, label: 'ডাঙৰ ব্যৱসায়' },
  { name: 'Small-scale Industry', value: 22, label: 'সৰু উদ্যোগ' },
  { name: 'Other', value: 280, label: 'অন্যান্য' },
  { name: 'Unemployed', value: 782, label: 'বেকাৰ' },
  { name: 'Unskilled Labor', value: 2071, label: 'অদক্ষ শ্ৰমিক' },
  { name: 'Industrial Labor', value: 166, label: 'ঔদ্যোগিক শ্ৰমিক' },
];
const OCCUPATION_COLORS = ['#8B5CF6', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#3B82F6', '#84CC16', '#F97316', '#6366F1', '#FBBF24', '#D946EF', '#22D3EE'];
const incomeSourceData = [
    { name: 'Daily Wage', value: 3314, label: 'মজুৰী' },
    { name: 'Own Small Work', value: 460, label: 'নিজৰ সৰু কাম' },
    { name: 'Agriculture', value: 1841, label: 'কৃষি' },
    { name: 'Work in Other State', value: 56, label: 'অন্য ৰাজ্যত কাম' },
    { name: 'Government Job', value: 238, label: 'চৰকাৰী চাকৰি' },
    { name: 'Pension', value: 88, label: 'পেন্সন' },
    { name: 'Own Business', value: 355, label: 'নিজৰ ব্যৱসায়' },
    { name: 'Other', value: 1095, label: 'অন্য' },
    { name: 'No Source', value: 2300, label: 'কোনো উৎস নাই' },
];
const INCOME_SOURCE_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#FBBF24', '#3B82F6'];
const familyProblemsData = [
  { name: 'Lack of Two Meals a Day', value: 874, label: 'এসাঁজ খাবলৈ নোহোৱা' },
  { name: 'Family Safety', value: 243, label: 'পৰিয়ালৰ সুৰক্ষা' },
  { name: 'Inflation', value: 923, label: 'মূল্যবৃদ্ধি' },
  { name: 'Drinking Water', value: 1654, label: 'খোৱা পানী' },
  { name: 'Education System', value: 4652, label: 'শিক্ষা ব্যৱস্থা' },
  { name: 'Low Prices for Crops', value: 4423, label: 'শস্যৰ কম দাম' },
  { name: 'Lack of Area Development', value: 1543, label: 'অঞ্চলটোৰ উন্নয়নৰ অভাৱ' },
];
const politicalInterestData = [
    { name: 'A Little', value: 6380, label: 'অলপ' },
    { name: 'Very much', value: 113, label: 'বহুত বেছি' },
    { name: 'More', value: 372, label: 'অধিক' },
    { name: 'Not at all', value: 822, label: 'একেবাৰে নহয়' },
    { name: 'Can\'t say', value: 561, label: 'ক\'ব নোৱাৰো' },
    { name: 'Very Little', value: 202, label: 'খুব কম' },
    { name: 'Less', value: 1580, label: 'কম' },
];
const POLITICAL_INTEREST_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];
const mlaSatisfactionData = [
    { name: 'Satisfied', value: 4734, label: 'সন্তুষ্ট' },
    { name: 'Very satisfied', value: 1574, label: 'বহুত সন্তুষ্ট' },
    { name: 'Little Happy', value: 2892, label: 'অলপ সুখী' },
    { name: 'Dissatisfied', value: 259, label: 'অসন্তুষ্ট' },
    { name: 'Very dissatisfied', value: 72, label: 'বহুত অসন্তুষ্ট' },
    { name: 'Can\'t say', value: 398, label: 'ক\'ব নোৱাৰো' },
];
const MLA_SATISFACTION_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];
const mlaReelectionData = [
    { name: 'Yes', value: 5050, label: 'হয়' },
    { name: 'No', value: 2927, label: 'নহয়' },
    { name: 'Can\'t say', value: 2052, label: 'ক\'ব নোৱাৰো' },
];
const MLA_REELECTION_COLORS = ['#3B82F6', '#EF4444', '#10B981'];
const stateGovSatisfactionData = [
    { name: 'Satisfied', value: 5439, label: 'সন্তুষ্ট' },
    { name: 'Very satisfied', value: 1535, label: 'বহুত সন্তুষ্ট' },
    { name: 'Little Happy', value: 2632, label: 'অলপ সুখী' },
    { name: 'Dissatisfied', value: 204, label: 'অসন্তুষ্ট' },
    { name: 'Very dissatisfied', value: 25, label: 'বহুত অসন্তুষ্ট' },
    { name: 'Can\'t say', value: 194, label: 'ক\'ব নোৱাৰো' },
];
const STATE_GOV_SATISFACTION_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];
const cmWorkSatisfactionData = [
    { name: 'Satisfied', value: 5792, label: 'সন্তুষ্ট' },
    { name: 'Very satisfied', value: 1519, label: 'বহুত সন্তুষ্ট' },
    { name: 'Little Happy', value: 2300, label: 'অলপ সুখী' },
    { name: 'Dissatisfied', value: 196, label: 'অসন্তুষ্ট' },
    { name: 'Very dissatisfied', value: 41, label: 'বহুত অসন্তুষ্ট' },
    { name: 'Can\'t say', value: 180, label: 'ক\'ব নোৱাৰো' },
];
const CM_WORK_SATISFACTION_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];
const nextCMChoiceData = [
    { name: 'Himanta Biswa Sarma', value: 8546, label: 'হিমন্ত বিশ্ব শৰ্মা' },
    { name: 'Gaurav Gogoi', value: 251, label: 'গৌৰৱ গগৈ' },
    { name: 'Sarbananda Sonowal', value: 522, label: 'সৰ্বানন্দ সোণোৱাল' },
    { name: 'Other', value: 710, label: 'অন্য' },
];
const NEXT_CM_CHOICE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#06B6D4'];



// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================
const Card = ({ children, className = "", hover = false }) => (
  <div className={`
    bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg
    ${hover ? 'hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1' : ''}
    transition-all duration-300 p-6
    ${className}
  `}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {Icon && <Icon className="h-5 w-5 text-gray-600" />}
    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{children}</h3>
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>{children}</div>
);

const CanvasJSWatermark = () => (
  <div className="absolute bottom-3 left-3 text-gray-400 text-xs font-light bg-white/80 px-2 py-1 rounded-md">
    CanvasJS Trial
  </div>
);

const StatCard = ({ icon: Icon, title, value, colorClass, trend }) => (
  <Card hover={true} className="group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          {trend}
        </div>
      )}
    </div>
  </Card>
);

// ===================================================================================
// TAB COMPONENTS
// ===================================================================================
const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
      ${active 
        ? 'bg-white text-blue-600 shadow-lg' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
      }
    `}
  >
    {Icon && <Icon className="h-4 w-4" />}
    {children}
  </button>
);

// ===================================================================================
// SURVEY CHART COMPONENTS
// ===================================================================================
const GenericPieChart = ({ title, data, colors, icon: Icon }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload, percent }) => {
    if (percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const CustomLegend = ({ payload }) => (
    <div className="w-full mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div 
              style={{ backgroundColor: entry.color }} 
              className="w-3 h-3 rounded-full shadow-sm"
            />
            <span className="text-gray-700 font-medium">{entry.payload.label}</span>
            <span className="text-gray-500 text-xs ml-auto">{entry.payload.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card hover={true}>
      <CardHeader>
        <CardTitle icon={Icon || Target}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => {
                if (props && props.payload) {
                  return [
                    `${value.toLocaleString()} (${(props.payload.percent * 100).toFixed(1)}%)`, 
                    props.payload.label
                  ];
                }
                return [value, name];
              }}
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="40%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="65%"
              innerRadius="30%"
              fill="#8884d8"
              dataKey="value"
              onClick={(payload) => handleApiSubmission(title, payload)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        <CanvasJSWatermark />
      </CardContent>
    </Card>
  );
};

const GenericBarChart = ({ title, data, colors, icon: Icon }) => {
  return (
    <Card hover={true} className="lg:col-span-2">
      <CardHeader>
        <CardTitle icon={Icon || BarChart3}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="label" 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={120} 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <Tooltip 
              formatter={(value) => [value.toLocaleString(), 'Count']} 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <CanvasJSWatermark />
      </CardContent>
    </Card>
  );
};




const SurveyDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Survey Records" 
          value={totalRecordsData.survey} 
          colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
          trend="+12.3%"
        />
        <StatCard 
          icon={UserCheck} 
          title="Total QC Records" 
          value={totalRecordsData.qc} 
          colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600"
          trend="+8.1%"
        />
        <StatCard 
          icon={UserCog} 
          title="Total ZC Records" 
          value={totalRecordsData.zc} 
          colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
          trend="+5.7%"
        />
        <StatCard 
          icon={UserX} 
          title="Total OT Records" 
          value={totalRecordsData.ot} 
          colorClass="bg-gradient-to-r from-pink-500 to-pink-600"
          trend="+15.2%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GenericPieChart title="বয়স / Age Distribution" data={ageData} colors={AGE_COLORS} />
        <GenericPieChart title="লিঙ্গ / Gender Distribution" data={genderData} colors={GENDER_COLORS} />
        <GenericPieChart title="শিক্ষা / Education Level" data={educationData} colors={EDUCATION_COLORS} />
        <GenericPieChart title="আপোনাৰ পৰিয়ালৰ অৰ্থনৈতিক অৱস্থা / Economic Status" data={economicStatusData} colors={ECONOMIC_STATUS_COLORS} />
        <GenericPieChart title="ব্যৱসায় / Occupation" data={occupationData} colors={OCCUPATION_COLORS} />
        <GenericPieChart title="উপাৰ্জনৰ প্ৰধান উৎস / Income Source" data={incomeSourceData} colors={INCOME_SOURCE_COLORS} />
        <GenericBarChart title="Family Problems Analysis" data={familyProblemsData} colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']} />
        <GenericPieChart title="Political Interest Level" data={politicalInterestData} colors={POLITICAL_INTEREST_COLORS} />
        <GenericPieChart title="MLA Satisfaction Rating" data={mlaSatisfactionData} colors={MLA_SATISFACTION_COLORS} />
        <GenericPieChart title="MLA Re-election Preference" data={mlaReelectionData} colors={MLA_REELECTION_COLORS} />
        <GenericPieChart title="State Government Satisfaction" data={stateGovSatisfactionData} colors={STATE_GOV_SATISFACTION_COLORS} />
        <GenericPieChart title="CM Work Satisfaction" data={cmWorkSatisfactionData} colors={CM_WORK_SATISFACTION_COLORS} />
        <GenericPieChart title="Next CM Preference" data={nextCMChoiceData} colors={NEXT_CM_CHOICE_COLORS} />
      </div>
    </div>
  );
};

// ===================================================================================
// MAIN DASHBOARD COMPONENT
// ===================================================================================
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('surveys');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive analysis and real-time monitoring</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              <span>Live Data</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg backdrop-blur-sm">
            <TabButton 
              active={activeTab === 'surveys'} 
              onClick={() => setActiveTab('surveys')}
              icon={BarChart3}
            >
              Survey Analytics
            </TabButton>
            <TabButton 
              active={activeTab === 'tracking'} 
              onClick={() => setActiveTab('tracking')}
              icon={Navigation}
            >
              Live Team Tracking
            </TabButton>
            <TabButton 
              active={activeTab === 'livemap'} 
              onClick={() => setActiveTab('livemap')}
              icon={MapPin}
            >
              Live Survey
            </TabButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'surveys' && <SurveyDashboard />}
        {activeTab === 'tracking' && <LiveTracking />}
        {activeTab === 'livemap' && <LiveMap />}
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            © 2024 Survey Analytics Dashboard. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;