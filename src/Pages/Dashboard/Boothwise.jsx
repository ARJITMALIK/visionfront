import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

  // Enhanced color palette with vibrant colors
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

  const CHART_GRADIENT_COLORS = [
    { start: '#8b5cf6', end: '#ec4899' }, // Purple to Pink
    { start: '#3b82f6', end: '#06b6d4' }, // Blue to Cyan
    { start: '#f59e0b', end: '#ef4444' }, // Amber to Red
    { start: '#10b981', end: '#84cc16' }, // Emerald to Lime
  ];

const limitOptions = [100, 200, 500, 1000, 2000];
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
          <p className="font-semibold text-white mb-2">{data.fullAnswer || data.booth_name}</p>
          <p className="text-purple-300 font-medium">Count: {data.count || data.total_surveys}</p>
          {data.percentage && <p className="text-purple-200 font-medium">Percentage: {data.percentage}%</p>}
        </div>
      );
    }
    return null;
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-purple-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-800 font-semibold text-lg">Loading booth-wise data...</p>
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
    <div className="min-h-screen">
      <div className="w-full mx-auto">
        {/* Enhanced Header with Gradient */}
        <div className="mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl shadow-xl p-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Booth-Wise Survey Report
          </h1>
          <p className="text-purple-100 text-lg">Comprehensive analysis of all questions across polling booths</p>
        </div>

        {/* Enhanced Statistics Cards with Gradients */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase text-purple-100 tracking-wide">Total Booths</h3>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-black text-white">{stats.totalBooths}</p>
                <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase text-pink-100 tracking-wide">Total Surveys</h3>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-black text-white">{stats.totalSurveys}</p>
                <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase text-blue-100 tracking-wide">Questions</h3>
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-black text-white">{stats.totalQuestions}</p>
                <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase text-emerald-100 tracking-wide">Avg per Booth</h3>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-black text-white">{stats.avgSurveysPerBooth}</p>
                <div className="mt-2 h-1 bg-white opacity-30 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls and Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-4 mb-6 hover:shadow-xl transition-shadow">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search booth by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-4 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-gray-900 font-medium text-lg transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-purple-100">
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

        {/* Enhanced Booth Comparison Chart */}
        {boothData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Survey Distribution Across Booths
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={filteredBooths} margin={{ bottom: 120 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" strokeWidth={2} />
                  <XAxis 
                    dataKey="booth_name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120} 
                    style={{ fontSize: '12px', fontWeight: '600', fill: '#6b21a8' }}
                  />
                  <YAxis style={{ fontSize: '12px', fontWeight: '600', fill: '#6b21a8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: '600' }} />
                  <Bar 
                    dataKey="total_surveys" 
                    fill="url(#colorGradient)" 
                    radius={[12, 12, 0, 0]} 
                    name="Total Surveys"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Enhanced Booth Cards Grid */}
        {filteredBooths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredBooths.map((booth, index) => {
              const gradientIndex = index % CHART_GRADIENT_COLORS.length;
              const gradient = CHART_GRADIENT_COLORS[gradientIndex];
              
              return (
                <div
                  key={booth.booth_id}
                  className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden"
                  onClick={() => setSelectedBooth(booth)}
                >
                  <div 
                    className="p-6 rounded-t-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white truncate flex-1 pr-2" title={booth.booth_name}>
                        {booth.booth_name}
                      </h3>
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-white text-opacity-90 text-sm mt-2 font-medium">Booth ID: {booth.booth_id}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <p className="text-xs text-purple-700 uppercase tracking-wide mb-2 font-bold">Total Surveys</p>
                        <p className="text-3xl font-black text-purple-900">{booth.total_surveys}</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                        <p className="text-xs text-pink-700 uppercase tracking-wide mb-2 font-bold">Questions</p>
                        <p className="text-3xl font-black text-pink-900">{booth.total_questions}</p>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      View Detailed Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {boothData.length === 0 && !loading && (
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-12 text-center shadow-xl">
            <div className="bg-white bg-opacity-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-purple-900 font-bold text-xl">No booth data available.</p>
          </div>
        )}
      </div>

      {/* Enhanced Booth Detail Modal */}
      {selectedBooth && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-blue-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooth(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-auto shadow-2xl border-4 border-purple-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 flex items-center justify-between z-10 shadow-lg rounded-t-3xl">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">{selectedBooth.booth_name}</h2>
                <div className="flex items-center gap-4 text-white text-opacity-90">
                  <span className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-bold">
                    Booth ID: {selectedBooth.booth_id}
                  </span>
                  <span className="bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-bold">
                    Total Surveys: {selectedBooth.total_surveys}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50">
              {/* Questions List */}
              <div className="space-y-5">
                {questions.map((q, qIndex) => {
                  const questionData = selectedBooth.questions[q.question];
                  const topAnswer = getTopAnswer(questionData);
                  const isExpanded = expandedQuestions[q.question];
                  
                  if (!questionData) return null;
                  
                  const questionGradient = CHART_GRADIENT_COLORS[qIndex % CHART_GRADIENT_COLORS.length];
                  
                  return (
                    <div key={qIndex} className="bg-white border-2 border-purple-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                      <div 
                        className="p-5 cursor-pointer hover:opacity-90 transition-all relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${questionGradient.start}15 0%, ${questionGradient.end}15 100%)`
                        }}
                        onClick={() => toggleQuestion(q.question)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{q.question}</h3>
                            {topAnswer && (
                              <div className="flex items-center flex-wrap gap-3 text-sm">
                                <span className="text-gray-600 font-semibold">Top Response:</span>
                                <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-lg">
                                  {topAnswer.answer.substring(0, 50)}{topAnswer.answer.length > 50 ? '...' : ''}
                                </span>
                                <span 
                                  className="inline-flex items-center px-4 py-1 rounded-full text-sm font-black text-white shadow-md"
                                  style={{
                                    background: `linear-gradient(135deg, ${questionGradient.start} 0%, ${questionGradient.end} 100%)`
                                  }}
                                >
                                  {topAnswer.count} ({topAnswer.percentage}%)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <div 
                              className="p-2 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${questionGradient.start} 0%, ${questionGradient.end} 100%)`
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-6 h-6 text-white" />
                              ) : (
                                <ChevronDown className="w-6 h-6 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-6 border-t-2 border-purple-100 bg-white">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Distribution Chart */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                              <h4 className="text-sm font-black text-purple-900 mb-5 uppercase tracking-wide flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Distribution Chart
                              </h4>
                              <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                  <Pie
                                    data={getQuestionResponseDistribution(questionData)}
                                    dataKey="count"
                                    nameKey="answer"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
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
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                              <h4 className="text-sm font-black text-blue-900 mb-5 uppercase tracking-wide flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Response Details
                              </h4>
                              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                {getQuestionResponseDistribution(questionData).map((item, index) => (
                                  <div key={index} className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100 hover:border-purple-300 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                      <p className="text-sm font-bold text-gray-900 flex-1 pr-2" title={item.fullAnswer}>
                                        {item.fullAnswer}
                                      </p>
                                      <span 
                                        className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-black text-white shadow-md"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      >
                                        {item.count}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                          className="h-3 rounded-full transition-all duration-700 shadow-md"
                                          style={{ 
                                            width: `${item.percentage}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-black text-gray-800 w-14 text-right">{item.percentage}%</span>
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