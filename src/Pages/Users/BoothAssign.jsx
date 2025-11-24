import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, User, MapPin, Check, X, Loader2, Users, Building2, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VisionBase } from '@/utils/axiosInstance';
import { toast, Toaster } from 'sonner';

const BoothAssign = () => {
  const [users, setUsers] = useState([]);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooths, setSelectedBooths] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [boothSearch, setBoothSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('assign'); // 'assign' or 'view'
  const [assignedBooths, setAssignedBooths] = useState([]);
  const [unassigningId, setUnassigningId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, boothsRes] = await Promise.all([
        VisionBase.get('/users'),
        VisionBase.get('/zones', { params: { assigned: false } })
      ]);

      // Filter only ZC users (role: 2)
      const zcUsers = usersRes.data?.data?.rows?.filter(u => u.role === 2) || [];
      setUsers(zcUsers);
      setBooths(boothsRes.data?.data?.rows || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const search = userSearch.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.mobile.includes(search) ||
      u.user_id.toString().includes(search)
    );
  }, [users, userSearch]);

  const filteredBooths = useMemo(() => {
    if (!boothSearch) return viewMode === 'view' ? assignedBooths : booths;
    const search = boothSearch.toLowerCase();
    const boothList = viewMode === 'view' ? assignedBooths : booths;
    return boothList.filter(b => {
      if (viewMode === 'view') {
        return b.zone_name?.toLowerCase().includes(search) ||
               b.booth_id?.toString().includes(search) ||
               b.assignment_id?.toString().includes(search);
      } else {
        return b.zone_name?.toLowerCase().includes(search) ||
               b.zone_id?.toString().includes(search) ||
               b.vidhan_name?.toLowerCase().includes(search) ||
               b.lok_name?.toLowerCase().includes(search);
      }
    });
  }, [booths, assignedBooths, boothSearch, viewMode]);

  const handleAssignBooths = (user) => {
    setSelectedUser(user);
    setViewMode('assign');
    setSelectedBooths([]);
    setBoothSearch('');
  };

  const handleSelectAll = (checked) => {
    setSelectedBooths(checked ? filteredBooths.map(b => b.zone_id) : []);
  };

  const handleToggleBooth = (zoneId) => {
    setSelectedBooths(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const fetchAssignedBooths = async (userId) => {
    setLoading(true);
    try {
      const response = await VisionBase.get('/zone/assignments', {
        params: { zc_id: userId }
      });
      setAssignedBooths(response.data.data.rows || []);
    } catch (err) {
      console.error('Failed to fetch assigned booths:', err);
      toast.error('Failed to fetch assigned booths. Please try again.');
      setAssignedBooths([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssignedBooths = (user) => {
    setSelectedUser(user);
    setViewMode('view');
    setBoothSearch('');
    fetchAssignedBooths(user.user_id);
  };

  const handleSubmitAssignment = async () => {
    if (selectedBooths.length === 0) {
      toast.error('Please select at least one booth');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignmentPayload = selectedBooths.map(boothId => ({
        booth_id: boothId,
        zc_id: selectedUser.user_id
      }));

      await VisionBase.post('/zone/assignments', {
        assignments: assignmentPayload
      });
      
      toast.success(`Successfully assigned ${selectedBooths.length} booth(s) to ${selectedUser.name}`);
      setSelectedUser(null);
      setSelectedBooths([]);
      setBoothSearch('');
      setViewMode('assign');
      fetchData(); // Refresh the unassigned booths list
    } catch (err) {
      console.error('Assignment failed:', err);
      toast.error(err.response?.data?.message || 'Failed to assign booths. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignBooth = async (assignmentId, zoneName) => {
    if (!confirm(`Are you sure you want to unassign "${zoneName}"?`)) {
      return;
    }

    setUnassigningId(assignmentId);
    try {
      await VisionBase.delete(`/zone/assignment/${assignmentId}`);
      
      toast.success('Booth unassigned successfully');
      // Refresh the assigned booths list
      fetchAssignedBooths(selectedUser.user_id);
      // Also refresh the main data to update unassigned booths count
      fetchData();
    } catch (err) {
      console.error('Unassign failed:', err);
      toast.error(err.response?.data?.message || 'Failed to unassign booth. Please try again.');
    } finally {
      setUnassigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Booth Assignment/View Screen
  if (selectedUser) {
    const isViewMode = viewMode === 'view';
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Toaster richColors position="top-right" />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedUser(null);
                setViewMode('assign');
                setBoothSearch('');
                setAssignedBooths([]);
              }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.profile} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                      <p className="text-sm text-gray-600">
                        ID: {selectedUser.user_id} | Mobile: {selectedUser.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={isViewMode ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                      {isViewMode ? 'Viewing Assigned' : 'Assigning Booths'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">Zone Coordinator</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={isViewMode ? "Search by assignment ID, booth ID, or zone name..." : "Search booths by ID, name, vidhan sabha, or loksabha..."}
                    value={boothSearch}
                    onChange={(e) => setBoothSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {!isViewMode && (
                  <Badge variant="outline" className="px-3 py-2">
                    {selectedBooths.length} Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booths Table */}
          <Card>
            <CardHeader className="border-b p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {isViewMode ? 'Assigned Booths' : 'Assign Booths'} ({filteredBooths.length} {isViewMode ? 'assigned' : 'available'})
                </CardTitle>
                {!isViewMode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(selectedBooths.length !== filteredBooths.length)}
                    >
                      {selectedBooths.length === filteredBooths.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitAssignment}
                      disabled={isSubmitting || selectedBooths.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Assign Selected
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-xs text-gray-600 border-b">
                      {!isViewMode && (
                        <th className="p-3 w-12">
                          <Checkbox 
                            checked={filteredBooths.length > 0 && selectedBooths.length === filteredBooths.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                      )}
                      {isViewMode && <th className="p-3">Assignment ID</th>}
                      <th className="p-3">{isViewMode ? 'Booth ID' : 'Zone ID'}</th>
                      <th className="p-3">Booth Name</th>
                      {!isViewMode && (
                        <>
                          <th className="p-3">Vidhan Sabha</th>
                          <th className="p-3">Loksabha</th>
                          <th className="p-3">State</th>
                          <th className="p-3 text-center">Progress</th>
                        </>
                      )}
                      {isViewMode && <th className="p-3 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooths.length === 0 ? (
                      <tr>
                        <td colSpan={isViewMode ? "4" : "7"} className="text-center py-8 text-gray-500">
                          {isViewMode ? 'No assigned booths found' : 'No unassigned booths available'}
                        </td>
                      </tr>
                    ) : isViewMode ? (
                      // View Mode - Assigned Booths
                      filteredBooths.map(assignment => (
                        <tr 
                          key={assignment.assignment_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium text-sm">{assignment.assignment_id}</td>
                          <td className="p-3 font-medium text-sm">{assignment.booth_id}</td>
                          <td className="p-3 text-sm">{assignment.zone_name}</td>
                          <td className="p-3 text-center">
                            <Button
                              onClick={() => handleUnassignBooth(assignment.assignment_id, assignment.zone_name)}
                              disabled={unassigningId === assignment.assignment_id}
                              variant="destructive"
                              size="sm"
                            >
                              {unassigningId === assignment.assignment_id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Unassigning...
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Unassign
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Assign Mode - Unassigned Booths
                      filteredBooths.map(booth => {
                        const progress = booth.survey_limit > 0 
                          ? ((parseInt(booth.surveyfilled) || 0) / booth.survey_limit * 100).toFixed(0)
                          : 0;
                        
                        return (
                          <tr 
                            key={booth.zone_id}
                            className="border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleToggleBooth(booth.zone_id)}
                          >
                            <td className="p-3">
                              <Checkbox 
                                checked={selectedBooths.includes(booth.zone_id)}
                                onCheckedChange={() => handleToggleBooth(booth.zone_id)}
                              />
                            </td>
                            <td className="p-3 font-medium text-sm">{booth.zone_id}</td>
                            <td className="p-3 text-sm">{booth.zone_name}</td>
                            <td className="p-3 text-sm text-gray-600">{booth.vidhan_name}</td>
                            <td className="p-3 text-sm text-gray-600">{booth.lok_name}</td>
                            <td className="p-3 text-sm text-gray-600">{booth.state}</td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-600">
                                  {booth.surveyfilled}/{booth.survey_limit}
                                </span>
                                <Badge 
                                  variant="secondary"
                                  className={`text-xs ${
                                    progress >= 100 ? 'bg-green-100 text-green-700' :
                                    progress >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {progress}%
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Users List View
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Booth Assignment Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Assign booths to Zone Coordinators</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                <p className="text-xs text-gray-600">Zone Coordinators</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{booths.length}</p>
                <p className="text-xs text-gray-600">Unassigned Booths</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {users.reduce((sum, u) => sum + (u.survey_count || 0), 0)}
                </p>
                <p className="text-xs text-gray-600">Total Surveys</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, mobile, or user ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader className="border-b p-4">
            <CardTitle className="text-base font-semibold">
              Zone Coordinators ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No Zone Coordinators found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div 
                    key={user.user_id}
                    className="p-4 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profile} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{user.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span>ID: {user.user_id}</span>
                          <span>•</span>
                          <span>📱 {user.mobile}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {user.survey_count || 0} surveys
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={user.status ? "default" : "secondary"}
                        className={user.status ? "bg-green-100 text-green-700" : ""}
                      >
                        {user.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleViewAssignedBooths(user)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Assigned
                      </Button>
                      <Button
                        onClick={() => handleAssignBooths(user)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Assign Booths
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BoothAssign;