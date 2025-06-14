
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types/category';
import type { FileHashResult } from '@/utils/enhancedFileHashGenerator';

export const createImportBatch = async (
  importName: string,
  fileName: string,
  csvData: any[],
  categoryId?: string,
  userId?: string,
  totalLeads?: number,
  successfulImports?: number,
  failedImports?: number,
  fileHash?: FileHashResult
) => {
  const metadata = {
    importDate: new Date().toISOString(),
    fileName,
    originalRowCount: csvData.length,
    columnNames: Object.keys(csvData[0] || {}),
    ...(fileHash && {
      contentHash: fileHash.contentHash,
      structureHash: fileHash.structureHash,
      combinedHash: fileHash.combinedHash,
      fileMetadata: fileHash.metadata
    })
  };
  
  const { data: importBatch, error: batchError } = await supabase
    .from('import_batches')
    .insert({
      name: importName,
      source_file: fileName,
      total_leads: totalLeads || csvData.length,
      successful_imports: successfulImports || 0,
      failed_imports: failedImports || 0,
      category_id: categoryId,
      user_id: userId,
      metadata
    })
    .select()
    .single();

  if (batchError) throw batchError;
  
  console.log('📦 Created enhanced import batch:', importBatch);
  return importBatch;
};

export const updateImportBatch = async (
  batchId: string,
  successfulImports: number,
  failedImports: number
) => {
  await supabase
    .from('import_batches')
    .update({
      successful_imports: successfulImports,
      failed_imports: failedImports
    })
    .eq('id', batchId);
};

export const findOrCreateCategory = async (
  selectedCategory: string,
  categories: Category[],
  importName: string,
  userId: string
): Promise<string | undefined> => {
  if (!selectedCategory?.trim()) return undefined;

  const existingCategory = categories.find(cat => 
    cat.name.toLowerCase() === selectedCategory.toLowerCase()
  );
  
  if (existingCategory) {
    console.log('📂 Using existing category:', existingCategory);
    return existingCategory.id;
  } else {
    // Create new category
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: selectedCategory,
        description: `Auto-created from import: ${importName}`,
        color: '#3B82F6',
        user_id: userId
      })
      .select()
      .single();

    if (categoryError) throw categoryError;
    console.log('📂 Created new category:', newCategory);
    return newCategory.id;
  }
};
