
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, TrendingUp, Mail, FileText, Database, ArrowUpRight, Calendar, Target, Phone, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format, subDays, startOfDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface AnalyticsDashboardProps {
  leads: Lead[];
  templates: EmailTemplate[];
  categories: Category[];
  importBatches: ImportBatch[];
  onNavigateToLeads: (filter?: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  leads,
  templates,
  categories,
  importBatches,
  onNavigateToLeads
}) => {
  // Enhanced metrics calculation
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    const unqualifiedLeads = leads.filter(lead => lead.status === 'Unqualified').length;
    const interestedLeads = leads.filter(lead => lead.status === 'Interested').length;
    const notInterestedLeads = leads.filter(lead => lead.status === 'Not Interested').length;
    
    const totalEmailsSent = leads.reduce((sum, lead) => sum + lead.emailsSent, 0);
    const leadsWithPhone = leads.filter(lead => lead.phone && lead.phone.trim() !== '').length;
    const leadsWithEmail = leads.filter(lead => lead.email && lead.email.trim() !== '').length;
    
    // Calculate rates
    const conversionRate = totalLeads > 0 ? qualifiedLeads / totalLeads * 100 : 0;
    const contactRate = totalLeads > 0 ? contactedLeads / totalLeads * 100 : 0;
    const responseRate = contactedLeads > 0 ? (qualifiedLeads + interestedLeads) / contactedLeads * 100 : 0;
    const dataCompleteness = totalLeads > 0 ? leadsWithPhone / totalLeads * 100 : 0;

    // This week's new leads
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const thisWeekLeads = leads.filter(lead => 
      isWithinInterval(lead.createdAt, { start: thisWeekStart, end: thisWeekEnd })
    ).length;

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      unqualifiedLeads,
      interestedLeads,
      notInterestedLeads,
      totalEmailsSent,
      leadsWithPhone,
      leadsWithEmail,
      conversionRate,
      contactRate,
      responseRate,
      dataCompleteness,
      thisWeekLeads,
      totalTemplates: templates.length,
      totalCategories: categories.length,
      totalImportBatches: importBatches.length
    };
  }, [leads, templates, categories, importBatches]);

  // Enhanced status distribution with better categorization
  const statusData = useMemo(() => {
    const statusGroups = {
      'New': leads.filter(l => l.status === 'New').length,
      'In Progress': leads.filter(l => ['Contacted', 'Opened', 'Clicked'].includes(l.status)).length,
      'Positive': leads.filter(l => ['Qualified', 'Interested', 'Replied'].includes(l.status)).length,
      'Negative': leads.filter(l => ['Unqualified', 'Not Interested', 'Unresponsive'].includes(l.status)).length,
      'Follow Up': leads.filter(l => ['Call Back', 'Send Email'].includes(l.status)).length
    };

    return Object.entries(statusGroups)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
        percentage: (count / leads.length * 100).toFixed(1)
      }));
  }, [leads]);

  // Weekly performance data
  const weeklyData = useMemo(() => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const weekLeads = leads.filter(lead => 
        isWithinInterval(lead.createdAt, { start: weekStart, end: weekEnd })
      );
      
      return {
        week: format(weekStart, 'MMM dd'),
        newLeads: weekLeads.length,
        contacted: weekLeads.filter(l => l.status === 'Contacted').length,
        qualified: weekLeads.filter(l => l.status === 'Qualified').length
      };
    }).reverse();
    
    return last4Weeks;
  }, [leads]);

  // Top performing categories
  const categoryPerformance = useMemo(() => {
    return categories.slice(0, 5).map(category => {
      const categoryLeads = leads.filter(l => l.categoryId === category.id);
      const qualifiedInCategory = categoryLeads.filter(l => l.status === 'Qualified').length;
      
      return {
        name: category.name.length > 15 ? `${category.name.substring(0, 15)}...` : category.name,
        total: categoryLeads.length,
        qualified: qualifiedInCategory,
        rate: categoryLeads.length > 0 ? (qualifiedInCategory / categoryLeads.length * 100).toFixed(1) : '0'
      };
    }).filter(cat => cat.total > 0);
  }, [categories, leads]);

  return (
    <div className="space-y-6 px-4 py-4 lg:px-6 lg:py-6">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Track your lead generation performance and insights</p>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-foreground">{metrics.totalLeads}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{metrics.thisWeekLeads} this week
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-foreground">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.qualifiedLeads} qualified leads
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-foreground">{metrics.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              From contacted leads
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-foreground">{metrics.dataCompleteness.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.leadsWithPhone} have phone numbers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <Card className="apple-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToLeads({ status: 'New' })}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{metrics.newLeads}</div>
            <p className="text-xs text-muted-foreground">New Leads</p>
          </CardContent>
        </Card>

        <Card className="apple-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToLeads({ status: 'Contacted' })}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{metrics.contactedLeads}</div>
            <p className="text-xs text-muted-foreground">Contacted</p>
          </CardContent>
        </Card>

        <Card className="apple-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToLeads({ status: 'Qualified' })}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{metrics.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>

        <Card className="apple-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToLeads({ status: 'Interested' })}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{metrics.interestedLeads}</div>
            <p className="text-xs text-muted-foreground">Interested</p>
          </CardContent>
        </Card>

        <Card className="apple-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigateToLeads({ status: 'Not Interested' })}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{metrics.notInterestedLeads}</div>
            <p className="text-xs text-muted-foreground">Not Interested</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Status Distribution</CardTitle>
            <CardDescription>Current breakdown of all lead statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Performance</CardTitle>
            <CardDescription>Lead generation and conversion over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="newLeads" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="New Leads" />
                  <Area type="monotone" dataKey="contacted" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Contacted" />
                  <Area type="monotone" dataKey="qualified" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Qualified" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        {categoryPerformance.length > 0 && (
          <Card className="apple-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
              <CardDescription>Qualification rates by lead category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'total' ? 'Total Leads' : 'Qualified Leads']} />
                    <Bar dataKey="total" fill="#E5E7EB" name="Total Leads" />
                    <Bar dataKey="qualified" fill="#10B981" name="Qualified Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => onNavigateToLeads({ status: 'New' })}
              >
                <Users className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Review New Leads</div>
                  <div className="text-xs text-muted-foreground">{metrics.newLeads} waiting</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => onNavigateToLeads({ status: 'Contacted' })}
              >
                <Mail className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Follow Up</div>
                  <div className="text-xs text-muted-foreground">{metrics.contactedLeads} contacted</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => onNavigateToLeads({ status: 'Interested' })}
              >
                <TrendingUp className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Hot Prospects</div>
                  <div className="text-xs text-muted-foreground">{metrics.interestedLeads} interested</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => onNavigateToLeads()}
              >
                <Database className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View All Leads</div>
                  <div className="text-xs text-muted-foreground">{metrics.totalLeads} total</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Overview</CardTitle>
          <CardDescription>Current system status and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-lg">{metrics.totalTemplates}</div>
              <div className="text-sm text-muted-foreground">Email Templates</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Database className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-lg">{metrics.totalImportBatches}</div>
              <div className="text-sm text-muted-foreground">Import Batches</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-lg">{metrics.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Mail className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold text-lg">{metrics.totalEmailsSent}</div>
              <div className="text-sm text-muted-foreground">Emails Sent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
