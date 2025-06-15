
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapCSVToLead } from '@/utils/csvMapping';
import { validateForDuplicates } from '@/utils/advancedDuplicateValidation';
import type { Lead } from '@/types/lead';

export const useEnhancedCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      // Step 1: Get existing leads for duplicate validation (user-scoped)
      const { data: existingLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId || '');

      if (leadsError) {
        console.error('❌ Error fetching existing leads:', leadsError);
        throw leadsError;
      }

      console.log('📋 Fetched existing leads for validation:', existingLeads?.length || 0);
      setImportProgress(10);

      // Step 2: Validate for duplicates
      const validationResult = validateForDuplicates(
        csvData,
        existingLeads || [],
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
            validation_result: validationResult,
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
      const leadsToInsert: Partial<Lead>[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < csvData.length; i++) {
        try {
          const mappedLead = mapCSVToLead(csvData[i], selectedCategoryId, importBatch.id, userId);
          
          const leadData: Partial<Lead> = {
            firstName: mappedLead.first_name,
            lastName: mappedLead.last_name,
            email: mappedLead.email,
            phone: mappedLead.phone || '',
            company: mappedLead.company,
            title: mappedLead.title,
            linkedin: mappedLead.linkedin || '',
            industry: mappedLead.industry || '',
            location: mappedLead.location || '',
            seniority: mappedLead.seniority,
            companySize: mappedLead.company_size,
            status: mappedLead.status,
            emailsSent: mappedLead.emails_sent,
            completenessScore: mappedLead.completeness_score,
            categoryId: mappedLead.category_id,
            importBatchId: mappedLead.import_batch_id,
            userId: mappedLead.user_id,
            tags: mappedLead.tags,
            remarksHistory: mappedLead.remarks_history,
            activityLog: mappedLead.activity_log,
            department: mappedLead.department,
            personalEmail: mappedLead.personal_email,
            photoUrl: mappedLead.photo_url,
            twitterUrl: mappedLead.twitter_url,
            facebookUrl: mappedLead.facebook_url,
            organizationWebsite: mappedLead.organization_website,
            organizationFounded: mappedLead.organization_founded,
            remarks: mappedLead.remarks,
            createdAt: new Date()
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
          .insert(leadsToInsert.map(lead => ({
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            title: lead.title,
            linkedin: lead.linkedin,
            industry: lead.industry,
            location: lead.location,
            seniority: lead.seniority,
            company_size: lead.companySize,
            status: lead.status,
            emails_sent: lead.emailsSent,
            completeness_score: lead.completenessScore,
            category_id: lead.categoryId,
            import_batch_id: lead.importBatchId,
            user_id: lead.userId,
            tags: lead.tags,
            remarks_history: lead.remarksHistory,
            activity_log: lead.activityLog,
            department: lead.department,
            personal_email: lead.personalEmail,
            photo_url: lead.photoUrl,
            twitter_url: lead.twitterUrl,
            facebook_url: lead.facebookUrl,
            organization_website: lead.organizationWebsite,
            organization_founded: lead.organizationFounded,
            remarks: lead.remarks
          })));

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
    isImporting,
    importProgress
  };
};

