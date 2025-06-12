
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  FileText, 
  Database,
  ArrowUpRight,
  Calendar,
  Target
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import type { Lead, EmailTemplate } from '@/types/lead';
import type { Category, ImportBatch } from '@/types/category';

interface AnalyticsDashboardProps {
  leads: Lead[];
  templates: EmailTemplate[];
  categories: Category[];
  importBatches: ImportBatch[];
  onNavigateToLeads: (filter?: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  leads,
  templates,
  categories,
  importBatches,
  onNavigateToLeads
}) => {
  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    const totalEmailsSent = leads.reduce((sum, lead) => sum + lead.emailsSent, 0);
    
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;
    
    return {
      totalLeads,
      contactedLeads,
      qualifiedLeads,
      totalEmailsSent,
      conversionRate,
      contactRate,
      totalTemplates: templates.length,
      totalCategories: categories.length,
      totalImportBatches: importBatches.length
    };
  }, [leads, templates, categories, importBatches]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / leads.length) * 100).toFixed(1)
    }));
  }, [leads]);

  // Recent activity data (last 7 days)
  const recentActivityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      const dayLeads = leads.filter(lead => 
        startOfDay(lead.createdAt).getTime() === date.getTime()
      ).length;
      
      return {
        date: format(date, 'MMM dd'),
        leads: dayLeads
      };
    }).reverse();

    return last7Days;
  }, [leads]);

  // Import batch performance
  const importPerformance = useMemo(() => {
    return importBatches.slice(0, 5).map(batch => ({
      name: batch.name.length > 15 ? `${batch.name.substring(0, 15)}...` : batch.name,
      success: batch.successfulImports,
      failed: batch.failedImports,
      total: batch.totalLeads,
      successRate: batch.totalLeads > 0 ? (batch.successfulImports / batch.totalLeads) * 100 : 0
    }));
  }, [importBatches]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
              onClick={() => onNavigateToLeads()}
            >
              View all leads <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.qualifiedLeads} qualified leads
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmailsSent}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.contactRate.toFixed(1)}% contact rate
            </p>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Import Batches</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalImportBatches}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
              onClick={() => {/* Navigate to import tab */}}
            >
              View imports <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg">Lead Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all leads</CardDescription>
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

        {/* Recent Lead Activity */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Lead Activity</CardTitle>
            <CardDescription>New leads over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Performance */}
      {importPerformance.length > 0 && (
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg">Import Performance</CardTitle>
            <CardDescription>Success rates for recent import batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" stackId="a" fill="#10B981" name="Successful" />
                  <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigateToLeads({ status: 'New' })}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">View New Leads</span>
              <Badge variant="secondary">{leads.filter(l => l.status === 'New').length}</Badge>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigateToLeads({ status: 'Contacted' })}
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm">Contacted Leads</span>
              <Badge variant="secondary">{leads.filter(l => l.status === 'Contacted').length}</Badge>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigateToLeads({ status: 'Qualified' })}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Qualified Leads</span>
              <Badge variant="secondary">{leads.filter(l => l.status === 'Qualified').length}</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
