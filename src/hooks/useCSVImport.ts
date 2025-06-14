
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateFileHash } from '@/utils/duplicateDetection';
import type { Category } from '@/types/category';

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

  const mapCSVToLead = (csvRow: any, categoryId?: string, importBatchId?: string, userId?: string) => {
    const mappedLead = {
      first_name: csvRow['First Name'] || csvRow['firstName'] || '',
      last_name: csvRow['Last Name'] || csvRow['lastName'] || '',
      email: csvRow['Email'] || csvRow['email'] || '',
      phone: csvRow['Phone'] || csvRow['phone'] || '',
      company: csvRow['Company'] || csvRow['company'] || '',
      title: csvRow['Title'] || csvRow['title'] || csvRow['Job Title'] || '',
      linkedin: csvRow['LinkedIn'] || csvRow['linkedin'] || csvRow['LinkedIn URL'] || '',
      industry: csvRow['Industry'] || csvRow['industry'] || '',
      location: csvRow['Location'] || csvRow['location'] || '',
      seniority: 'Mid-level' as const,
      company_size: 'Small (1-50)' as const,
      status: 'New' as const,
      emails_sent: 0,
      completeness_score: 0, // Will be calculated
      category_id: categoryId || null,
      import_batch_id: importBatchId || null,
      user_id: userId || '',
      tags: [],
      remarks_history: [],
      activity_log: [],
      department: csvRow['Department'] || csvRow['department'] || '',
      personal_email: csvRow['Personal Email'] || csvRow['personalEmail'] || '',
      photo_url: csvRow['Photo URL'] || csvRow['photoUrl'] || '',
      twitter_url: csvRow['Twitter'] || csvRow['twitter'] || '',
      facebook_url: csvRow['Facebook'] || csvRow['facebook'] || '',
      organization_website: csvRow['Website'] || csvRow['website'] || '',
      organization_founded: csvRow['Founded'] ? parseInt(csvRow['Founded']) : null,
      remarks: ''
    };

    // Calculate completeness score based on the mapped data
    mappedLead.completeness_score = calculateCompletenessScore({
      firstName: mappedLead.first_name,
      lastName: mappedLead.last_name,
      email: mappedLead.email,
      phone: mappedLead.phone,
      company: mappedLead.company,
      title: mappedLead.title,
      linkedin: mappedLead.linkedin
    });

    return mappedLead;
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
      const leads = csvData.map(row => mapCSVToLead(row, categoryId, importBatch.id, user.id));

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
