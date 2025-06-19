
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFileResult {
  data: any[];
  headers: string[];
  fileName: string;
  fileType: string;
}

export const supportedFileTypes = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/tab-separated-values': ['.tsv'],
  'application/json': ['.json']
};

export const parseCSVFile = (fileContent: string): Promise<ParsedFileResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        if (results.data.length === 0) {
          reject(new Error('No data found in CSV file.'));
          return;
        }
        
        const headers = results.meta.fields || [];
        resolve({
          data: results.data,
          headers,
          fileName: '',
          fileType: 'csv'
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const parseTSVFile = (fileContent: string): Promise<ParsedFileResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`TSV parsing error: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        if (results.data.length === 0) {
          reject(new Error('No data found in TSV file.'));
          return;
        }
        
        const headers = results.meta.fields || [];
        resolve({
          data: results.data,
          headers,
          fileName: '',
          fileType: 'tsv'
        });
      },
      error: (error) => {
        reject(new Error(`TSV parsing error: ${error.message}`));
      }
    });
  });
};

export const parseExcelFile = (fileBuffer: ArrayBuffer): Promise<ParsedFileResult> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      
      if (!firstSheetName) {
        reject(new Error('No sheets found in Excel file.'));
        return;
      }
      
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        reject(new Error('No data found in Excel file.'));
        return;
      }
      
      // First row as headers
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      // Convert rows to objects
      const data = dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
      
      resolve({
        data,
        headers,
        fileName: '',
        fileType: 'excel'
      });
    } catch (error: any) {
      reject(new Error(`Excel parsing error: ${error.message}`));
    }
  });
};

export const parseJSONFile = (fileContent: string): Promise<ParsedFileResult> => {
  return new Promise((resolve, reject) => {
    try {
      const jsonData = JSON.parse(fileContent);
      
      if (!Array.isArray(jsonData)) {
        reject(new Error('JSON file must contain an array of objects.'));
        return;
      }
      
      if (jsonData.length === 0) {
        reject(new Error('No data found in JSON file.'));
        return;
      }
      
      // Extract headers from first object
      const headers = Object.keys(jsonData[0] || {});
      
      resolve({
        data: jsonData,
        headers,
        fileName: '',
        fileType: 'json'
      });
    } catch (error: any) {
      reject(new Error(`JSON parsing error: ${error.message}`));
    }
  });
};

export const parseFile = async (file: File): Promise<ParsedFileResult> => {
  const fileName = file.name;
  const fileType = file.type;
  
  if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
    const content = await file.text();
    const result = await parseCSVFile(content);
    return { ...result, fileName, fileType: 'csv' };
  }
  
  if (fileType === 'text/tab-separated-values' || fileName.endsWith('.tsv')) {
    const content = await file.text();
    const result = await parseTSVFile(content);
    return { ...result, fileName, fileType: 'tsv' };
  }
  
  if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const result = await parseExcelFile(buffer);
    return { ...result, fileName, fileType: 'excel' };
  }
  
  if (fileType === 'application/json' || fileName.endsWith('.json')) {
    const content = await file.text();
    const result = await parseJSONFile(content);
    return { ...result, fileName, fileType: 'json' };
  }
  
  throw new Error('Unsupported file type. Please upload CSV, TSV, Excel, or JSON files.');
};
