'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileImage,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  acceptedFileTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const defaultAcceptedTypes = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'application/json': ['.json'],
  'text/csv': ['.csv'],
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  uploadedFiles,
  acceptedFileTypes = defaultAcceptedTypes,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUploadMore = uploadedFiles.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive || dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive || dragActive
                  ? 'Drop files here...'
                  : 'Upload Files'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag & drop files here, or click to select files
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Accepted formats: {Object.values(acceptedFileTypes).flat().join(', ')}
                </p>
                <p>Maximum file size: {formatFileSize(maxSize)}</p>
                <p>
                  {multiple
                    ? `Maximum ${maxFiles} files`
                    : 'Single file only'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upload Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <ul className="list-disc list-inside text-destructive ml-4">
                    {errors.map((error) => (
                      <li key={error.code}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
            <CardDescription>
              Track the upload progress of your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(uploadedFile.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onFileRemove(uploadedFile.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      <span className="capitalize">{uploadedFile.status}</span>
                    </div>

                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="h-1" />
                    )}

                    {/* Error Message */}
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <p className="text-xs text-destructive mt-1">
                        {uploadedFile.error}
                      </p>
                    )}

                    {/* Success URL */}
                    {uploadedFile.status === 'success' && uploadedFile.url && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;