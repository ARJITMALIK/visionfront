import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, Sector 
} from 'recharts';
import { 
  Users, UserCheck, UserCog, UserX, TrendingUp, Activity, BarChart3, Target, 
  MapPin, Clock, Phone, MessageSquare, CheckCircle, AlertCircle, Zap, 
  Eye, Calendar, Navigation, Signal, Battery, Wifi, Camera, Shield,
  Home, BookOpen, Droplet, Award, Briefcase, Users2, Building, Flag,
  Rocket, Grid3x3, Vote, FileText
} from 'lucide-react';


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
const totalRecordsData = { 
  survey: 12530, 
  qc: 152, 
  zc: 84, 
  ot: 311,
  vidhanSabha: 126,
  lokSabha: 14,
  totalBooths: 2847,
  todaySurveys: 1450
};

const surveyProgressData = [
  { day: 'Day 1', surveys: 450, bilingualLabel: 'Day 1' },
  { day: 'Day 2', surveys: 980, bilingualLabel: 'Day 2' },
  { day: 'Day 3', surveys: 1530, bilingualLabel: 'Day 3' },
  { day: 'Day 4', surveys: 2840, bilingualLabel: 'Day 4' },
  { day: 'Day 5', surveys: 4120, bilingualLabel: 'Day 5' },
  { day: 'Day 6', surveys: 6780, bilingualLabel: 'Day 6' },
  { day: 'Day 7', surveys: 8990, bilingualLabel: 'Day 7' },
  { day: 'Day 8', surveys: 10820, bilingualLabel: 'Day 8' },
  { day: 'Day 9', surveys: 12530, bilingualLabel: 'Day 9' },
];

const ageData = [
  { name: 'Above 60', value: 1179, bilingualLabel: 'Above 60' },
  { name: '46-60', value: 2175, bilingualLabel: '46-60' },
  { name: '36-45', value: 2718, bilingualLabel: '36-45' },
  { name: '24-35', value: 3086, bilingualLabel: '24-35' },
  { name: '18-23', value: 871, bilingualLabel: '18-23' },
];
const AGE_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const genderData = [
  { name: 'Male', value: 5446, bilingualLabel: 'Male' },
  { name: 'Female', value: 7076, bilingualLabel: 'Female' },
  { name: 'Other', value: 8, bilingualLabel: 'Other' },
];
const GENDER_COLORS = ['#3B82F6', '#EC4899', '#8B5CF6'];

const educationData = [
  { name: 'Illiterate', value: 2698, bilingualLabel: 'Illiterate' },
  { name: 'Primary', value: 3933, bilingualLabel: 'Primary' },
  { name: 'High School', value: 1783, bilingualLabel: 'High School' },
  { name: '12th Pass', value: 1033, bilingualLabel: '12th Pass' },
  { name: 'Graduate', value: 538, bilingualLabel: 'Graduate' },
  { name: 'Postgraduate', value: 44, bilingualLabel: 'Postgraduate' },
];
const EDUCATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];

const religionData = [
  { name: 'Hinduism', value: 8721, bilingualLabel: 'Hinduism' },
  { name: 'Islam', value: 3502, bilingualLabel: 'Islam' },
  { name: 'Christianity', value: 251, bilingualLabel: 'Christianity' },
  { name: 'Other', value: 56, bilingualLabel: 'Other' },
];
const RELIGION_COLORS = ['#F97316', '#10B981', '#3B82F6', '#6B7280'];

const casteData = [
  { name: 'General', value: 4890, bilingualLabel: 'General' },
  { name: 'OBC', value: 5123, bilingualLabel: 'OBC' },
  { name: 'SC', value: 1543, bilingualLabel: 'SC' },
  { name: 'ST', value: 974, bilingualLabel: 'ST' },
];
const CASTE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const occupationData = [
  { name: 'Housewife', value: 4158, bilingualLabel: 'Housewife' },
  { name: 'Unskilled Labor', value: 2071, bilingualLabel: 'Unskilled Labor' },
  { name: 'Farmer', value: 1208, bilingualLabel: 'Farmer' },
  { name: 'Unemployed', value: 782, bilingualLabel: 'Unemployed' },
  { name: 'Small Business', value: 495, bilingualLabel: 'Small Business' },
  { name: 'Student', value: 463, bilingualLabel: 'Student' },
  { name: 'Other', value: 280, bilingualLabel: 'Other' },
];
const OCCUPATION_COLORS = ['#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#06B6D4', '#8B5CF6'];

const localIssuesData = [
  { name: 'Poor Roads', value: 5102, bilingualLabel: 'Poor Road Conditions' },
  { name: 'Unemployment', value: 4855, bilingualLabel: 'Unemployment' },
  { name: 'Inflation', value: 3987, bilingualLabel: 'Inflation' },
  { name: 'Lack of Drinking Water', value: 2431, bilingualLabel: 'Lack of Drinking Water' },
  { name: 'Poor Healthcare', value: 1899, bilingualLabel: 'Poor Healthcare' },
  { name: 'Flood & Erosion', value: 1560, bilingualLabel: 'Flood & Erosion' },
];

