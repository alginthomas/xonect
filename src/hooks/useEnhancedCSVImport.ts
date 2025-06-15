
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapCSVToLead } from '@/utils/csvMapping';
import { validateForDuplicates } from '@/utils/advancedDuplicateValidation';
import type { Lead } from '@/types/lead';
import type { DuplicateValidationResult } from '@/utils/advancedDuplicateValidation';

export const useEnhancedCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<DuplicateValidationResult | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clearValidation = () => {
    setValidationResult(null);
  };

  const validateCSVFile = async (
    csvData: any[],
    fileName: string,
    strictMode: boolean = false,
    userId?: string
  ) => {
    if (!csvData.length) {
      throw new Error('No data to validate');
    }

    setIsValidating(true);

    try {
      // Get existing leads for duplicate validation (user-scoped)
      const { data: existingLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId || '');

      if (leadsError) {
        console.error('❌ Error fetching existing leads:', leadsError);
        throw leadsError;
      }

      // Convert database leads to Lead type format
      const convertedLeads: Lead[] = (existingLeads || []).map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company,
        title: lead.title,
        linkedin: lead.linkedin || '',
        industry: lead.industry || '',
        location: lead.location || '',
        seniority: lead.seniority,
        companySize: lead.company_size,
        status: lead.status,
        emailsSent: lead.emails_sent,
        completenessScore: lead.completeness_score,
        categoryId: lead.category_id,
        importBatchId: lead.import_batch_id,
        userId: lead.user_id,
        tags: lead.tags || [],
        remarksHistory: Array.isArray(lead.remarks_history) ? lead.remarks_history : [],
        activityLog: Array.isArray(lead.activity_log) ? lead.activity_log : [],
        department: lead.department,
        personalEmail: lead.personal_email,
        photoUrl: lead.photo_url,
        twitterUrl: lead.twitter_url,
        facebookUrl: lead.facebook_url,
        organizationWebsite: lead.organization_website,
        organizationFounded: lead.organization_founded,
        remarks: lead.remarks,
        createdAt: new Date(lead.created_at),
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined
      }));

      console.log('📋 Fetched existing leads for validation:', convertedLeads.length);

      // Validate for duplicates
      const validationResult = validateForDuplicates(
        csvData,
        convertedLeads,
        strictMode,
        userId
      );

      console.log('🔍 Validation completed:', validationResult);
      setValidationResult(validationResult);

      return validationResult;
    } catch (error: any) {
      console.error('❌ Validation failed:', error);
      
      toast({
        title: 'Validation failed',
        description: error.message || 'An unexpected error occurred during validation',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  const importCSVData = async (
    csvData: any[],
    fileName: string,
    importName: string,
    selectedCategoryId?: string,
    proceedAfterValidation: boolean = false,
    userId?: string
  ) => {
    return await importLeads(csvData, selectedCategoryId, false, userId);
  };

  const importLeads = async (
    csvData: any[],
    selectedCategoryId?: string,
    strictMode: boolean = false,
    userId?: string
  ) => {
    if (!csvData.length) {
      throw new Error('No data to import');
    }

    console.log('🚀 Enhanced CSV import starting:', {
      rowCount: csvData.length,
      categoryId: selectedCategoryId,
      strictMode,
      userId
    });

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Get existing leads for duplicate validation (user-scoped)
      const { data: existingLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId || '');

      if (leadsError) {
        console.error('❌ Error fetching existing leads:', leadsError);
        throw leadsError;
      }

      // Convert to Lead type format for validation
      const convertedLeads: Lead[] = (existingLeads || []).map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company,
        title: lead.title,
        linkedin: lead.linkedin || '',
        industry: lead.industry || '',
        location: lead.location || '',
        seniority: lead.seniority,
        companySize: lead.company_size,
        status: lead.status,
        emailsSent: lead.emails_sent,
        completenessScore: lead.completeness_score,
        categoryId: lead.category_id,
        importBatchId: lead.import_batch_id,
        userId: lead.user_id,
        tags: lead.tags || [],
        remarksHistory: Array.isArray(lead.remarks_history) ? lead.remarks_history : [],
        activityLog: Array.isArray(lead.activity_log) ? lead.activity_log : [],
        department: lead.department,
        personalEmail: lead.personal_email,
        photoUrl: lead.photo_url,
        twitterUrl: lead.twitter_url,
        facebookUrl: lead.facebook_url,
        organizationWebsite: lead.organization_website,
        organizationFounded: lead.organization_founded,
        remarks: lead.remarks,
        createdAt: new Date(lead.created_at),
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined
      }));

      console.log('📋 Fetched existing leads for validation:', convertedLeads.length);
      setImportProgress(10);

      // Step 2: Validate for duplicates
      const validationResult = validateForDuplicates(
        csvData,
        convertedLeads,
        strictMode,
        userId
      );

      console.log('🔍 Duplicate validation completed:', validationResult);
      setImportProgress(20);

      if (!validationResult.canProceed) {
        throw new Error('Import blocked due to duplicate validation failures in strict mode');
      }

      // Step 3: Create import batch
      const batchName = `Import ${new Date().toLocaleString()}`;
      const { data: importBatch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: batchName,
          total_leads: csvData.length,
          successful_imports: 0,
          failed_imports: 0,
          category_id: selectedCategoryId,
          user_id: userId || '',
          metadata: {
            validation_result: validationResult as any,
            strict_mode: strictMode
          }
        })
        .select()
        .single();

      if (batchError || !importBatch) {
        console.error('❌ Error creating import batch:', batchError);
        throw batchError;
      }

      console.log('📦 Import batch created:', importBatch.id);
      setImportProgress(30);

      // Step 4: Process and insert leads
      const leadsToInsert: any[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        try {
          const mappedLead = mapCSVToLead(csvData[i], selectedCategoryId, importBatch.id, userId);
          
          const leadData = {
            first_name: mappedLead.first_name,
            last_name: mappedLead.last_name,
            email: mappedLead.email,
            phone: mappedLead.phone || '',
            company: mappedLead.company,
            title: mappedLead.title,
            linkedin: mappedLead.linkedin || '',
            industry: mappedLead.industry || '',
            location: mappedLead.location || '',
            seniority: mappedLead.seniority,
            company_size: mappedLead.company_size,
            status: mappedLead.status,
            emails_sent: mappedLead.emails_sent,
            completeness_score: mappedLead.completeness_score,
            category_id: mappedLead.category_id,
            import_batch_id: mappedLead.import_batch_id,
            user_id: mappedLead.user_id,
            tags: mappedLead.tags,
            remarks_history: mappedLead.remarks_history,
            activity_log: mappedLead.activity_log,
            department: mappedLead.department,
            personal_email: mappedLead.personal_email,
            photo_url: mappedLead.photo_url,
            twitter_url: mappedLead.twitter_url,
            facebook_url: mappedLead.facebook_url,
            organization_website: mappedLead.organization_website,
            organization_founded: mappedLead.organization_founded,
            remarks: mappedLead.remarks
          };

          leadsToInsert.push(leadData);
          successCount++;
        } catch (error) {
          console.error(`❌ Error processing row ${i}:`, error);
          failCount++;
        }

        // Update progress
        const progress = 30 + ((i + 1) / csvData.length) * 50;
        setImportProgress(progress);
      }

      console.log('📊 Leads processing completed:', { successCount, failCount });

      // Step 5: Bulk insert leads
      if (leadsToInsert.length > 0) {
        console.log('💾 Inserting leads into database...');
        
        const { error: insertError } = await supabase
          .from('leads')
          .insert(leadsToInsert);

        if (insertError) {
          console.error('❌ Error inserting leads:', insertError);
          throw insertError;
        }

        console.log('✅ Leads inserted successfully');
      }

      setImportProgress(90);

      // Step 6: Update import batch with final counts
      const { error: updateError } = await supabase
        .from('import_batches')
        .update({
          successful_imports: successCount,
          failed_imports: failCount
        })
        .eq('id', importBatch.id);

      if (updateError) {
        console.error('❌ Error updating import batch:', updateError);
      }

      setImportProgress(100);

      // Step 7: Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['import-batches'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });

      const result = {
        success: true,
        importedCount: successCount,
        failedCount: failCount,
        batchId: importBatch.id,
        validationResult
      };

      console.log('🎉 Enhanced CSV import completed:', result);

      toast({
        title: 'Import completed successfully',
        description: `${successCount} leads imported successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });

      return result;

    } catch (error: any) {
      console.error('❌ Enhanced CSV import failed:', error);
      
      toast({
        title: 'Import failed',
        description: error.message || 'An unexpected error occurred during import',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return {
    importLeads,
    importCSVData,
    validateCSVFile,
    clearValidation,
    isImporting,
    isValidating,
    importProgress,
    validationResult
  };
};
