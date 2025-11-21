import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MapPin, TrendingUp, Users, BarChart3, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
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

  const COLORS = [
    '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', 
    '#bfdbfe', '#1e3a8a', '#1d4ed8', '#0ea5e9', '#0284c7'
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
        
        // Aggregate data for all questions
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
      
      // Process each question
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-xl rounded-lg border-2 border-blue-500">
          <p className="font-semibold text-gray-900 mb-2">{data.fullAnswer || data.booth_name}</p>
          <p className="text-blue-600 font-medium">Count: {data.count || data.total_surveys}</p>
          {data.percentage && <p className="text-blue-500 font-medium">Percentage: {data.percentage}%</p>}
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading booth-wise data...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto ">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-md md:text-lg font-bold text-gray-900 mb-2">Booth-Wise Survey Report</h1>
          <p className="text-gray-600">Comprehensive analysis of all questions across polling booths</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="bg-white border-l-4 border-blue-600 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Total Booths</h3>
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalBooths}</p>
            </div>
            
            <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Total Surveys</h3>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalSurveys}</p>
            </div>
            
            <div className="bg-white border-l-4 border-blue-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Questions</h3>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
            
            <div className="bg-white border-l-4 border-blue-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Avg per Booth</h3>
                <TrendingUp className="w-8 h-8 text-blue-700" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.avgSurveysPerBooth}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {boothData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search booth by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Booth Comparison Chart */}
        {boothData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
            <div className="bg-blue-600 p-4">
              <h3 className="text-lg font-semibold text-white">Survey Distribution Across Booths</h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredBooths} margin={{ bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="booth_name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total_surveys" fill="#2563eb" radius={[8, 8, 0, 0]} name="Total Surveys" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Booth Cards Grid */}
        {filteredBooths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredBooths.map((booth) => (
              <div
                key={booth.booth_id}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedBooth(booth)}
              >
                <div className="bg-blue-600 p-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white truncate flex-1" title={booth.booth_name}>
                      {booth.booth_name}
                    </h3>
                    <MapPin className="w-5 h-5 text-white ml-2" />
                  </div>
                  <p className="text-blue-100 text-sm mt-1">Booth ID: {booth.booth_id}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Surveys</p>
                      <p className="text-2xl font-bold text-gray-900">{booth.total_surveys}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Questions</p>
                      <p className="text-2xl font-bold text-gray-900">{booth.total_questions}</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    View Detailed Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {boothData.length === 0 && !loading && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-8 text-center shadow-md">
            <p className="text-blue-900 font-semibold text-lg">No booth data available.</p>
          </div>
        )}
      </div>

      {/* Booth Detail Modal */}
      {selectedBooth && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooth(null)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-blue-600 p-6 flex items-center justify-between z-10 shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedBooth.booth_name}</h2>
                <p className="text-blue-100 mt-1">Booth ID: {selectedBooth.booth_id} | Total Surveys: {selectedBooth.total_surveys}</p>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, qIndex) => {
                  const questionData = selectedBooth.questions[q.question];
                  const topAnswer = getTopAnswer(questionData);
                  const isExpanded = expandedQuestions[q.question];
                  
                  if (!questionData) return null;
                  
                  return (
                    <div key={qIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div 
                        className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
                        onClick={() => toggleQuestion(q.question)}
                      >
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">{q.question}</h3>
                          {topAnswer && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">Top Response:</span>
                              <span className="font-medium text-blue-600">{topAnswer.answer.substring(0, 50)}{topAnswer.answer.length > 50 ? '...' : ''}</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                {topAnswer.count} ({topAnswer.percentage}%)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Distribution Chart */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Distribution</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={getQuestionResponseDistribution(questionData)}
                                    dataKey="count"
                                    nameKey="answer"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ percentage }) => `${percentage}%`}
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
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Responses</h4>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {getQuestionResponseDistribution(questionData).map((item, index) => (
                                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <p className="text-sm font-medium text-gray-900 flex-1" title={item.fullAnswer}>
                                        {item.fullAnswer}
                                      </p>
                                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        {item.count}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="h-2 rounded-full transition-all duration-500"
                                          style={{ 
                                            width: `${item.percentage}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-bold text-gray-700 w-12">{item.percentage}%</span>
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