const mlaReelectionData = [
  { name: 'Yes', value: 6050, bilingualLabel: 'Yes' },
  { name: 'No', value: 3927, bilingualLabel: 'No' },
  { name: 'Can\'t say', value: 2552, bilingualLabel: 'Can\'t say' },
];
const MLA_REELECTION_COLORS = ['#10B981', '#EF4444', '#6B7280'];

const nextCMChoiceData = [
  { name: 'Himanta Biswa Sarma', value: 9546, bilingualLabel: 'Himanta Biswa Sarma' },
  { name: 'Gaurav Gogoi', value: 851, bilingualLabel: 'Gaurav Gogoi' },
  { name: 'Sarbananda Sonowal', value: 722, bilingualLabel: 'Sarbananda Sonowal' },
  { name: 'Other', value: 1411, bilingualLabel: 'Other' },
];
const NEXT_CM_CHOICE_COLORS = ['#F97316', '#3B82F6', '#F59E0B', '#6B7280'];

// ===================================================================================
// MODERN UI COMPONENTS
// ===================================================================================
const Card = ({ children, className = "", hover = false }) => (
  <div className={`
    bg-white border border-gray-200 rounded-xl shadow-sm
    ${hover ? 'hover:shadow-md hover:border-gray-300' : ''}
    transition-all duration-200
    ${className}
  `}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-gray-100 ${className}`}>{children}</div>
);

const CardTitle = ({ children, icon: Icon, className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    {Icon && <Icon className="h-5 w-5 text-gray-600" />}
    <h3 className="text-base font-semibold text-gray-800">{children}</h3>
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`relative p-6 ${className}`}>{children}</div>
);

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <Card hover={true}>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3.5 rounded-xl ${colorClass} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none
      ${active 
        ? 'bg-white text-indigo-700 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-md"
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#1f2937" className="text-xs font-semibold">
        {`${payload.bilingualLabel}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={14} textAnchor={textAnchor} fill="#6b7280" className="text-xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
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
            <span className="text-gray-700 text-xs font-medium truncate" title={entry.payload.bilingualLabel}>
              {entry.payload.bilingualLabel}
            </span>
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
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius="70%"
              innerRadius={0}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={(payload) => handleApiSubmission(title, payload)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#ffffff" strokeWidth={2} />
              ))}
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
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#d1d5db" />
            <YAxis 
              type="category" 
              dataKey="bilingualLabel" 
              width={200}
              tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} 
              stroke="#d1d5db"
              interval={0}
            />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), 'Votes']}
              labelFormatter={(label) => label}
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
              ))}
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
            <XAxis dataKey="bilingualLabel" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#d1d5db" />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#d1d5db" />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), 'Surveys']}
              contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} title="Total Surveys" value={totalRecordsData.survey} colorClass="bg-indigo-500" />
        <StatCard icon={FileText} title="Today's Surveys" value={totalRecordsData.todaySurveys} colorClass="bg-emerald-500" />
        <StatCard icon={UserCheck} title="Total QC" value={totalRecordsData.qc} colorClass="bg-purple-500" />
        <StatCard icon={UserCog} title="Total ZC" value={totalRecordsData.zc} colorClass="bg-pink-500" />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserX} title="Total OT" value={totalRecordsData.ot} colorClass="bg-orange-500" />
        <StatCard icon={Building} title="Vidhan Sabha" value={totalRecordsData.vidhanSabha} colorClass="bg-blue-500" />
        <StatCard icon={Vote} title="Lok Sabha" value={totalRecordsData.lokSabha} colorClass="bg-teal-500" />
        <StatCard icon={Grid3x3} title="Total Booths" value={totalRecordsData.totalBooths} colorClass="bg-cyan-500" />
      </div>
      
      {/* Time Series Chart */}
      <GenericAreaChart title="Daily Survey Progress" data={surveyProgressData} color="#6366f1" icon={TrendingUp} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <GenericPieChart title="Age Distribution" data={ageData} colors={AGE_COLORS} icon={Calendar} />
        <GenericPieChart title="Gender Distribution" data={genderData} colors={GENDER_COLORS} icon={Users2} />
        <GenericPieChart title="Education Level" data={educationData} colors={EDUCATION_COLORS} icon={BookOpen} />
        <GenericPieChart title="Religion" data={religionData} colors={RELIGION_COLORS} icon={Home} />
        <GenericPieChart title="Caste" data={casteData} colors={CASTE_COLORS} icon={Users} />
        <GenericPieChart title="Occupation" data={occupationData} colors={OCCUPATION_COLORS} icon={Briefcase} />
        <GenericHorizontalBarChart title="Key Local Issues" data={localIssuesData} colors={['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']} icon={Rocket} />
        <GenericPieChart title="MLA Re-election" data={mlaReelectionData} colors={MLA_REELECTION_COLORS} icon={Award} />
        <GenericPieChart title="Next CM Choice" data={nextCMChoiceData} colors={NEXT_CM_CHOICE_COLORS} icon={Flag} />
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