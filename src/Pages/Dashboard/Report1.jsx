import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronDown, TrendingUp, Users, PieChart as PieIcon, BarChart3, Maximize2, X } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

const Report1 = () => {
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [aggregatedData, setAggregatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedChart, setExpandedChart] = useState(null);

  // Professional blue color palette
  const COLORS = [
    '#1e40af', // blue-800
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#bfdbfe', // blue-200
    '#1e3a8a', // blue-900
    '#1d4ed8', // blue-700
    '#0ea5e9', // sky-500
    '#0284c7', // sky-600
  ];

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      
      const response = await VisionBase.get('/surveys');
      
      const surveyData = response.data.data.rows;
      setSurveys(surveyData);
      
      if (surveyData.length > 0 && surveyData[0].sur_data) {
        const uniqueQuestions = surveyData[0].sur_data.map(item => ({
          question: item.question,
          value: item.question
        }));
        setQuestions(uniqueQuestions);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch survey data: ' + err.message);
      setLoading(false);
      console.error('Error fetching surveys:', err);
    }
  };

  const aggregateResponses = (questionText) => {
    const responseCounts = {};
    
    surveys.forEach(survey => {
      const questionData = survey.sur_data.find(item => item.question === questionText);
      if (questionData && questionData.answer) {
        const answer = questionData.answer.trim();
        responseCounts[answer] = (responseCounts[answer] || 0) + 1;
      }
    });

    return Object.entries(responseCounts)
      .map(([answer, count]) => ({
        answer: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
        shortAnswer: answer.length > 20 ? answer.substring(0, 20) + '...' : answer,
        fullAnswer: answer,
        count: count,
        percentage: ((count / surveys.length) * 100).toFixed(1),
        value: count
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getTopResponses = (data, limit = 5) => {
    return data.slice(0, limit);
  };

  const calculateStats = () => {
    if (!aggregatedData.length) return null;
    
    const total = aggregatedData.reduce((sum, item) => sum + item.count, 0);
    const avg = total / aggregatedData.length;
    const topResponse = aggregatedData[0];
    const diversity = aggregatedData.length;
    
    return {
      total,
      average: avg.toFixed(1),
      topResponse: topResponse.fullAnswer,
      topCount: topResponse.count,
      diversity
    };
  };

  const handleQuestionChange = (e) => {
    const question = e.target.value;
    setSelectedQuestion(question);
    
    if (question) {
      const aggregated = aggregateResponses(question);
      setAggregatedData(aggregated);
    } else {
      setAggregatedData([]);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-xl rounded-lg border-2 border-blue-500">
          <p className="font-semibold text-gray-900 mb-2">{data.fullAnswer}</p>
          <p className="text-blue-600 font-medium">Count: {data.count}</p>
          <p className="text-blue-500 font-medium">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartType, isExpanded = false) => {
    const height = isExpanded ? 600 : 350;
    const dataToShow = aggregatedData.length > 15 ? getTopResponses(aggregatedData, 15) : aggregatedData;
    
    switch(chartType) {
      case 'horizontalBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToShow} layout="vertical" margin={{ left: 100, right: 20, top: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis dataKey={isExpanded ? "answer" : "shortAnswer"} type="category" width={isExpanded ? 200 : 120} style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={dataToShow}
                dataKey="count"
                nameKey="shortAnswer"
                cx="50%"
                cy="50%"
                innerRadius={isExpanded ? 120 : 80}
                outerRadius={isExpanded ? 200 : 120}
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {dataToShow.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={dataToShow} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={dataToShow} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 6, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'verticalBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToShow} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]}>
                {dataToShow.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={getTopResponses(aggregatedData, 8)}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="shortAnswer" style={{ fontSize: '11px' }} />
              <PolarRadiusAxis />
              <Radar name="Responses" dataKey="count" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const ChartCard = ({ title, chartType, children }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-blue-600 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={() => setExpandedChart(chartType)}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          title="Expand chart"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-6">
        {children || renderChart(chartType)}
      </div>
    </div>
  );

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border-2 border-red-300 rounded-lg p-8 max-w-md shadow-lg">
          <h3 className="text-red-800 font-bold text-xl mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full ">
        
          {/* Question Selector */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Select Question to Analyze
            </label>
            <div className="relative">
              <select
                value={selectedQuestion}
                onChange={handleQuestionChange}
                className="w-full px-5 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium text-base transition-all hover:border-gray-400"
              >
                <option value="">-- Choose a question --</option>
                {questions.map((q, index) => (
                  <option key={index} value={q.value}>
                    {q.question}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Total Responses</h3>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
              </div>
              
              <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Average</h3>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.average}</p>
              </div>
              
              <div className="bg-white border-l-4 border-blue-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Unique Options</h3>
                  <PieIcon className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.diversity}</p>
              </div>
              
              <div className="bg-white border-l-4 border-blue-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Top Response</h3>
                  <BarChart3 className="w-8 h-8 text-blue-700" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.topCount}</p>
                <p className="text-xs text-gray-600 mt-2 truncate" title={stats.topResponse}>{stats.topResponse}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          {aggregatedData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 mb-6 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {['overview', 'charts', 'comparison', 'detailed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all text-base whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {aggregatedData.length > 0 && (
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Horizontal Bar Chart" chartType="horizontalBar" />
                  <ChartCard title="Donut Chart" chartType="donut" />
                </div>
              )}

              {/* Charts Tab */}
              {activeTab === 'charts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Area Chart" chartType="area" />
                  <ChartCard title="Line Chart" chartType="line" />
                  <ChartCard title="Vertical Bar Chart" chartType="verticalBar" />
                  <ChartCard title="Radar Chart" chartType="radar" />
                </div>
              )}

              {/* Comparison Tab */}
              {activeTab === 'comparison' && (
                <div className="space-y-6">
                  <ChartCard title="Top Responses Comparison" chartType="verticalBar" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getTopResponses(aggregatedData, 9).map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-base font-semibold text-gray-900 flex-1 line-clamp-2" title={item.fullAnswer}>
                            {item.answer}
                          </h4>
                          <span className="text-3xl font-bold text-blue-600 ml-4">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{item.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Tab */}
              {activeTab === 'detailed' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Response Distribution</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider rounded-tl-lg">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Response
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                            Count
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider rounded-tr-lg">
                            Distribution
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {aggregatedData.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium" title={item.fullAnswer}>
                              <div className="max-w-xs truncate">{item.fullAnswer}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                {item.count}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                  <div
                                    className="h-3 rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${item.percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 w-12">{item.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedQuestion && aggregatedData.length === 0 && (
            <div className="bg-white border-2 border-blue-300 rounded-lg p-8 text-center shadow-md">
              <p className="text-blue-900 font-semibold text-lg">No responses found for this question.</p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setExpandedChart(null)}>
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-blue-600 p-6 flex items-center justify-between z-10 shadow-md">
              <h2 className="text-2xl font-bold text-white">
                {expandedChart === 'horizontalBar' && 'Horizontal Bar Chart'}
                {expandedChart === 'donut' && 'Donut Chart'}
                {expandedChart === 'area' && 'Area Chart'}
                {expandedChart === 'line' && 'Line Chart'}
                {expandedChart === 'verticalBar' && 'Vertical Bar Chart'}
                {expandedChart === 'radar' && 'Radar Chart'}
              </h2>
              <button
                onClick={() => setExpandedChart(null)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="p-8">
              {renderChart(expandedChart, true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Report1;