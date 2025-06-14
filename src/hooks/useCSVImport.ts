
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateFileHash } from '@/utils/duplicateDetection';
import type { Category } from '@/types/category';
import type { Lead } from '@/types/lead';

interface UseCSVImportProps {
  onImportComplete: () => void;
  categories: Category[];
}

export const useCSVImport = ({ onImportComplete, categories }: UseCSVImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const calculateCompletenessScore = (lead: any): number => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'title', 'linkedin'];
    const filledFields = fields.filter(field => lead[field] && lead[field].trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const mapCSVToLead = (csvRow: any, categoryId?: string, importBatchId?: string): Partial<Lead> => {
    return {
      firstName: csvRow['First Name'] || csvRow['firstName'] || '',
      lastName: csvRow['Last Name'] || csvRow['lastName'] || '',
      email: csvRow['Email'] || csvRow['email'] || '',
      phone: csvRow['Phone'] || csvRow['phone'] || '',
      company: csvRow['Company'] || csvRow['company'] || '',
      title: csvRow['Title'] || csvRow['title'] || csvRow['Job Title'] || '',
      linkedin: csvRow['LinkedIn'] || csvRow['linkedin'] || csvRow['LinkedIn URL'] || '',
      industry: csvRow['Industry'] || csvRow['industry'] || '',
      location: csvRow['Location'] || csvRow['location'] || '',
      seniority: 'Mid-level',
      companySize: 'Small (1-50)',
      status: 'New',
      emailsSent: 0,
      completenessScore: 0, // Will be calculated
      categoryId: categoryId || null,
      importBatchId: importBatchId || null,
      tags: [],
      remarksHistory: []
    };
  };

  const importCSVData = async (
    csvData: any[],
    fileName: string,
    importName: string,
    selectedCategory: string
  ) => {
    setIsImporting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let categoryId: string | undefined;

      // Create or find category if provided
      if (selectedCategory && selectedCategory.trim()) {
        const existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              name: selectedCategory,
              description: `Auto-created from import: ${importName}`,
              color: '#3B82F6',
              user_id: user.id
            })
            .select()
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }

      // Create import batch record
      const fileHash = generateFileHash(JSON.stringify(csvData));
      const { data: importBatch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          name: importName,
          source_file: fileName,
          total_leads: csvData.length,
          successful_imports: 0,
          failed_imports: 0,
          category_id: categoryId,
          user_id: user.id,
          metadata: {
            fileHash,
            importDate: new Date().toISOString(),
            fileName,
            originalRowCount: csvData.length
          }
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Process and insert leads
      const leads: Partial<Lead>[] = csvData.map(row => {
        const lead = mapCSVToLead(row, categoryId, importBatch.id);
        lead.completenessScore = calculateCompletenessScore(lead);
        lead.user_id = user.id;
        return lead;
      });

      // Insert leads in batches to avoid overwhelming the database
      const batchSize = 100;
      let successfulImports = 0;
      let failedImports = 0;

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        
        const { data: insertedLeads, error: leadsError } = await supabase
          .from('leads')
          .insert(batch)
          .select();

        if (leadsError) {
          console.error('Error inserting batch:', leadsError);
          failedImports += batch.length;
        } else {
          successfulImports += insertedLeads?.length || 0;
        }
      }

      // Update import batch with final counts
      await supabase
        .from('import_batches')
        .update({
          successful_imports: successfulImports,
          failed_imports: failedImports
        })
        .eq('id', importBatch.id);

      toast({
        title: "Import Successful",
        description: `"${importName}" has been imported successfully. ${successfulImports} leads imported${failedImports > 0 ? `, ${failedImports} failed` : ''}.`
      });

      onImportComplete();
      return true;

    } catch (error) {
      console.error('Import error:', error);
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
