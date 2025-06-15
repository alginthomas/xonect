
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapCSVToLead } from '@/utils/csvMapping';
import { filterDuplicatesFromCSV } from '@/utils/csvDuplicateDetection';
import { createImportBatch, updateImportBatch, findOrCreateCategory } from '@/utils/importBatchManager';
import { generateEnhancedFileHash, areFilesSimilar, type FileHashResult } from '@/utils/enhancedFileHashGenerator';
import { validateForDuplicates, type DuplicateValidationResult } from '@/utils/advancedDuplicateValidation';
import type { Category, ImportBatch } from '@/types/category';
import type { Lead } from '@/types/lead';

interface UseEnhancedCSVImportProps {
  onImportComplete: () => void;
  categories: Category[];
  existingLeads: Lead[];
  importBatches: ImportBatch[];
}

export const useEnhancedCSVImport = ({ 
  onImportComplete, 
  categories, 
  existingLeads,
  importBatches 
}: UseEnhancedCSVImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DuplicateValidationResult | null>(null);
  const [fileHash, setFileHash] = useState<FileHashResult | null>(null);
  const { toast } = useToast();

  // Transform database row to Lead type
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
      activityLog: row.activity_log || [],
      userId: row.user_id
    };
  };

  const validateCSVFile = async (
    csvData: any[],
    fileName: string,
    strictMode: boolean = false
  ): Promise<{
    isValid: boolean;
    validationResult: DuplicateValidationResult;
    fileHash: FileHashResult;
    fileConflicts: Array<{ batch: ImportBatch; similarity: any }>;
  }> => {
    setIsValidating(true);
    
    try {
      console.log('🔍 Starting enhanced CSV validation:', {
        fileName,
        rowCount: csvData.length,
        strictMode
      });

      // Get current user for user-scoped validation
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Generate enhanced file hash
      const hash = generateEnhancedFileHash(csvData, fileName);
      setFileHash(hash);

      // Check for file conflicts with existing imports (user-scoped)
      const userImportBatches = userId ? importBatches.filter(batch => batch.user_id === userId) : importBatches;
      const fileConflicts: Array<{ batch: ImportBatch; similarity: any }> = [];
      
      for (const batch of userImportBatches) {
        if (batch.metadata?.fileHash) {
          const existingHash = batch.metadata as any;
          if (existingHash.combinedHash) {
            const similarity = areFilesSimilar(hash, existingHash);
            if (similarity.isIdentical || similarity.isSimilar) {
              fileConflicts.push({ batch, similarity });
            }
          }
        }
        
        // Also check by filename for legacy compatibility
        if (batch.sourceFile === fileName) {
          fileConflicts.push({ 
            batch, 
            similarity: { isIdentical: true, reasons: ['Same filename'] }
          });
        }
      }

      // Show file conflict warnings
      if (fileConflicts.length > 0) {
        const identicalFiles = fileConflicts.filter(c => c.similarity.isIdentical);
        const similarFiles = fileConflicts.filter(c => c.similarity.isSimilar && !c.similarity.isIdentical);
        
        if (identicalFiles.length > 0) {
          toast({
            title: "Duplicate File Detected",
            description: `This file appears to be identical to a previously imported file: "${identicalFiles[0].batch.name}". Consider reviewing before proceeding.`,
            variant: "destructive"
          });
        } else if (similarFiles.length > 0) {
          toast({
            title: "Similar File Detected",
            description: `This file appears similar to "${similarFiles[0].batch.name}". Please review for potential duplicates.`,
            variant: "default"
          });
        }
      }

      // Validate for duplicates (user-scoped)
      const validation = validateForDuplicates(csvData, existingLeads, strictMode, userId);
      setValidationResult(validation);

      console.log('✅ Validation completed:', {
        isValid: validation.isValid,
        duplicateCount: validation.duplicateCount,
        canProceed: validation.canProceed,
        fileConflicts: fileConflicts.length,
        userId
      });

      return {
        isValid: validation.isValid,
        validationResult: validation,
        fileHash: hash,
        fileConflicts
      };

    } catch (error) {
      console.error('💥 Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "There was an error validating your data.",
        variant: "destructive"
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
    selectedCategory: string,
    forceImport: boolean = false
  ) => {
    setIsImporting(true);
    
    try {
      console.log('🚀 Starting enhanced CSV import:', {
        fileName,
        importName,
        selectedCategory,
        rowCount: csvData.length,
        forceImport
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // If not force import, validate first
      if (!forceImport && !validationResult) {
        const validation = await validateCSVFile(csvData, fileName);
        if (!validation.validationResult.canProceed) {
          toast({
            title: "Import Blocked",
            description: "Please review the validation results before proceeding.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Create or find category if provided
      let categoryId: string | null = null;
      if (selectedCategory && selectedCategory.trim()) {
        categoryId = await findOrCreateCategory(selectedCategory, categories, importName, user.id);
        
        // If a new category was created, trigger a refresh of the categories
        if (categoryId) {
          console.log('📁 Category created/found:', { categoryId, selectedCategory });
          // Call onImportComplete early to refresh categories
          setTimeout(() => {
            window.location.reload(); // Force a full refresh to update categories
          }, 100);
        }
      }

      // Map CSV data to leads format
      const potentialLeads = csvData.map(row => mapCSVToLead(row, categoryId, null, user.id));

      // Filter out duplicates using the existing logic (user-scoped)
      const { uniqueLeads, duplicates, withinBatchDuplicates } = filterDuplicatesFromCSV(
        potentialLeads,
        existingLeads,
        user.id
      );

      const totalDuplicates = duplicates.length + withinBatchDuplicates.length;
      
      console.log('🔍 Final duplicate check results:', {
        totalProcessed: potentialLeads.length,
        uniqueLeads: uniqueLeads.length,
        duplicates: duplicates.length,
        withinBatchDuplicates: withinBatchDuplicates.length,
        userId: user.id
      });

      // Create import batch record with enhanced metadata
      const importBatch = await createImportBatch(
        importName,
        fileName,
        csvData,
        categoryId,
        user.id,
        csvData.length,
        0,
        totalDuplicates,
        fileHash || undefined
      );

      // Update batch metadata with enhanced file hash
      if (fileHash) {
        // Safely handle metadata - ensure it's an object
        const existingMetadata = importBatch.metadata && typeof importBatch.metadata === 'object' 
          ? importBatch.metadata as Record<string, any>
          : {};

        // Convert validation result to a JSON-serializable format
        const serializableValidationResult = validationResult ? {
          isValid: validationResult.isValid,
          duplicateCount: validationResult.duplicateCount,
          canProceed: validationResult.canProceed,
          recommendations: validationResult.recommendations,
          withinFileCount: validationResult.duplicateDetails.withinFile.length,
          againstDatabaseCount: validationResult.duplicateDetails.againstDatabase.length
        } : null;

        const updatedMetadata = {
          ...existingMetadata,
          contentHash: fileHash.contentHash,
          structureHash: fileHash.structureHash,
          combinedHash: fileHash.combinedHash,
          fileMetadata: fileHash.metadata,
          validationSummary: serializableValidationResult,
          importDate: new Date().toISOString()
        };

        await supabase
          .from('import_batches')
          .update({
            metadata: updatedMetadata
          })
          .eq('id', importBatch.id);
      }

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

      // Prepare leads for database insertion
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

      // Insert leads in batches
      const batchSize = 100;
      let successfulImports = 0;
      let failedImports = totalDuplicates;

      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);
        
        console.log(`📥 Inserting batch ${Math.floor(i/batchSize) + 1}:`, {
          batchStart: i,
          batchSize: batch.length
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

      console.log('🎉 Enhanced import completed:', {
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
      console.error('💥 Enhanced import error:', error);
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

  const clearValidation = () => {
    setValidationResult(null);
    setFileHash(null);
  };

  return {
    importCSVData,
    validateCSVFile,
    clearValidation,
    isImporting,
    isValidating,
    validationResult,
    fileHash
  };
};
