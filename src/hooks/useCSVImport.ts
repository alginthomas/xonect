
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mapCSVToLead } from '@/utils/csvMapping';
import { filterDuplicatesFromCSV } from '@/utils/csvDuplicateDetection';
import { createImportBatch, updateImportBatch, findOrCreateCategory } from '@/utils/importBatchManager';
import type { Category } from '@/types/category';

interface UseCSVImportProps {
  onImportComplete: () => void;
  categories: Category[];
}

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
      const { data: existingLeads, error: leadsError } = await supabase
        .from('leads')
        .select('id, email, phone, first_name, last_name, company, created_at, status, completeness_score, emails_sent, last_contact_date')
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching existing leads:', leadsError);
        throw leadsError;
      }

      console.log('📊 Fetched existing leads for duplicate check:', existingLeads?.length || 0);

      // Create or find category if provided
      const categoryId = await findOrCreateCategory(selectedCategory, categories, importName, user.id);

      // Map CSV data to leads format
      const potentialLeads = csvData.map(row => mapCSVToLead(row, categoryId, null, user.id));

      // Filter out duplicates
      const { uniqueLeads, duplicates, withinBatchDuplicates } = filterDuplicatesFromCSV(
        potentialLeads,
        existingLeads || []
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

      // Add import batch ID to allowed leads
      const leadsToInsert = uniqueLeads.map(lead => ({
        ...lead,
        import_batch_id: importBatch.id
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

        const { data: insertedLeads, error: leadsError } = await supabase
          .from('leads')
          .insert(batch)
          .select();

        if (leadsError) {
          console.error('❌ Error inserting batch:', leadsError);
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
