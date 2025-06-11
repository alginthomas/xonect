
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Linkedin, 
  Globe, 
  Calendar, 
  Briefcase, 
  Users, 
  TrendingUp,
  Target,
  Clock,
  Tag,
  ExternalLink,
  Twitter,
  Facebook,
  MessageSquare
} from 'lucide-react';
import type { Lead } from '@/types/lead';
import type { Category } from '@/types/category';

interface LeadDetailSheetProps {
  lead: Lead | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailSheet: React.FC<LeadDetailSheetProps> = ({
  lead,
  categories,
  isOpen,
  onClose
}) => {
  if (!lead) return null;

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Opened': 'bg-green-100 text-green-800',
      'Clicked': 'bg-purple-100 text-purple-800',
      'Replied': 'bg-emerald-100 text-emerald-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Unqualified': 'bg-red-100 text-red-800',
      'Call Back': 'bg-orange-100 text-orange-800',
      'Unresponsive': 'bg-gray-100 text-gray-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'Interested': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeniorityColor = (seniority: Lead['seniority']) => {
    const colors = {
      'C-level': 'bg-red-100 text-red-800',
      'Executive': 'bg-orange-100 text-orange-800',
      'Senior': 'bg-purple-100 text-purple-800',
      'Mid-level': 'bg-blue-100 text-blue-800',
      'Junior': 'bg-gray-100 text-gray-800',
    };
    return colors[seniority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return { name: 'Uncategorized', color: '#6B7280' };
    const category = categories.find(cat => cat.id === categoryId);
    return {
      name: category?.name || 'Unknown Category',
      color: category?.color || '#6B7280'
    };
  };

  const categoryInfo = getCategoryInfo(lead.categoryId);

  // Generate purchase likelihood based on lead data
  const getPurchaseLikelihood = () => {
    let score = 0;
    
    if (lead.seniority === 'C-level') score += 40;
    else if (lead.seniority === 'Executive') score += 30;
    else if (lead.seniority === 'Senior') score += 20;
    else if (lead.seniority === 'Mid-level') score += 10;
    
    if (lead.companySize === 'Enterprise (1000+)') score += 30;
    else if (lead.companySize === 'Large (201-1000)') score += 20;
    else if (lead.companySize === 'Medium (51-200)') score += 15;
    else score += 10;
    
    if (lead.status === 'Replied') score += 20;
    else if (lead.status === 'Clicked') score += 15;
    else if (lead.status === 'Opened') score += 10;
    else if (lead.status === 'Contacted') score += 5;
    
    score += Math.floor(lead.completenessScore / 10);
    
    return Math.min(score, 100);
  };

  const purchaseLikelihood = getPurchaseLikelihood();

  const getLikelihoodColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSuggestedProducts = () => {
    const suggestions = [];
    
    if (lead.industry?.toLowerCase().includes('tech') || lead.industry?.toLowerCase().includes('software')) {
      suggestions.push('Enterprise Software Solutions', 'API Integration Services');
    }
    if (lead.companySize === 'Enterprise (1000+)') {
      suggestions.push('Enterprise Support Package', 'Custom Implementation');
    }
    if (lead.seniority === 'C-level' || lead.seniority === 'Executive') {
      suggestions.push('Strategic Consulting', 'Executive Training');
    }
    if (suggestions.length === 0) {
      suggestions.push('Starter Package', 'Professional Services');
    }
    
    return suggestions.slice(0, 3);
  };

  const suggestedProducts = getSuggestedProducts();
  const hasWebsite = lead.organizationWebsite && lead.organizationWebsite.trim() !== '';

  const handleViewWebsite = () => {
    if (hasWebsite) {
      const url = lead.organizationWebsite!.startsWith('http') 
        ? lead.organizationWebsite 
        : `https://${lead.organizationWebsite}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] max-w-[500px] overflow-hidden">
        <SheetHeader>
          <SheetTitle>Lead Profile</SheetTitle>
          <SheetDescription>
            Detailed information about {lead.firstName} {lead.lastName}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-full mt-6">
          <div className="p-1 space-y-4">
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={lead.photoUrl} alt={`${lead.firstName} ${lead.lastName}`} />
                <AvatarFallback className="text-sm">
                  {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg leading-tight break-words">
                    {lead.firstName} {lead.lastName}
                  </h3>
                  <div className="w-8 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${lead.completenessScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lead.title}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                    {lead.status}
                  </Badge>
                  <Badge className={`${getSeniorityColor(lead.seniority)} text-xs`}>
                    {lead.seniority}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Contact Details
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate break-all">{lead.email}</span>
                </div>
                
                {lead.personalEmail && lead.personalEmail !== lead.email && (
                  <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate break-all">Personal: {lead.personalEmail}</span>
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="break-all">{lead.phone}</span>
                  </div>
                )}
                
                {lead.location && (
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{lead.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 pt-1">
                {lead.linkedin && (
                  <a 
                    href={lead.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {lead.twitterUrl && (
                  <a 
                    href={lead.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {lead.facebookUrl && (
                  <a 
                    href={lead.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <Separator />

            {/* Company Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium flex items-center gap-2 text-base">
                  <Building className="h-4 w-4" />
                  Company Profile
                </h4>
                {hasWebsite && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewWebsite}
                    className="flex items-center gap-1 text-sm px-3 py-2 h-8 shrink-0"
                  >
                    <Globe className="h-3 w-3" />
                    <span>Visit Website</span>
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate text-base">{lead.company}</span>
                  {hasWebsite && (
                    <a 
                      href={lead.organizationWebsite!.startsWith('http') 
                        ? lead.organizationWebsite 
                        : `https://${lead.organizationWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{lead.companySize}</span>
                  </div>
                  
                  {lead.organizationFounded && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs">Est. {lead.organizationFounded}</span>
                    </div>
                  )}
                </div>
                
                {lead.industry && (
                  <Badge variant="outline" className="text-xs w-fit">
                    {lead.industry}
                  </Badge>
                )}
                
                {lead.department && (
                  <div className="text-xs text-muted-foreground">
                    Department: {lead.department}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Purchase Likelihood & Suggestions */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Sales Intelligence
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Purchase Likelihood</span>
                  <span className={`font-semibold text-sm ${getLikelihoodColor(purchaseLikelihood)}`}>
                    {purchaseLikelihood}%
                  </span>
                </div>
                
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      purchaseLikelihood >= 80 ? 'bg-green-500' :
                      purchaseLikelihood >= 60 ? 'bg-yellow-500' :
                      purchaseLikelihood >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${purchaseLikelihood}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm font-medium">Suggested Products:</span>
                <div className="flex flex-wrap gap-1">
                  {suggestedProducts.map((product, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Engagement History & Category */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>Emails Sent: {lead.emailsSent}</span>
                  </div>
                  {lead.lastContactDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="truncate">Last Contact: {formatDate(lead.lastContactDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: categoryInfo.color }}
                    />
                    <span className="text-muted-foreground truncate">{categoryInfo.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Added: {formatDate(lead.createdAt)}
                  </div>
                </div>
              </div>
              
              {lead.tags && lead.tags.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span>Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.slice(0, 4).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {lead.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{lead.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Remarks Section */}
            {lead.remarks && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    Remarks
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {lead.remarks}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
