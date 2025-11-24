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

  // Professional color palette
  const COLORS = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
    '#ef4444', '#06b6d4', '#ec4899', '#14b8a6',
    '#f97316', '#6366f1'
  ];

  const limitOptions = [100, 200, 500, 1000, 2000,4000,6000,8000,10000];
  

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
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(0);
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
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (page >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
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
        <div className="bg-white p-2 shadow-lg rounded border border-gray-300">
          <p className="font-semibold text-gray-900 text-xs mb-1">{data.fullAnswer}</p>
          <p className="text-gray-700 text-xs">Count: {data.count}</p>
          <p className="text-gray-700 text-xs">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartType, isExpanded = false) => {
    const height = isExpanded ? 450 : 250;
    const dataToShow = aggregatedData.length > 15 ? getTopResponses(aggregatedData, 15) : aggregatedData;
    
    switch(chartType) {
      case 'horizontalBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToShow} layout="vertical" margin={{ left: 100, right: 20, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" style={{ fontSize: '10px', fill: '#4b5563' }} />
              <YAxis dataKey={isExpanded ? "answer" : "shortAnswer"} type="category" width={isExpanded ? 150 : 100} style={{ fontSize: '10px', fill: '#4b5563' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
              <Bar dataKey="count" fill="url(#barGradient1)" radius={[0, 4, 4, 0]} />
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
                innerRadius={isExpanded ? 90 : 55}
                outerRadius={isExpanded ? 140 : 85}
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {dataToShow.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={dataToShow} margin={{ bottom: 60 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={70} style={{ fontSize: '9px', fill: '#4b5563' }} />
              <YAxis style={{ fontSize: '10px', fill: '#4b5563' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={dataToShow} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={70} style={{ fontSize: '9px', fill: '#4b5563' }} />
              <YAxis style={{ fontSize: '10px', fill: '#4b5563' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'verticalBar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToShow} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="shortAnswer" angle={-45} textAnchor="end" height={70} style={{ fontSize: '9px', fill: '#4b5563' }} />
              <YAxis style={{ fontSize: '10px', fill: '#4b5563' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.7}/>
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="shortAnswer" style={{ fontSize: '10px', fill: '#4b5563' }} />
              <PolarRadiusAxis style={{ fontSize: '9px' }} />
              <Radar name="Responses" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#radarGradient)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const ChartCard = ({ title, chartType, children, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r ${color || 'from-blue-600 to-indigo-600'} px-3 py-2 flex items-center justify-between`}>
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          {title}
        </h3>
        <button
          onClick={() => setExpandedChart(chartType)}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-all"
          title="Expand chart"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="p-3">
        {children || renderChart(chartType)}
      </div>
    </div>
  );

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-red-300 rounded-lg p-6 max-w-md shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-red-800 font-semibold text-lg mb-2 text-center">Error Loading Data</h3>
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full ">
          
          {/* Pagination Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Items per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-2 py-1 border border-blue-300 rounded text-xs font-medium text-gray-900 bg-white hover:bg-blue-50 cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  {limitOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Page info */}
              <div className="text-xs font-medium text-gray-700">
                Showing {totalCount > 0 ? startIndex : 0} - {endIndex} of {totalCount} surveys
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className={`p-1.5 rounded text-xs font-medium transition-colors ${
                    page === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-0.5">
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-2 py-1 text-gray-500 text-xs">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageClick(pageNum)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-300'
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
                  className={`p-1.5 rounded text-xs font-medium transition-colors ${
                    page >= totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        
          {/* Question Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            <label className="block text-xs font-semibold text-gray-900 mb-2 uppercase flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              Select Question to Analyze
            </label>
            <div className="relative">
              <select
                value={selectedQuestion}
                onChange={handleQuestionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 text-sm transition-all hover:border-blue-400 cursor-pointer"
              >
                <option value="">-- Choose a question --</option>
                {questions.map((q, index) => (
                  <option key={index} value={q.value}>
                    {q.question}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium text-blue-700 uppercase">Total Responses</h3>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium text-green-700 uppercase">Average</h3>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.average}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium text-purple-700 uppercase">Unique Options</h3>
                  <PieIcon className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.diversity}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium text-orange-700 uppercase">Top Response</h3>
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">{stats.topCount}</p>
                <p className="text-xs text-gray-600 mt-0.5 truncate" title={stats.topResponse}>{stats.topResponse}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          {aggregatedData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-3 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'charts', label: 'Charts', icon: '📈' },
                  { id: 'comparison', label: 'Comparison', icon: '⚖️' },
                  { id: 'detailed', label: 'Detailed', icon: '📋' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {aggregatedData.length > 0 && (
            <div className="space-y-3">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <ChartCard title="Horizontal Bar Chart" chartType="horizontalBar" color="from-blue-600 to-indigo-600" />
                  <ChartCard title="Donut Chart" chartType="donut" color="from-purple-600 to-pink-600" />
                </div>
              )}

              {/* Charts Tab */}
              {activeTab === 'charts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <ChartCard title="Area Chart" chartType="area" color="from-blue-600 to-cyan-600" />
                  <ChartCard title="Line Chart" chartType="line" color="from-orange-600 to-amber-600" />
                  <ChartCard title="Vertical Bar Chart" chartType="verticalBar" color="from-purple-600 to-indigo-600" />
                  <ChartCard title="Radar Chart" chartType="radar" color="from-green-600 to-teal-600" />
                </div>
              )}

              {/* Comparison Tab */}
              {activeTab === 'comparison' && (
                <div className="space-y-3">
                  <ChartCard title="Top Responses Comparison" chartType="verticalBar" color="from-orange-600 to-amber-600" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getTopResponses(aggregatedData, 9).map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xs font-semibold text-gray-900 flex-1 line-clamp-2" title={item.fullAnswer}>
                            {item.answer}
                          </h4>
                          <span 
                            className="text-xl font-bold ml-2"
                            style={{ color: COLORS[index % COLORS.length] }}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-700 font-medium">{item.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Tab */}
              {activeTab === 'detailed' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 px-3 py-2">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      Detailed Response Distribution
                    </h2>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                              Rank
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                              Response
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                              Count
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                              Distribution
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {aggregatedData.map((item, index) => (
                            <tr key={index} className="hover:bg-blue-50 transition-colors">
                              <td className="px-3 py-2">
                                <span 
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-900 font-medium" title={item.fullAnswer}>
                                <div className="max-w-xs truncate">{item.fullAnswer}</div>
                              </td>
                              <td className="px-3 py-2">
                                <span 
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                >
                                  {item.count}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full transition-all"
                                      style={{ 
                                        width: `${item.percentage}%`,
                                        backgroundColor: COLORS[index % COLORS.length]
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-800 w-10 text-right">{item.percentage}%</span>
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
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium text-sm">No responses found for this question.</p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3" 
          onClick={() => setExpandedChart(null)}
        >
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {expandedChart === 'horizontalBar' && 'Horizontal Bar Chart'}
                {expandedChart === 'donut' && 'Donut Chart'}
                {expandedChart === 'area' && 'Area Chart'}
                {expandedChart === 'line' && 'Line Chart'}
                {expandedChart === 'verticalBar' && 'Vertical Bar Chart'}
                {expandedChart === 'radar' && 'Radar Chart'}
              </h2>
              <button
                onClick={() => setExpandedChart(null)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4">
              {renderChart(expandedChart, true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Report1;