import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadResult {
  success: boolean;
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8081/api/files';
  
  constructor(private http: HttpClient) {}

  // Upload single file with progress tracking
  uploadFile(file: File, folder: string = 'receipts'): Observable<HttpEvent<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return this.http.post<UploadResult>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  // Upload multiple files
  uploadFiles(files: File[], folder: string = 'receipts'): Observable<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    formData.append('folder', folder);
    
    return this.http.post<UploadResult[]>(`${this.baseUrl}/upload-multiple`, formData);
  }

  // Delete uploaded file
  deleteFile(fileId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${fileId}`);
  }

  // Get file info
  getFileInfo(fileId: string): Observable<UploadResult> {
    return this.http.get<UploadResult>(`${this.baseUrl}/${fileId}`);
  }

  // Get file download URL
  getFileUrl(fileId: string): string {
    return `${this.baseUrl}/download/${fileId}`;
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, GIF, and PDF files are allowed' };
    }

    return { valid: true };
  }

  // Extract file metadata
  getFileMetadata(file: File): { name: string; size: string; type: string } {
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type.split('/')[1]?.toUpperCase() || 'Unknown'
    };
  }
}
