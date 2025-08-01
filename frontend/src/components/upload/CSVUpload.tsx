'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileUpload, UploadedFile } from './FileUpload';
import {
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CsvNftData } from '@/types/nft';
import { cn } from '@/lib/utils';

interface CSVUploadProps {
  onDataParsed: (data: CsvNftData[]) => void;
  onError: (error: string) => void;
  className?: string;
}

interface ParsedCSVData {
  data: CsvNftData[];
  errors: string[];
  warnings: string[];
}

const REQUIRED_COLUMNS = ['name', 'description', 'image'];
const OPTIONAL_COLUMNS = ['external_url', 'animation_url', 'attributes'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export const CSVUpload: React.FC<CSVUploadProps> = ({
  onDataParsed,
  onError,
  className,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateCSVData = (data: Record<string, unknown>[]): ParsedCSVData => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: CsvNftData[] = [];

    if (data.length === 0) {
      errors.push('CSV file is empty');
      return { data: [], errors, warnings };
    }

    // Check for required columns
    const headers = Object.keys(data[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return { data: [], errors, warnings };
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const nftData: Partial<CsvNftData> = {};

      // Validate required fields
      for (const column of REQUIRED_COLUMNS) {
        const value = row[column]?.toString().trim();
        if (!value) {
          errors.push(`Row ${rowNumber}: Missing required field '${column}'`);
          return;
        }
        (nftData as Record<string, unknown>)[column] = value;
      }

      // Process optional fields
      if (row.external_url) {
        nftData.external_url = row.external_url.toString().trim();
      }

      if (row.animation_url) {
        nftData.animation_url = row.animation_url.toString().trim();
      }

      // Process attributes
      if (row.attributes) {
        try {
          const attributesStr = row.attributes.toString().trim();
          if (attributesStr) {
            // Try to parse as JSON first
            try {
              nftData.attributes = JSON.parse(attributesStr);
            } catch {
              // If not JSON, try to parse as key:value pairs separated by semicolons
              const pairs = attributesStr.split(';');
              const attributes: Array<{ trait_type: string; value: string }> = [];
              
              for (const pair of pairs) {
                const [trait_type, value] = pair.split(':').map((s: string) => s.trim());
                if (trait_type && value) {
                  attributes.push({ trait_type, value });
                } else {
                  warnings.push(`Row ${rowNumber}: Invalid attribute format '${pair}'. Use 'trait:value' or JSON format.`);
                }
              }
              
              if (attributes.length > 0) {
                const attributesRecord: Record<string, string | number> = {};
                attributes.forEach(attr => {
                  attributesRecord[attr.trait_type] = attr.value;
                });
                nftData.attributes = attributesRecord;
              }
            }
          }
        } catch (error) {
          warnings.push(`Row ${rowNumber}: Could not parse attributes. Using empty attributes.`);
        }
      }

      // Validate URLs
      const urlFields = ['image', 'external_url', 'animation_url'] as const;
      for (const field of urlFields) {
        const url = nftData[field];
        if (url && !isValidUrl(url)) {
          warnings.push(`Row ${rowNumber}: '${field}' does not appear to be a valid URL`);
        }
      }

      validData.push(nftData as CsvNftData);
    });

    return { data: validData, errors, warnings };
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const file = files[0]; // Only handle first file for CSV
    if (!file) return;

    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadedFile = {
      file,
      id: fileId,
      status: 'uploading',
      progress: 0,
    };

    setUploadedFiles([newFile]);
    setIsProcessing(true);
    setParsedData(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 100);

      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          clearInterval(progressInterval);
          
          if (results.errors.length > 0) {
            const errorMessage = results.errors.map(e => e.message).join(', ');
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'error', error: errorMessage }
                  : f
              )
            );
            onError(`CSV parsing error: ${errorMessage}`);
            setIsProcessing(false);
            return;
          }

          // Validate data
          const validatedData = validateCSVData(results.data);
          
          if (validatedData.errors.length > 0) {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'error', error: validatedData.errors.join(', ') }
                  : f
              )
            );
            onError(validatedData.errors.join(', '));
            setIsProcessing(false);
            return;
          }

          // Success
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'success', progress: 100 }
                : f
            )
          );
          
          setParsedData(validatedData);
          onDataParsed(validatedData.data);
          setIsProcessing(false);
        },
        error: (error) => {
          clearInterval(progressInterval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'error', error: error.message }
                : f
            )
          );
          onError(`CSV parsing error: ${error.message}`);
          setIsProcessing(false);
        }
      });
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: 'Failed to process file' }
            : f
        )
      );
      onError('Failed to process CSV file');
      setIsProcessing(false);
    }
  }, [onDataParsed, onError]);

  const handleFileRemove = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setParsedData(null);
  }, []);

  const downloadTemplate = () => {
    const templateData = [
      {
        name: 'Example NFT 1',
        description: 'This is an example NFT description',
        image: 'https://example.com/image1.png',
        external_url: 'https://example.com/nft1',
        animation_url: '',
        attributes: 'Background:Blue;Rarity:Common;Level:1'
      },
      {
        name: 'Example NFT 2',
        description: 'Another example NFT with JSON attributes',
        image: 'https://example.com/image2.png',
        external_url: '',
        animation_url: 'https://example.com/animation2.mp4',
        attributes: '[{"trait_type":"Background","value":"Red"},{"trait_type":"Rarity","value":"Rare"}]'
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nft_metadata_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV Upload Instructions
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing NFT metadata. Make sure your CSV includes the required columns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_COLUMNS.map(col => (
                  <Badge key={col} variant="default">{col}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <div className="flex flex-wrap gap-2">
                {OPTIONAL_COLUMNS.map(col => (
                  <Badge key={col} variant="secondary">{col}</Badge>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>attributes</strong> can be JSON format or semicolon-separated pairs (trait:value;trait:value)</p>
              <p>• All image and URL fields should be valid HTTP/HTTPS URLs</p>
              <p>• Maximum file size: 10MB</p>
            </div>
            
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        onFileRemove={handleFileRemove}
        uploadedFiles={uploadedFiles}
        acceptedFileTypes={{ 'text/csv': ['.csv'] }}
        maxFiles={1}
        multiple={false}
        disabled={isProcessing}
      />

      {/* Validation Results */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Validation Results
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <><EyeOff className="h-4 w-4 mr-2" />Hide Preview</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" />Show Preview</>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {parsedData.data.length}
                  </div>
                  <div className="text-sm text-green-700">Valid NFTs</div>
                </div>
                
                {parsedData.warnings.length > 0 && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {parsedData.warnings.length}
                    </div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {parsedData.warnings.length > 0 && (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {parsedData.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview */}
              {showPreview && parsedData.data.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Data Preview (First 5 rows)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Attributes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.data.slice(0, 5).map((nft, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{nft.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{nft.description}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              <a 
                                href={nft.image} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {nft.image}
                              </a>
                            </TableCell>
                            <TableCell>
                              {nft.attributes ? (
                                <Badge variant="secondary">
                                  {Array.isArray(nft.attributes) ? nft.attributes.length : 0} traits
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedData.data.length > 5 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ... and {parsedData.data.length - 5} more rows
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CSVUpload;