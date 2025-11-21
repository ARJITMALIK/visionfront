import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronDown, TrendingUp, Users, PieChart as PieIcon, BarChart3, Maximize2, X, Activity, Target, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  // Enhanced vibrant color palette
  const COLORS = [
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#6366f1', // Indigo
  ];

  const TAB_COLORS = {
    overview: { bg: 'from-purple-600 to-pink-600', icon: '📊' },
    charts: { bg: 'from-blue-600 to-cyan-600', icon: '📈' },
    comparison: { bg: 'from-amber-600 to-orange-600', icon: '⚖️' },
    detailed: { bg: 'from-emerald-600 to-teal-600', icon: '📋' }
  };

  const limitOptions = [100, 200, 500, 1000, 2000];

  useEffect(() => {
    fetchSurveys();
  }, [page, limit]);

  useEffect(() => {
    if (selectedQuestion && surveys.length > 0) {
      const aggregated = aggregateResponses(selectedQuestion);
      setAggregatedData(aggregated);
    }
  }, [surveys, selectedQuestion]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      
      const response = await VisionBase.get(`/surveys?limit=${limit}&page=${page}&sorting_field=sur_id&sorting_type=DESC`);
      
      const surveyData = response.data.data.rows || [];
      const total = response.data.data.count || 0;
      
      setSurveys(surveyData);
      setTotalCount(total);
      
      if (surveyData.length > 0 && surveyData[0].sur_data) {
        const uniqueQuestions = surveyData[0].sur_data.map(item => ({
          question: item.question,
          value: item.question
        }));
        setQuestions(uniqueQuestions);
      } else {
        setQuestions([]);
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

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = page * limit + 1;
  const endIndex = Math.min((page + 1) * limit, totalCount);

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when limit changes
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page < 3) {
        for (let i = 0; i < 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (page >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 shadow-2xl rounded-xl border-2 border-purple-400">
          <p className="font-semibold text-white mb-2">{data.fullAnswer}</p>
          <p className="text-purple-300 font-medium">Count: {data.count}</p>
          <p className="text-purple-200 font-medium">Percentage: {data.percentage}%</p>
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
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" strokeWidth={2} />
              <XAxis type="number" style={{ fontSize: '12px', fontWeight: '600', fill: '#6b21a8' }} />
              <YAxis dataKey={isExpanded ? "answer" : "shortAnswer"} type="category" width={isExpanded ? 200 : 120} style={{ fontSize: '12px', fontWeight: '600', fill: '#6b21a8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: '600' }} />
              <Bar dataKey="count" fill="url(#barGradient1)" radius={[0, 12, 12, 0]} />
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
              <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={dataToShow} margin={{ bottom: 80 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" strokeWidth={2} />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px', fontWeight: '600', fill: '#1e3a8a' }} />
              <YAxis style={{ fontSize: '12px', fontWeight: '600', fill: '#1e3a8a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={dataToShow} margin={{ bottom: 80 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" strokeWidth={2} />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px', fontWeight: '600', fill: '#7c2d12' }} />
              <YAxis style={{ fontSize: '12px', fontWeight: '600', fill: '#7c2d12' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: '600' }} />
              <Line type="monotone" dataKey="count" stroke="url(#lineGradient)" strokeWidth={4} dot={{ r: 7, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'verticalBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToShow} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" strokeWidth={2} />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px', fontWeight: '600', fill: '#6b21a8' }} />
              <YAxis style={{ fontSize: '12px', fontWeight: '600', fill: '#6b21a8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontWeight: '600' }} />
              <Bar dataKey="count" radius={[12, 12, 0, 0]}>
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
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="#e9d5ff" strokeWidth={2} />
              <PolarAngleAxis dataKey="shortAnswer" style={{ fontSize: '12px', fontWeight: '600', fill: '#065f46' }} />
              <PolarRadiusAxis style={{ fontSize: '11px', fontWeight: '600' }} />
              <Radar name="Responses" dataKey="count" stroke="#10b981" strokeWidth={3} fill="url(#radarGradient)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const ChartCard = ({ title, chartType, children, gradient }) => (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`bg-gradient-to-r ${gradient || 'from-purple-600 to-pink-600'} p-5 flex items-center justify-between`}>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          {title}
        </h3>
        <button
          onClick={() => setExpandedChart(chartType)}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
          title="Expand chart"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        {children || renderChart(chartType)}
      </div>
    </div>
  );

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-purple-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-800 font-semibold text-lg">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white border-4 border-red-400 rounded-2xl p-8 max-w-md shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-red-800 font-bold text-2xl mb-3 text-center">Error Loading Data</h3>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="w-full">
          
          {/* Pagination Controls */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-4 mb-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Items per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-300 focus:border-purple-500 font-semibold text-gray-900 bg-white hover:bg-purple-50 transition-all cursor-pointer"
                >
                  {limitOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Page info */}
              <div className="text-sm font-semibold text-gray-700">
                Showing {totalCount > 0 ? startIndex : 0} - {endIndex} of {totalCount} surveys
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className={`p-2 rounded-lg font-bold transition-all ${
                    page === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-3 py-2 text-gray-500 font-semibold">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageClick(pageNum)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  className={`p-2 rounded-lg font-bold transition-all ${
                    page >= totalPages - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        
          {/* Enhanced Question Selector */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 mb-6 hover:shadow-xl transition-shadow">
            <label className="block text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 uppercase tracking-wide flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Select Question to Analyze
            </label>
            <div className="relative">
              <select
                value={selectedQuestion}
                onChange={handleQuestionChange}
                className="w-full px-6 py-4 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 appearance-none bg-gradient-to-r from-purple-50 to-pink-50 text-gray-900 font-semibold text-base transition-all hover:border-purple-400 cursor-pointer"
              >
                <option value="">-- Choose a question --</option>
                {questions.map((q, index) => (
                  <option key={index} value={q.value}>
                    {q.question}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-purple-500 pointer-events-none w-6 h-6" />
            </div>
          </div>

          {/* Enhanced Statistics Cards with Gradients */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-purple-100 tracking-wide">Total Responses</h3>
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-5xl font-black text-white">{stats.total}</p>
                  <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-pink-100 tracking-wide">Average</h3>
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-5xl font-black text-white">{stats.average}</p>
                  <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-blue-100 tracking-wide">Unique Options</h3>
                    <PieIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-5xl font-black text-white">{stats.diversity}</p>
                  <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-emerald-100 tracking-wide">Top Response</h3>
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-3xl font-black text-white">{stats.topCount}</p>
                  <p className="text-xs text-white text-opacity-90 mt-2 truncate font-medium" title={stats.topResponse}>{stats.topResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tabs with Gradients */}
          {aggregatedData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-3 mb-6 overflow-x-auto">
              <div className="flex space-x-3 min-w-max">
                {['overview', 'charts', 'comparison', 'detailed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 rounded-xl font-bold capitalize transition-all text-base whitespace-nowrap transform hover:scale-105 ${
                      activeTab === tab
                        ? `bg-gradient-to-r ${TAB_COLORS[tab].bg} text-white shadow-lg`
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    <span className="mr-2">{TAB_COLORS[tab].icon}</span>
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
                  <ChartCard title="Horizontal Bar Chart" chartType="horizontalBar" gradient="from-purple-600 to-pink-600" />
                  <ChartCard title="Donut Chart" chartType="donut" gradient="from-blue-600 to-cyan-600" />
                </div>
              )}

              {/* Charts Tab */}
              {activeTab === 'charts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Area Chart" chartType="area" gradient="from-blue-600 to-cyan-600" />
                  <ChartCard title="Line Chart" chartType="line" gradient="from-amber-600 to-orange-600" />
                  <ChartCard title="Vertical Bar Chart" chartType="verticalBar" gradient="from-purple-600 to-indigo-600" />
                  <ChartCard title="Radar Chart" chartType="radar" gradient="from-emerald-600 to-teal-600" />
                </div>
              )}

              {/* Comparison Tab */}
              {activeTab === 'comparison' && (
                <div className="space-y-6">
                  <ChartCard title="Top Responses Comparison" chartType="verticalBar" gradient="from-amber-600 to-orange-600" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getTopResponses(aggregatedData, 9).map((item, index) => (
                      <div key={index} className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-base font-bold text-gray-900 flex-1 line-clamp-2" title={item.fullAnswer}>
                            {item.answer}
                          </h4>
                          <span 
                            className="text-4xl font-black ml-4 text-transparent bg-clip-text bg-gradient-to-br"
                            style={{ backgroundImage: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})` }}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-3 shadow-inner">
                          <div
                            className="h-4 rounded-full transition-all duration-700 shadow-md"
                            style={{ 
                              width: `${item.percentage}%`,
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-700 font-bold">{item.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Tab */}
              {activeTab === 'detailed' && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <Activity className="w-7 h-7" />
                      Detailed Response Distribution
                    </h2>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="overflow-x-auto rounded-xl border-2 border-emerald-200">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                            <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider">
                              Rank
                            </th>
                            <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider">
                              Response
                            </th>
                            <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider">
                              Count
                            </th>
                            <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider">
                              Distribution
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {aggregatedData.map((item, index) => (
                            <tr key={index} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                              <td className="px-6 py-5">
                                <span 
                                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-sm shadow-md"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm text-gray-900 font-semibold" title={item.fullAnswer}>
                                <div className="max-w-xs truncate">{item.fullAnswer}</div>
                              </td>
                              <td className="px-6 py-5">
                                <span 
                                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-black text-white shadow-md"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {item.count}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-1 bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div
                                      className="h-4 rounded-full transition-all duration-700 shadow-md"
                                      style={{ 
                                        width: `${item.percentage}%`,
                                        backgroundColor: COLORS[index % COLORS.length]
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-black text-gray-800 w-14 text-right">{item.percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedQuestion && aggregatedData.length === 0 && (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-12 text-center shadow-xl">
              <div className="bg-white bg-opacity-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-purple-900 font-bold text-xl">No responses found for this question.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Expanded Chart Modal */}
      {expandedChart && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-blue-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setExpandedChart(null)}
        >
          <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-auto shadow-2xl border-4 border-purple-300" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 flex items-center justify-between z-10 shadow-lg rounded-t-3xl">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Activity className="w-8 h-8" />
                {expandedChart === 'horizontalBar' && 'Horizontal Bar Chart'}
                {expandedChart === 'donut' && 'Donut Chart'}
                {expandedChart === 'area' && 'Area Chart'}
                {expandedChart === 'line' && 'Line Chart'}
                {expandedChart === 'verticalBar' && 'Vertical Bar Chart'}
                {expandedChart === 'radar' && 'Radar Chart'}
              </h2>
              <button
                onClick={() => setExpandedChart(null)}
                className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50">
              {renderChart(expandedChart, true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Report1;