import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, TrendingUp, Users, BarChart3, Search, X, ChevronDown, ChevronUp, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { VisionBase } from '@/utils/axiosInstance';

const Boothwise = () => {
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [boothData, setBoothData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  
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

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await VisionBase.get(`/surveys?limit=${limit}&page=${page}&sorting_field=sur_id&sorting_type=DESC`);
      const surveyData = response.data.data.rows;
      const total = response.data.data.count || 0;
      
      setSurveys(surveyData);
      setTotalCount(total);
      
      if (surveyData.length > 0 && surveyData[0].sur_data) {
        const uniqueQuestions = surveyData[0].sur_data.map(item => ({
          question: item.question,
          value: item.question
        }));
        setQuestions(uniqueQuestions);
        
        const allBoothData = aggregateAllBoothData(surveyData, uniqueQuestions);
        setBoothData(allBoothData);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch survey data: ' + err.message);
      setLoading(false);
      console.error('Error fetching surveys:', err);
    }
  };

  const aggregateAllBoothData = (surveyData, questionsList) => {
    const boothStats = {};
    
    surveyData.forEach(survey => {
      const boothId = survey.booth_id;
      const boothName = survey.zone_name || `Booth ${boothId}`;
      
      if (!boothStats[boothId]) {
        boothStats[boothId] = {
          booth_id: boothId,
          booth_name: boothName,
          zc_name: survey.ot_parent_name,
          total_surveys: 0,
          questions: {}
        };
      }
      
      boothStats[boothId].total_surveys++;
      
      questionsList.forEach(q => {
        const questionData = survey.sur_data.find(item => item.question === q.question);
        if (questionData && questionData.answer) {
          if (!boothStats[boothId].questions[q.question]) {
            boothStats[boothId].questions[q.question] = {
              question: q.question,
              responses: 0,
              answers: {}
            };
          }
          
          const answer = questionData.answer.trim();
          boothStats[boothId].questions[q.question].responses++;
          boothStats[boothId].questions[q.question].answers[answer] = 
            (boothStats[boothId].questions[q.question].answers[answer] || 0) + 1;
        }
      });
    });

    return Object.values(boothStats).map(booth => ({
      ...booth,
      total_questions: Object.keys(booth.questions).length
    })).sort((a, b) => b.total_surveys - a.total_surveys);
  };

  const getQuestionResponseDistribution = (questionData) => {
    if (!questionData) return [];
    
    return Object.entries(questionData.answers).map(([answer, count]) => ({
      answer: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
      fullAnswer: answer,
      count: count,
      percentage: ((count / questionData.responses) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  const getTopAnswer = (questionData) => {
    if (!questionData || Object.keys(questionData.answers).length === 0) return null;
    
    const sorted = Object.entries(questionData.answers).sort((a, b) => b[1] - a[1]);
    return {
      answer: sorted[0][0],
      count: sorted[0][1],
      percentage: ((sorted[0][1] / questionData.responses) * 100).toFixed(1)
    };
  };

  const calculateOverallStats = () => {
    if (!boothData.length) return null;
    
    const totalBooths = boothData.length;
    const totalSurveys = boothData.reduce((sum, booth) => sum + booth.total_surveys, 0);
    const totalQuestions = questions.length;
    const avgSurveysPerBooth = (totalSurveys / totalBooths).toFixed(1);
    
    return {
      totalBooths,
      totalSurveys,
      totalQuestions,
      avgSurveysPerBooth
    };
  };

  const toggleQuestion = (questionText) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionText]: !prev[questionText]
    }));
  };

  const filteredBooths = boothData.filter(booth =>
    booth.booth_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="font-semibold text-gray-900 text-xs mb-1">{data.fullAnswer || data.booth_name}</p>
          <p className="text-gray-700 text-xs">Count: {data.count || data.total_surveys}</p>
          {data.percentage && <p className="text-gray-700 text-xs">Percentage: {data.percentage}%</p>}
        </div>
      );
    }
    return null;
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading booth-wise data...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto ">
        {/* Header */}
        <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm p-3">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Booth-Wise Survey Report
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">Comprehensive analysis of all questions across polling booths</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-blue-700 uppercase">Total Booths</h3>
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooths}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-green-700 uppercase">Total Surveys</h3>
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-purple-700 uppercase">Questions</h3>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-medium text-orange-700 uppercase">Avg per Booth</h3>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSurveysPerBooth}</p>
            </div>
          </div>
        )}

        {/* Pagination Controls and Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search booth by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
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

        {/* Booth Comparison Chart */}
        {boothData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Survey Distribution Across Booths
              </h3>
            </div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredBooths} margin={{ bottom: 80 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="booth_name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    style={{ fontSize: '10px', fill: '#4b5563' }}
                  />
                  <YAxis style={{ fontSize: '10px', fill: '#4b5563' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar 
                    dataKey="total_surveys" 
                    fill="url(#barGradient)" 
                    radius={[4, 4, 0, 0]} 
                    name="Total Surveys"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Booth Cards Grid */}
        {filteredBooths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
            {filteredBooths.map((booth, index) => {
              const cardColors = [
                { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
                { bg: 'from-green-50 to-green-100', border: 'border-green-200', icon: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700' },
                { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700' },
                { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700' },
              ];
              const color = cardColors[index % cardColors.length];
              
              return (
                <div
                  key={booth.booth_id}
                  className={`bg-white border ${color.border} rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                  onClick={() => setSelectedBooth(booth)}
                >
                  <div className={`bg-gradient-to-r ${color.bg} border-b ${color.border} p-2.5`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2" title={booth.booth_name}>
                        {booth.booth_name}
                      </h3>
                      <MapPin className={`w-4 h-4 ${color.icon} flex-shrink-0`} />
                    </div>
                  <b>

                  
                    {booth.zc_name && (
                      <p className="text-gray-600 text-sm font-medium mt-0.5">ZC: {booth.zc_name}</p>
                    )}
                    </b>
                  </div>
                  
                  <div className="p-2.5">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Surveys</p>
                        <p className="text-lg font-bold text-blue-700">{booth.total_surveys}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Questions</p>
                        <p className="text-lg font-bold text-green-700">{booth.total_questions}</p>
                      </div>
                    </div>
                    
                    <button 
                      className={`w-full px-3 py-1.5 ${color.btn} text-white rounded text-xs font-medium transition-colors`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {boothData.length === 0 && !loading && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm">No booth data available.</p>
          </div>
        )}
      </div>

      {/* Booth Detail Modal */}
      {selectedBooth && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3"
          onClick={() => setSelectedBooth(null)}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-700 p-3 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedBooth.booth_name}</h2>
                <div className="flex items-center gap-2 text-white text-xs mt-0.5">
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                    ID: {selectedBooth.booth_id}
                  </span>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                    Surveys: {selectedBooth.total_surveys}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-3">
              {/* Questions List */}
              <div className="space-y-2">
                {questions.map((q, qIndex) => {
                  const questionData = selectedBooth.questions[q.question];
                  const topAnswer = getTopAnswer(questionData);
                  const isExpanded = expandedQuestions[q.question];
                  
                  if (!questionData) return null;
                  
                  return (
                    <div key={qIndex} className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div 
                        className="p-2.5 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => toggleQuestion(q.question)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{q.question}</h3>
                            {topAnswer && (
                              <div className="flex items-center flex-wrap gap-2 text-xs">
                                <span className="text-gray-600">Top Response:</span>
                                <span className="font-medium text-gray-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {topAnswer.answer.substring(0, 50)}{topAnswer.answer.length > 50 ? '...' : ''}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium">
                                  {topAnswer.count} ({topAnswer.percentage}%)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {/* Distribution Chart */}
                            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                              <h4 className="text-xs font-semibold text-blue-900 mb-2 uppercase flex items-center gap-1">
                                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                                Distribution
                              </h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                  <Pie
                                    data={getQuestionResponseDistribution(questionData)}
                                    dataKey="count"
                                    nameKey="answer"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label={({ percentage }) => `${percentage}%`}
                                    labelLine={false}
                                  >
                                    {getQuestionResponseDistribution(questionData).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Response Table */}
                            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                              <h4 className="text-xs font-semibold text-green-900 mb-2 uppercase flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-green-600" />
                                Response Details
                              </h4>
                              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                {getQuestionResponseDistribution(questionData).map((item, index) => (
                                  <div key={index} className="bg-gray-50 rounded p-2 border border-gray-200 hover:border-gray-300 transition-colors">
                                    <div className="flex items-start justify-between mb-1.5">
                                      <p className="text-xs font-medium text-gray-900 flex-1 pr-2" title={item.fullAnswer}>
                                        {item.fullAnswer}
                                      </p>
                                      <span 
                                        className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-white"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      >
                                        {item.count}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
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
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boothwise;