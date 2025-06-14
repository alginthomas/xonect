
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapCSVToLead } from '@/utils/csvMapping';
import { filterDuplicatesFromCSV } from '@/utils/csvDuplicateDetection';
import { createImportBatch, updateImportBatch, findOrCreateCategory } from '@/utils/importBatchManager';
import type { Category } from '@/types/category';
import type { Lead } from '@/types/lead';

interface UseCSVImportProps {
  onImportComplete: () => void;
  categories: Category[];
}

// Helper function to transform database row to Lead type
const transformDatabaseRowToLead = (row: any): Lead => {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    personalEmail: row.personal_email,
    company: row.company,
    title: row.title,
    seniority: row.seniority,
    department: row.department,
    companySize: row.company_size,
    industry: row.industry,
    location: row.location,
    phone: row.phone,
    linkedin: row.linkedin,
    twitterUrl: row.twitter_url,
    facebookUrl: row.facebook_url,
    photoUrl: row.photo_url,
    organizationWebsite: row.organization_website,
    organizationFounded: row.organization_founded,
    tags: row.tags || [],
    status: row.status,
    emailsSent: row.emails_sent,
    lastContactDate: row.last_contact_date ? new Date(row.last_contact_date) : undefined,
    createdAt: new Date(row.created_at),
    completenessScore: row.completeness_score,
    categoryId: row.category_id,
    importBatchId: row.import_batch_id,
    remarks: row.remarks,
    remarksHistory: row.remarks_history || [],
    activityLog: row.activity_log || []
  };
};

export const useCSVImport = ({ onImportComplete, categories }: UseCSVImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const importCSVData = async (
    csvData: any[],
    fileName: string,
    importName: string,
    selectedCategory: string
  ) => {
    setIsImporting(true);
    
    try {
      console.log('🚀 Starting CSV import:', {
        fileName,
        importName,
        selectedCategory,
        rowCount: csvData.length,
        sampleRow: csvData[0]
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch existing leads for duplicate detection
      const { data: existingLeadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, email, phone, first_name, last_name, company, created_at, status, completeness_score, emails_sent, last_contact_date')
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching existing leads:', leadsError);
        throw leadsError;
      }

      // Transform database rows to Lead type for duplicate detection
      const existingLeads: Lead[] = existingLeadsData?.map(transformDatabaseRowToLead) || [];

      console.log('📊 Fetched existing leads for duplicate check:', existingLeads.length);

      // Create or find category if provided
      const categoryId = await findOrCreateCategory(selectedCategory, categories, importName, user.id);

      // Map CSV data to leads format
      const potentialLeads = csvData.map(row => mapCSVToLead(row, categoryId, null, user.id));

      // Filter out duplicates
      const { uniqueLeads, duplicates, withinBatchDuplicates } = filterDuplicatesFromCSV(
        potentialLeads,
        existingLeads
      );

      console.log('🔍 Duplicate detection results:', {
        totalProcessed: potentialLeads.length,
        uniqueLeads: uniqueLeads.length,
        duplicates: duplicates.length,
        withinBatchDuplicates: withinBatchDuplicates.length
      });

      // Show warnings to user if there are duplicates
      const totalDuplicates = duplicates.length + withinBatchDuplicates.length;
      if (totalDuplicates > 0) {
        toast({
          title: "Duplicates Detected",
          description: `${totalDuplicates} duplicate${totalDuplicates > 1 ? 's' : ''} found and skipped. ${uniqueLeads.length} unique leads will be imported.`,
          variant: "default"
        });
      }

      // Create import batch record
      const importBatch = await createImportBatch(
        importName,
        fileName,
        csvData,
        categoryId,
        user.id,
        csvData.length,
        0,
        totalDuplicates
      );

      // Only process unique leads
      if (uniqueLeads.length === 0) {
        toast({
          title: "No New Leads",
          description: "All leads in the CSV already exist in your database. No new leads were imported.",
          variant: "default"
        });
        
        await updateImportBatch(importBatch.id, 0, totalDuplicates);
        onImportComplete();
        return true;
      }

      // Prepare leads for database insertion (ensure all required fields are present)
      const leadsToInsert = uniqueLeads.map(lead => ({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        title: lead.title,
        seniority: lead.seniority,
        company_size: lead.company_size,
        industry: lead.industry,
        location: lead.location,
        linkedin: lead.linkedin,
        status: lead.status,
        emails_sent: lead.emails_sent,
        completeness_score: lead.completeness_score,
        category_id: lead.category_id,
        import_batch_id: importBatch.id,
        user_id: user.id,
        tags: lead.tags,
        remarks_history: lead.remarks_history,
        activity_log: lead.activity_log,
        department: lead.department,
        personal_email: lead.personal_email,
        photo_url: lead.photo_url,
        twitter_url: lead.twitter_url,
        facebook_url: lead.facebook_url,
        organization_website: lead.organization_website,
        organization_founded: lead.organization_founded,
        remarks: lead.remarks || ''
      }));

      // Insert leads in batches to avoid overwhelming the database
      const batchSize = 100;
      let successfulImports = 0;
      let failedImports = totalDuplicates;

      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);
        
        console.log(`📥 Inserting batch ${Math.floor(i/batchSize) + 1}:`, {
          batchStart: i,
          batchSize: batch.length,
          sampleLead: batch[0]
        });

        const { data: insertedLeads, error: insertError } = await supabase
          .from('leads')
          .insert(batch)
          .select();

        if (insertError) {
          console.error('❌ Error inserting batch:', insertError);
          failedImports += batch.length;
        } else {
          successfulImports += insertedLeads?.length || 0;
          console.log(`✅ Successfully inserted ${insertedLeads?.length} leads`);
        }
      }

      // Update import batch with final counts
      await updateImportBatch(importBatch.id, successfulImports, failedImports);

      console.log('🎉 Import completed:', {
        successfulImports,
        failedImports,
        totalProcessed: successfulImports + failedImports,
        duplicatesSkipped: totalDuplicates
      });

      const message = successfulImports > 0 
        ? `"${importName}" has been imported successfully. ${successfulImports} unique leads imported${totalDuplicates > 0 ? `, ${totalDuplicates} duplicates skipped` : ''}.`
        : `Import completed. ${totalDuplicates} duplicates were detected and skipped. No new leads were added.`;

      toast({
        title: "Import Completed",
        description: message
      });

      onImportComplete();
      return true;

    } catch (error) {
      console.error('💥 Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "There was an error importing your data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importCSVData,
    isImporting
  };
};
