import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, Sector 
} from 'recharts';
import { 
  Users, UserCheck, UserCog, UserX, TrendingUp, Activity, BarChart3, Target, 
  MapPin, Clock, Phone, MessageSquare, CheckCircle, AlertCircle, Zap, 
  Eye, Calendar, Navigation, Signal, Battery, Wifi, Camera, Shield,
  Home, BookOpen, Droplet,  Award, Briefcase, Users2, Building, Flag,
  Rocket
} from 'lucide-react';
import LiveTracking from './LiveTracking'; // Assuming this component exists
import LiveMap from './LiveMap'; // Assuming this component exists

// ===================================================================================
// DUMMY API HANDLER
// ===================================================================================
const handleApiSubmission = async (chartTitle, data) => {
  console.log(`[API SIMULATION] Submitting data for: ${chartTitle}`);
  console.log("[API SIMULATION] Data:", { name: data.name, bilingualLabel: data.bilingualLabel, value: data.value });
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[API SIMULATION] Submission for ${chartTitle} complete.`);
};

// ===================================================================================
// MOCK DATA FOR SURVEY DASHBOARD (BILINGUAL)
// ===================================================================================
const totalRecordsData = { survey: 12530, qc: 152, zc: 84, ot: 311 };
const surveyProgressData = [
  { day: 'Day 1', surveys: 450, bilingualLabel: 'দিন ১ / Day 1' },
  { day: 'Day 2', surveys: 980, bilingualLabel: 'দিন ২ / Day 2' },
  { day: 'Day 3', surveys: 1530, bilingualLabel: 'দিন ৩ / Day 3' },
  { day: 'Day 4', surveys: 2840, bilingualLabel: 'দিন ৪ / Day 4' },
  { day: 'Day 5', surveys: 4120, bilingualLabel: 'দিন ৫ / Day 5' },
  { day: 'Day 6', surveys: 6780, bilingualLabel: 'দিন ৬ / Day 6' },
  { day: 'Day 7', surveys: 8990, bilingualLabel: 'দিন ৭ / Day 7' },
  { day: 'Day 8', surveys: 10820, bilingualLabel: 'দিন ৮ / Day 8' },
  { day: 'Day 9', surveys: 12530, bilingualLabel: 'দিন ৯ / Day 9' },
];
const ageData = [
  { name: 'Above 60', value: 1179, bilingualLabel: '৬০ ৰ ওপৰত / Above 60' },
  { name: '46-60', value: 2175, bilingualLabel: '৪৬-৬০ / 46-60' },
  { name: '36-45', value: 2718, bilingualLabel: '৩৬-৪৫ / 36-45' },
  { name: '24-35', value: 3086, bilingualLabel: '২৪-৩৫ / 24-35' },
  { name: '18-23', value: 871, bilingualLabel: '১৮-২৩ / 18-23' },
];
const AGE_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
const genderData = [
    { name: 'Male', value: 5446, bilingualLabel: 'পুৰুষ / Male' },
    { name: 'Female', value: 7076, bilingualLabel: 'মহিলা / Female' },
    { name: 'Other', value: 8, bilingualLabel: 'অন্যান্য / Other' },
];
const GENDER_COLORS = ['#3B82F6', '#EC4899', '#8B5CF6'];
const educationData = [
  { name: 'Illiterate', value: 2698, bilingualLabel: 'অশিক্ষিত / Illiterate' },
  { name: 'Primary', value: 3933, bilingualLabel: 'প্ৰাথমিক / Primary' },
  { name: 'High School', value: 1783, bilingualLabel: 'হাইস্কুল / High School' },
  { name: '12th Pass', value: 1033, bilingualLabel: 'দ্বাদশ উত্তীৰ্ণ / 12th Pass' },
  { name: 'Graduate', value: 538, bilingualLabel: 'স্নাতক / Graduate' },
  { name: 'Postgraduate', value: 44, bilingualLabel: 'স্নাতকোত্তৰ / Postgraduate' },
];
const EDUCATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];
const religionData = [
    { name: 'Hinduism', value: 8721, bilingualLabel: 'হিন্দু / Hinduism' },
    { name: 'Islam', value: 3502, bilingualLabel: 'ইছলাম / Islam' },
    { name: 'Christianity', value: 251, bilingualLabel: 'খ্ৰীষ্টান / Christianity' },
    { name: 'Other', value: 56, bilingualLabel: 'অন্যান্য / Other' },
];
const RELIGION_COLORS = ['#F97316', '#10B981', '#3B82F6', '#6B7280'];
const casteData = [
    { name: 'General', value: 4890, bilingualLabel: 'সাধাৰণ / General' },
    { name: 'OBC', value: 5123, bilingualLabel: 'অবিচি / OBC' },
    { name: 'SC', value: 1543, bilingualLabel: 'এছচি / SC' },
    { name: 'ST', value: 974, bilingualLabel: 'এছটি / ST' },
];
const CASTE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const occupationData = [
  { name: 'Housewife', value: 4158, bilingualLabel: 'গৃহিণী / Housewife' },
  { name: 'Unskilled Labor', value: 2071, bilingualLabel: 'অদক্ষ শ্ৰমিক / Unskilled Labor' },
  { name: 'Farmer', value: 1208, bilingualLabel: 'কৃষক / Farmer' },
  { name: 'Unemployed', value: 782, bilingualLabel: 'বেকাৰ / Unemployed' },
  { name: 'Small Business', value: 495, bilingualLabel: 'সৰু ব্যৱসায় / Small Business' },
  { name: 'Student', value: 463, bilingualLabel: 'ছাত্র-ছাত্রী / Student' },
  { name: 'Other', value: 280, bilingualLabel: 'অন্যান্য / Other' },
];
const OCCUPATION_COLORS = ['#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#06B6D4', '#8B5CF6'];
const localIssuesData = [
  { name: 'Poor Roads', value: 5102, bilingualLabel: 'ৰাস্তা-ঘাটৰ দুৰাৱস্থা / Poor Road Conditions' },
  { name: 'Unemployment', value: 4855, bilingualLabel: 'নিবনুৱা সমস্যা / Unemployment' },
  { name: 'Inflation', value: 3987, bilingualLabel: 'মূল্যবৃদ্ধি / Inflation' },
  { name: 'Lack of Drinking Water', value: 2431, bilingualLabel: 'খোৱা পানীৰ সমস্যা / Lack of Drinking Water' },
  { name: 'Poor Healthcare', value: 1899, bilingualLabel: 'চিকিৎসা ব্যৱস্থাৰ অভাৱ / Poor Healthcare' },
  { name: 'Flood & Erosion', value: 1560, bilingualLabel: 'বানপানী আৰু গৰাখহনীয়া / Flood & Erosion' },
];
const mlaReelectionData = [
    { name: 'Yes', value: 6050, bilingualLabel: 'হয় / Yes' },
    { name: 'No', value: 3927, bilingualLabel: 'নহয় / No' },
    { name: 'Can\'t say', value: 2552, bilingualLabel: 'ক\'ব নোৱাৰো / Can\'t say' },
];
const MLA_REELECTION_COLORS = ['#10B981', '#EF4444', '#6B7280'];
const nextCMChoiceData = [
    { name: 'Himanta Biswa Sarma', value: 9546, bilingualLabel: 'হিমন্ত বিশ্ব শৰ্মা / Himanta Biswa Sarma' },
    { name: 'Gaurav Gogoi', value: 851, bilingualLabel: 'গৌৰৱ গগৈ / Gaurav Gogoi' },
    { name: 'Sarbananda Sonowal', value: 722, bilingualLabel: 'সৰ্বানন্দ সোণোৱাল / Sarbananda Sonowal' },
    { name: 'Other', value: 1411, bilingualLabel: 'অন্য / Other' },
];
const NEXT_CM_CHOICE_COLORS = ['#F97316', '#3B82F6', '#F59E0B', '#6B7280'];

// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================
const Card = ({ children, className = "", hover = false }) => (
  <div className={`
    bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg
    ${hover ? 'hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1' : ''}
    transition-all duration-300
    ${className}
  `}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-gray-100 ${className}`}>{children}</div>
);
const CardTitle = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {Icon && <Icon className="h-6 w-6 text-indigo-600" />}
    <h3 className="text-md font-semibold text-gray-800 leading-tight">{children}</h3>
  </div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`relative p-6 ${className}`}>{children}</div>
);
const StatCard = ({ icon: Icon, title, value, colorClass, trend }) => (
  <Card hover={true} className="group p-6">
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
const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400
      ${active 
        ? 'bg-white text-indigo-700 shadow-md' 
        : 'text-gray-600 hover:text-indigo-700 hover:bg-white/60'
      }
    `}
  >
    {Icon && <Icon className="h-5 w-5" />}
    {children}
  </button>
);

// ===================================================================================
// SURVEY CHART COMPONENTS
// ===================================================================================
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 11;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4} // Explode effect
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-semibold">{`${payload.bilingualLabel}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={14} textAnchor={textAnchor} fill="#666" className="text-xs">{`(${(percent * 100).toFixed(1)}%)`}</text>
    </g>
  );
};
const GenericPieChart = ({ title, data, colors, icon: Icon }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  const CustomLegend = ({ payload }) => (
    <div className="w-full mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors">
            <div style={{ backgroundColor: entry.color }} className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" />
            <span className="text-gray-700 text-xs font-medium truncate" title={entry.payload.bilingualLabel}>{entry.payload.bilingualLabel}</span>
            <span className="text-gray-500 text-xs ml-auto">{entry.payload.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card hover={true}>
      <CardHeader><CardTitle icon={Icon || Target}>{title}</CardTitle></CardHeader>
      <CardContent className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => [`${value.toLocaleString()} (${(props.payload.percent * 100).toFixed(1)}%)`, props.payload.bilingualLabel]}
              contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius="70%"
              innerRadius={0} // Makes it a 2D Pie Chart
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={(payload) => handleApiSubmission(title, payload)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#ffffff" strokeWidth={2} />)}
            </Pie>
            <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
const GenericHorizontalBarChart = ({ title, data, colors, icon: Icon }) => {
  return (
    <Card hover={true} className="xl:col-span-2">
      <CardHeader><CardTitle icon={Icon || BarChart3}>{title}</CardTitle></CardHeader>
      <CardContent className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#9ca3af" />
            <YAxis 
              type="category" 
              dataKey="bilingualLabel" 
              width={200}
              tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} 
              stroke="#9ca3af"
              interval={0}
            />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), 'ভোট / Votes']}
              labelFormatter={(label) => label}
              contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
const GenericAreaChart = ({ title, data, color, icon: Icon }) => {
  return (
    <Card hover={true} className="xl:col-span-3">
        <CardHeader><CardTitle icon={Icon || TrendingUp}>{title}</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false}/>
                    <XAxis dataKey="bilingualLabel" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), 'সমীক্ষা / Surveys']}
                      contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="surveys" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
};

const SurveyDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="মুঠ সমীক্ষা / Total Surveys" value={totalRecordsData.survey} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600" trend="+12.3%"/>
        <StatCard icon={UserCheck} title="মুঠ QC ৰেকৰ্ড / Total QC" value={totalRecordsData.qc} colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600" trend="+8.1%"/>
        <StatCard icon={UserCog} title="মুঠ ZC ৰেকৰ্ড / Total ZC" value={totalRecordsData.zc} colorClass="bg-gradient-to-br from-purple-500 to-purple-600" trend="+5.7%"/>
        <StatCard icon={UserX} title="মুঠ OT ৰেকৰ্ড / Total OT" value={totalRecordsData.ot} colorClass="bg-gradient-to-br from-pink-500 to-pink-600" trend="+15.2%"/>
      </div>
      
      {/* Time Series Chart */}
      <GenericAreaChart title="দৈনিক সমীক্ষাৰ অগ্ৰগতি / Daily Survey Progress" data={surveyProgressData} color="#4f46e5" icon={TrendingUp} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <GenericPieChart title="বয়স / Age" data={ageData} colors={AGE_COLORS} icon={Calendar} />
        <GenericPieChart title="লিঙ্গ / Gender" data={genderData} colors={GENDER_COLORS} icon={Users2} />
        <GenericPieChart title="শিক্ষা / Education" data={educationData} colors={EDUCATION_COLORS} icon={BookOpen} />
        <GenericPieChart title="ধৰ্ম / Religion" data={religionData} colors={RELIGION_COLORS} icon={Home} />
        <GenericPieChart title="জাতি / Caste" data={casteData} colors={CASTE_COLORS} icon={Users} />
        <GenericPieChart title="ব্যৱসায় / Occupation" data={occupationData} colors={OCCUPATION_COLORS} icon={Briefcase} />
        <GenericHorizontalBarChart title="গুৰুত্বপূৰ্ণ স্থানীয় সমস্যা / Key Local Issues" data={localIssuesData} colors={['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']} icon={Rocket} />
        <GenericPieChart title="বিধায়ক পুনৰ নিৰ্বাচন / MLA Re-election" data={mlaReelectionData} colors={MLA_REELECTION_COLORS} icon={Award} />
        <GenericPieChart title="পৰৱৰ্তী ಮುಖ್ಯಮಂತ್ರಿ / Next CM" data={nextCMChoiceData} colors={NEXT_CM_CHOICE_COLORS} icon={Flag} />
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">বিশ্লেষণ ডেশ্ববৰ্ড / Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1 text-sm">সঠিক তথ্য আৰু বাস্তৱ-সময়ৰ নিৰীক্ষণ / Accurate data and real-time monitoring</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="relative flex items-center justify-center">
                  <div className="absolute h-3 w-3 rounded-full bg-red-500 animate-ping"></div>
                  <Activity className="h-4 w-4 text-red-500" />
              </div>
              <span className="font-semibold text-red-500">Live</span>
            </div>
          </div>
          
          {/* Tabs */}
          <nav className="flex gap-2 bg-gray-100/50 p-1.5 rounded-xl backdrop-blur-sm w-full md:w-auto">
            <TabButton active={activeTab === 'surveys'} onClick={() => setActiveTab('surveys')} icon={BarChart3}>সমীক্ষা বিশ্লেষণ / Survey Analytics</TabButton>
            <TabButton active={activeTab === 'tracking'} onClick={() => setActiveTab('tracking')} icon={Navigation}>লাইভ ট্ৰেকিং / Live Tracking</TabButton>
            <TabButton active={activeTab === 'livemap'} onClick={() => setActiveTab('livemap')} icon={MapPin}>লাইভ সমীক্ষা / Live Survey</TabButton>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'surveys' && <SurveyDashboard />}
        {activeTab === 'tracking' && <LiveTracking />}
        {activeTab === 'livemap' && <LiveMap />}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">© 2024 Survey Analytics Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;