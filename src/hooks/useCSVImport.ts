
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
    // Enhanced CSV field mapping with more flexible column name matching
    const getFieldValue = (possibleNames: string[]): string => {
      for (const name of possibleNames) {
        if (csvRow[name] !== undefined && csvRow[name] !== null && csvRow[name] !== '') {
          return String(csvRow[name]).trim();
        }
      }
      return '';
    };

    // --- Enhanced phone number detection logic ---
    const getPhoneValue = (row: any): string => {
      // Try various likely candidates
      const possiblePhoneKeys = [
        'Phone', 'phone', 'Phone Number', 'phone_number', 'PhoneNumber',
        'mobile', 'cell', 'Cell Phone', 'Mobile Phone', 'tel', 'telephone',
        'Primary Phone', 'Primary Contact', 'Contact Number', 'Contact', 
        'phone number', 'Mobile', 'Contact No.'
      ];
      for (const key of possiblePhoneKeys) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
          return String(row[key]).trim();
        }
      }
      // fallback: look for any key containing 'phone' or 'mobile' (case-insensitive)
      for (const col in row) {
        if (/phone|mobile|tel/i.test(col) && row[col] && String(row[col]).trim() !== '') {
          return String(row[col]).trim();
        }
      }
      return '';
    };

    const mappedLead = {
      first_name: getFieldValue(['First Name', 'firstName', 'first_name', 'FirstName', 'fname', 'given_name']),
      last_name: getFieldValue(['Last Name', 'lastName', 'last_name', 'LastName', 'lname', 'family_name', 'surname']),
      email: getFieldValue(['Email', 'email', 'Email Address', 'email_address', 'EmailAddress', 'e_mail']),
      phone: getPhoneValue(csvRow),
      company: getFieldValue(['Company', 'company', 'Company Name', 'company_name', 'CompanyName', 'organization', 'org']),
      title: getFieldValue(['Title', 'title', 'Job Title', 'job_title', 'JobTitle', 'position', 'role']),
      linkedin: getFieldValue(['LinkedIn', 'linkedin', 'LinkedIn URL', 'linkedin_url', 'LinkedInURL', 'linkedin_profile']),
      industry: getFieldValue(['Industry', 'industry', 'sector']),
      location: getFieldValue(['Location', 'location', 'city', 'address', 'country']),
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
      department: getFieldValue(['Department', 'department', 'dept']),
      personal_email: getFieldValue(['Personal Email', 'personal_email', 'personalEmail', 'private_email']),
      photo_url: getFieldValue(['Photo URL', 'photo_url', 'photoUrl', 'image', 'avatar', 'picture']),
      twitter_url: getFieldValue(['Twitter', 'twitter', 'twitter_url', 'TwitterURL']),
      facebook_url: getFieldValue(['Facebook', 'facebook', 'facebook_url', 'FacebookURL']),
      organization_website: getFieldValue(['Website', 'website', 'company_website', 'url', 'web']),
      organization_founded: (() => {
        const founded = getFieldValue(['Founded', 'founded', 'year_founded', 'establishment_year']);
        return founded ? parseInt(founded) : null;
      })(),
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
      linkedin: mappedLead.linkedin,
    });

    console.log('🔄 Mapped CSV row to lead:', { originalRow: csvRow, mappedLead });

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

      let categoryId: string | undefined;

      // Create or find category if provided
      if (selectedCategory && selectedCategory.trim()) {
        const existingCategory = categories.find(cat => 
          cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );
        
        if (existingCategory) {
          categoryId = existingCategory.id;
          console.log('📂 Using existing category:', existingCategory);
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
          console.log('📂 Created new category:', newCategory);
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
            originalRowCount: csvData.length,
            columnNames: Object.keys(csvData[0] || {})
          }
        })
        .select()
        .single();

      if (batchError) throw batchError;
      console.log('📦 Created import batch:', importBatch);

      // Process and insert leads
      const leads = csvData.map(row => mapCSVToLead(row, categoryId, importBatch.id, user.id));

      console.log('📊 Sample mapped lead for debugging:', leads[0]);

      // Insert leads in batches to avoid overwhelming the database
      const batchSize = 100;
      let successfulImports = 0;
      let failedImports = 0;

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        
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
      await supabase
        .from('import_batches')
        .update({
          successful_imports: successfulImports,
          failed_imports: failedImports
        })
        .eq('id', importBatch.id);

      console.log('🎉 Import completed:', {
        successfulImports,
        failedImports,
        totalProcessed: successfulImports + failedImports
      });

      toast({
        title: "Import Successful",
        description: `"${importName}" has been imported successfully. ${successfulImports} leads imported${failedImports > 0 ? `, ${failedImports} failed` : ''}.`
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
