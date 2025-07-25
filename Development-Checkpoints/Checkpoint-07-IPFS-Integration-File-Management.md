# Checkpoint 07: IPFS Integration & File Management

## Objective
Implement comprehensive IPFS integration for decentralized storage of NFT assets and metadata, including file upload, pinning, and retrieval systems.

## Prerequisites
- Checkpoint 06 completed (Solana Integration)
- IPFS pinning service account (Pinata/NFT.Storage)
- Understanding of IPFS concepts

## Core Dependencies
```bash
# IPFS Integration
npm install @pinata/sdk
npm install nft.storage
npm install ipfs-http-client

# File Processing
npm install multer
npm install sharp # Image processing
npm install file-type
npm install mime-types

# Utilities
npm install form-data
npm install axios
npm install crypto
```

## IPFS Service Configuration

### lib/ipfs/config.ts
```typescript
export const IPFS_CONFIG = {
  pinata: {
    apiKey: process.env.PINATA_API_KEY!,
    secretApiKey: process.env.PINATA_SECRET_API_KEY!,
    jwt: process.env.PINATA_JWT,
    baseUrl: 'https://api.pinata.cloud',
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs',
  },
  nftStorage: {
    apiKey: process.env.NFT_STORAGE_API_KEY!,
    baseUrl: 'https://api.nft.storage',
  },
  web3Storage: {
    apiKey: process.env.WEB3_STORAGE_API_KEY!,
    baseUrl: 'https://api.web3.storage',
  },
};

export const FILE_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  allowedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  imageQuality: {
    thumbnail: { width: 300, height: 300, quality: 80 },
    medium: { width: 800, height: 800, quality: 85 },
    original: { quality: 95 },
  },
};

export const METADATA_CONFIG = {
  schema: 'https://schema.metaplex.com/nft1.0.json',
  defaultAttributes: {
    seller_fee_basis_points: 0,
    primary_sale_happened: false,
    is_mutable: true,
  },
};
```

### lib/ipfs/pinata-client.ts
```typescript
import PinataSDK from '@pinata/sdk';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';
import { IPFS_CONFIG } from './config';

export interface PinataUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface PinataMetadata {
  name: string;
  keyvalues?: Record<string, string | number>;
}

export interface PinataOptions {
  cidVersion?: 0 | 1;
  wrapWithDirectory?: boolean;
  customPinPolicy?: {
    regions: Array<{
      id: string;
      desiredReplicationCount: number;
    }>;
  };
}

class PinataClient {
  private pinata: PinataSDK;
  private apiKey: string;
  private secretApiKey: string;
  private jwt?: string;

  constructor() {
    this.apiKey = IPFS_CONFIG.pinata.apiKey;
    this.secretApiKey = IPFS_CONFIG.pinata.secretApiKey;
    this.jwt = IPFS_CONFIG.pinata.jwt;
    
    this.pinata = new PinataSDK(this.apiKey, this.secretApiKey);
  }

  /**
   * Test connection to Pinata
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pinata.testAuthentication();
      return true;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }

  /**
   * Upload a single file to IPFS via Pinata
   */
  async uploadFile(
    file: Buffer | Readable,
    metadata: PinataMetadata,
    options?: PinataOptions
  ): Promise<PinataUploadResult> {
    try {
      const result = await this.pinata.pinFileToIPFS(file, {
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: options?.cidVersion || 1,
          wrapWithDirectory: options?.wrapWithDirectory || false,
          customPinPolicy: options?.customPinPolicy,
        },
      });

      return result;
    } catch (error) {
      console.error('Pinata file upload failed:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload multiple files as a directory
   */
  async uploadDirectory(
    files: Array<{
      path: string;
      content: Buffer | Readable;
    }>,
    metadata: PinataMetadata,
    options?: PinataOptions
  ): Promise<PinataUploadResult> {
    try {
      // Create form data for directory upload
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append('file', file.content, {
          filepath: file.path,
          contentType: 'application/octet-stream',
        });
      });

      // Add metadata
      formData.append('pinataMetadata', JSON.stringify(metadata));
      
      if (options) {
        formData.append('pinataOptions', JSON.stringify({
          cidVersion: options.cidVersion || 1,
          wrapWithDirectory: true,
          customPinPolicy: options.customPinPolicy,
        }));
      }

      const response = await axios.post(
        `${IPFS_CONFIG.pinata.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretApiKey,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Pinata directory upload failed:', error);
      throw new Error(`Failed to upload directory to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(
    jsonData: any,
    metadata: PinataMetadata,
    options?: PinataOptions
  ): Promise<PinataUploadResult> {
    try {
      const result = await this.pinata.pinJSONToIPFS(jsonData, {
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: options?.cidVersion || 1,
          customPinPolicy: options?.customPinPolicy,
        },
      });

      return result;
    } catch (error) {
      console.error('Pinata JSON upload failed:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  /**
   * Get file from IPFS
   */
  async getFile(ipfsHash: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${IPFS_CONFIG.pinata.gatewayUrl}/${ipfsHash}`,
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Failed to get file from IPFS:', error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }

  /**
   * Get JSON data from IPFS
   */
  async getJSON(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(
        `${IPFS_CONFIG.pinata.gatewayUrl}/${ipfsHash}`,
        { responseType: 'json' }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get JSON from IPFS:', error);
      throw new Error(`Failed to retrieve JSON from IPFS: ${error.message}`);
    }
  }

  /**
   * Unpin file from IPFS
   */
  async unpinFile(ipfsHash: string): Promise<void> {
    try {
      await this.pinata.unpin(ipfsHash);
    } catch (error) {
      console.error('Failed to unpin file:', error);
      throw new Error(`Failed to unpin file: ${error.message}`);
    }
  }

  /**
   * List pinned files
   */
  async listPinnedFiles(filters?: {
    status?: 'pinned' | 'unpinned';
    pageLimit?: number;
    pageOffset?: number;
    metadata?: Record<string, string>;
  }) {
    try {
      const result = await this.pinata.pinList(filters);
      return result;
    } catch (error) {
      console.error('Failed to list pinned files:', error);
      throw new Error(`Failed to list pinned files: ${error.message}`);
    }
  }

  /**
   * Get pinning analytics
   */
  async getPinningAnalytics() {
    try {
      const response = await axios.get(
        `${IPFS_CONFIG.pinata.baseUrl}/data/userPinnedDataTotal`,
        {
          headers: {
            pinata_api_key: this.apiKey,
            pinata_secret_api_key: this.secretApiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get pinning analytics:', error);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

export default PinataClient;
```

## File Processing Service

### lib/ipfs/file-processor.ts
```typescript
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';
import { FILE_CONFIG } from './config';

export interface ProcessedFile {
  originalBuffer: Buffer;
  processedBuffer?: Buffer;
  thumbnail?: Buffer;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
    dimensions?: { width: number; height: number };
    hash: string;
    processedSize?: number;
  };
}

export interface ImageProcessingOptions {
  createThumbnail?: boolean;
  resize?: { width?: number; height?: number };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

class FileProcessor {
  /**
   * Process uploaded file
   */
  async processFile(
    buffer: Buffer,
    originalName: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedFile> {
    try {
      // Validate file
      await this.validateFile(buffer, originalName);
      
      // Get file type
      const fileType = await fileTypeFromBuffer(buffer);
      if (!fileType) {
        throw new Error('Unable to determine file type');
      }

      // Generate file hash
      const hash = this.generateFileHash(buffer);

      const result: ProcessedFile = {
        originalBuffer: buffer,
        metadata: {
          originalName,
          mimeType: fileType.mime,
          size: buffer.length,
          hash,
        },
      };

      // Process images
      if (this.isImageFile(fileType.mime)) {
        const imageResult = await this.processImage(buffer, options);
        result.processedBuffer = imageResult.processedBuffer;
        result.thumbnail = imageResult.thumbnail;
        result.metadata.dimensions = imageResult.dimensions;
        result.metadata.processedSize = imageResult.processedBuffer?.length;
      }

      return result;
    } catch (error) {
      console.error('File processing failed:', error);
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  /**
   * Process image file
   */
  private async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions
  ): Promise<{
    processedBuffer?: Buffer;
    thumbnail?: Buffer;
    dimensions: { width: number; height: number };
  }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    const dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    let processedBuffer: Buffer | undefined;
    let thumbnail: Buffer | undefined;

    // Create processed version if options specified
    if (options.resize || options.quality || options.format) {
      let processedImage = image.clone();

      if (options.resize) {
        processedImage = processedImage.resize(
          options.resize.width,
          options.resize.height,
          { fit: 'inside', withoutEnlargement: true }
        );
      }

      if (options.format) {
        switch (options.format) {
          case 'jpeg':
            processedImage = processedImage.jpeg({ quality: options.quality || 85 });
            break;
          case 'png':
            processedImage = processedImage.png({ quality: options.quality || 85 });
            break;
          case 'webp':
            processedImage = processedImage.webp({ quality: options.quality || 85 });
            break;
        }
      }

      processedBuffer = await processedImage.toBuffer();
    }

    // Create thumbnail if requested
    if (options.createThumbnail) {
      thumbnail = await image
        .clone()
        .resize(
          FILE_CONFIG.imageQuality.thumbnail.width,
          FILE_CONFIG.imageQuality.thumbnail.height,
          { fit: 'cover' }
        )
        .jpeg({ quality: FILE_CONFIG.imageQuality.thumbnail.quality })
        .toBuffer();
    }

    return {
      processedBuffer,
      thumbnail,
      dimensions,
    };
  }

  /**
   * Validate uploaded file
   */
  private async validateFile(buffer: Buffer, originalName: string): Promise<void> {
    // Check file size
    if (buffer.length > FILE_CONFIG.maxFileSize) {
      throw new Error(
        `File too large. Maximum size: ${FILE_CONFIG.maxFileSize / (1024 * 1024)}MB`
      );
    }

    // Check file type
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error('Invalid file type');
    }

    const allowedTypes = [
      ...FILE_CONFIG.allowedImageTypes,
      ...FILE_CONFIG.allowedVideoTypes,
      ...FILE_CONFIG.allowedAudioTypes,
    ];

    if (!allowedTypes.includes(fileType.mime)) {
      throw new Error(`File type not allowed: ${fileType.mime}`);
    }

    // Additional security checks
    await this.performSecurityChecks(buffer, fileType.mime);
  }

  /**
   * Perform security checks on file
   */
  private async performSecurityChecks(buffer: Buffer, mimeType: string): Promise<void> {
    // Check for malicious content in images
    if (this.isImageFile(mimeType)) {
      try {
        // Use sharp to validate image integrity
        const image = sharp(buffer);
        await image.metadata();
        
        // Additional check: ensure image can be processed
        await image.resize(100, 100).toBuffer();
      } catch (error) {
        throw new Error('Invalid or corrupted image file');
      }
    }

    // Check for suspicious file signatures
    const signature = buffer.slice(0, 16).toString('hex');
    const suspiciousSignatures = [
      '4d5a', // PE executable
      '7f454c46', // ELF executable
      'cafebabe', // Java class file
    ];

    if (suspiciousSignatures.some(sig => signature.startsWith(sig))) {
      throw new Error('Suspicious file content detected');
    }
  }

  /**
   * Generate file hash
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if file is an image
   */
  private isImageFile(mimeType: string): boolean {
    return FILE_CONFIG.allowedImageTypes.includes(mimeType);
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName: string, hash: string): string {
    const extension = originalName.split('.').pop() || '';
    const timestamp = Date.now();
    const shortHash = hash.slice(0, 8);
    
    return `${timestamp}_${shortHash}.${extension}`;
  }

  /**
   * Batch process multiple files
   */
  async processFiles(
    files: Array<{ buffer: Buffer; originalName: string }>,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    
    for (const file of files) {
      try {
        const processed = await this.processFile(
          file.buffer,
          file.originalName,
          options
        );
        results.push(processed);
      } catch (error) {
        console.error(`Failed to process file ${file.originalName}:`, error);
        throw error;
      }
    }
    
    return results;
  }
}

export default FileProcessor;
```

## Metadata Generator

### lib/ipfs/metadata-generator.ts
```typescript
import { METADATA_CONFIG } from './config';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'boost_number' | 'boost_percentage' | 'date';
}

export interface NFTCreator {
  address: string;
  verified: boolean;
  share: number;
}

export interface NFTCollection {
  name: string;
  family: string;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  attributes: NFTAttribute[];
  properties: {
    files: Array<{
      uri: string;
      type: string;
      cdn?: boolean;
    }>;
    category: 'image' | 'video' | 'audio' | 'vr' | 'html';
    creators: NFTCreator[];
  };
  seller_fee_basis_points: number;
  primary_sale_happened: boolean;
  is_mutable: boolean;
  collection?: NFTCollection;
}

export interface MetadataGenerationOptions {
  collectionName?: string;
  collectionFamily?: string;
  creators?: NFTCreator[];
  sellerFeeBasisPoints?: number;
  externalUrl?: string;
  animationUrl?: string;
}

class MetadataGenerator {
  /**
   * Generate NFT metadata
   */
  generateMetadata(
    name: string,
    symbol: string,
    description: string,
    imageUri: string,
    attributes: NFTAttribute[],
    options: MetadataGenerationOptions = {}
  ): NFTMetadata {
    const metadata: NFTMetadata = {
      name,
      symbol,
      description,
      image: imageUri,
      attributes,
      properties: {
        files: [
          {
            uri: imageUri,
            type: this.getFileTypeFromUri(imageUri),
          },
        ],
        category: this.getCategoryFromUri(imageUri),
        creators: options.creators || [],
      },
      seller_fee_basis_points: options.sellerFeeBasisPoints || METADATA_CONFIG.defaultAttributes.seller_fee_basis_points,
      primary_sale_happened: METADATA_CONFIG.defaultAttributes.primary_sale_happened,
      is_mutable: METADATA_CONFIG.defaultAttributes.is_mutable,
    };

    // Add optional fields
    if (options.externalUrl) {
      metadata.external_url = options.externalUrl;
    }

    if (options.animationUrl) {
      metadata.animation_url = options.animationUrl;
      metadata.properties.files.push({
        uri: options.animationUrl,
        type: this.getFileTypeFromUri(options.animationUrl),
      });
    }

    if (options.collectionName && options.collectionFamily) {
      metadata.collection = {
        name: options.collectionName,
        family: options.collectionFamily,
      };
    }

    return metadata;
  }

  /**
   * Generate metadata from CSV row
   */
  generateMetadataFromCSV(
    csvRow: Record<string, any>,
    imageUri: string,
    symbol: string,
    options: MetadataGenerationOptions = {}
  ): NFTMetadata {
    const name = csvRow.name || 'Unnamed NFT';
    const description = csvRow.description || '';
    
    // Extract attributes from CSV (exclude standard fields)
    const standardFields = ['name', 'description', 'image', 'image_filename', 'recipient_wallet'];
    const attributes: NFTAttribute[] = Object.keys(csvRow)
      .filter(key => !standardFields.includes(key.toLowerCase()))
      .map(key => ({
        trait_type: this.formatTraitType(key),
        value: csvRow[key],
      }));

    return this.generateMetadata(
      name,
      symbol,
      description,
      imageUri,
      attributes,
      options
    );
  }

  /**
   * Generate collection metadata
   */
  generateCollectionMetadata(
    name: string,
    symbol: string,
    description: string,
    imageUri: string,
    options: {
      externalUrl?: string;
      creators?: NFTCreator[];
      sellerFeeBasisPoints?: number;
    } = {}
  ): Omit<NFTMetadata, 'attributes'> {
    return {
      name,
      symbol,
      description,
      image: imageUri,
      external_url: options.externalUrl,
      properties: {
        files: [
          {
            uri: imageUri,
            type: this.getFileTypeFromUri(imageUri),
          },
        ],
        category: this.getCategoryFromUri(imageUri),
        creators: options.creators || [],
      },
      seller_fee_basis_points: options.sellerFeeBasisPoints || 0,
      primary_sale_happened: false,
      is_mutable: true,
    };
  }

  /**
   * Validate metadata
   */
  validateMetadata(metadata: NFTMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!metadata.symbol || metadata.symbol.trim().length === 0) {
      errors.push('Symbol is required');
    }

    if (!metadata.image || !this.isValidUri(metadata.image)) {
      errors.push('Valid image URI is required');
    }

    // Validate attributes
    if (metadata.attributes) {
      metadata.attributes.forEach((attr, index) => {
        if (!attr.trait_type || attr.trait_type.trim().length === 0) {
          errors.push(`Attribute ${index + 1}: trait_type is required`);
        }
        if (attr.value === undefined || attr.value === null) {
          errors.push(`Attribute ${index + 1}: value is required`);
        }
      });
    }

    // Validate creators
    if (metadata.properties.creators) {
      const totalShare = metadata.properties.creators.reduce(
        (sum, creator) => sum + creator.share,
        0
      );
      if (totalShare > 100) {
        errors.push('Total creator shares cannot exceed 100%');
      }
    }

    // Validate seller fee
    if (metadata.seller_fee_basis_points < 0 || metadata.seller_fee_basis_points > 10000) {
      errors.push('Seller fee basis points must be between 0 and 10000');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format trait type for display
   */
  private formatTraitType(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Get file type from URI
   */
  private getFileTypeFromUri(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'mp3':
        return 'audio/mp3';
      case 'wav':
        return 'audio/wav';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get category from URI
   */
  private getCategoryFromUri(uri: string): 'image' | 'video' | 'audio' | 'vr' | 'html' {
    const fileType = this.getFileTypeFromUri(uri);
    
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    
    return 'image'; // Default to image
  }

  /**
   * Validate URI format
   */
  private isValidUri(uri: string): boolean {
    try {
      new URL(uri);
      return true;
    } catch {
      // Check for IPFS URI format
      return uri.startsWith('ipfs://') && uri.length > 7;
    }
  }

  /**
   * Generate metadata batch for multiple NFTs
   */
  generateMetadataBatch(
    csvData: Record<string, any>[],
    imageCids: Record<string, string>,
    symbol: string,
    options: MetadataGenerationOptions = {}
  ): NFTMetadata[] {
    return csvData.map((row, index) => {
      const imageFilename = row.image_filename || row.image || `${index}.png`;
      const imageCid = imageCids[imageFilename];
      
      if (!imageCid) {
        throw new Error(`Image CID not found for ${imageFilename}`);
      }
      
      const imageUri = `ipfs://${imageCid}`;
      
      return this.generateMetadataFromCSV(row, imageUri, symbol, options);
    });
  }
}

export default MetadataGenerator;
```

## IPFS Service Integration

### lib/ipfs/ipfs-service.ts
```typescript
import PinataClient, { PinataUploadResult } from './pinata-client';
import FileProcessor, { ProcessedFile, ImageProcessingOptions } from './file-processor';
import MetadataGenerator, { NFTMetadata, MetadataGenerationOptions } from './metadata-generator';

export interface UploadFileResult {
  ipfsHash: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailHash?: string;
}

export interface UploadBatchResult {
  directoryHash: string;
  files: UploadFileResult[];
  totalSize: number;
}

export interface UploadMetadataResult {
  metadataHash: string;
  individualHashes: string[];
  totalMetadata: number;
}

class IPFSService {
  private pinataClient: PinataClient;
  private fileProcessor: FileProcessor;
  private metadataGenerator: MetadataGenerator;

  constructor() {
    this.pinataClient = new PinataClient();
    this.fileProcessor = new FileProcessor();
    this.metadataGenerator = new MetadataGenerator();
  }

  /**
   * Initialize service and test connections
   */
  async initialize(): Promise<void> {
    const isConnected = await this.pinataClient.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to IPFS pinning service');
    }
  }

  /**
   * Upload a single file to IPFS
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options: ImageProcessingOptions & {
      collectionId?: string;
      userId?: string;
    } = {}
  ): Promise<UploadFileResult> {
    try {
      // Process file
      const processedFile = await this.fileProcessor.processFile(
        buffer,
        originalName,
        options
      );

      // Generate unique filename
      const filename = this.fileProcessor.generateUniqueFilename(
        originalName,
        processedFile.metadata.hash
      );

      // Upload main file
      const uploadResult = await this.pinataClient.uploadFile(
        processedFile.processedBuffer || processedFile.originalBuffer,
        {
          name: filename,
          keyvalues: {
            originalName,
            fileHash: processedFile.metadata.hash,
            collectionId: options.collectionId || '',
            userId: options.userId || '',
            uploadedAt: Date.now().toString(),
          },
        }
      );

      const result: UploadFileResult = {
        ipfsHash: uploadResult.IpfsHash,
        filename,
        size: processedFile.metadata.processedSize || processedFile.metadata.size,
        mimeType: processedFile.metadata.mimeType,
      };

      // Upload thumbnail if available
      if (processedFile.thumbnail) {
        const thumbnailResult = await this.pinataClient.uploadFile(
          processedFile.thumbnail,
          {
            name: `thumb_${filename}`,
            keyvalues: {
              originalName: `thumb_${originalName}`,
              fileHash: processedFile.metadata.hash,
              type: 'thumbnail',
              collectionId: options.collectionId || '',
              userId: options.userId || '',
            },
          }
        );
        result.thumbnailHash = thumbnailResult.IpfsHash;
      }

      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files as a batch
   */
  async uploadFileBatch(
    files: Array<{ buffer: Buffer; originalName: string }>,
    options: ImageProcessingOptions & {
      collectionId?: string;
      userId?: string;
    } = {}
  ): Promise<UploadBatchResult> {
    try {
      // Process all files
      const processedFiles = await this.fileProcessor.processFiles(
        files,
        options
      );

      // Prepare files for directory upload
      const directoryFiles = processedFiles.map((processed, index) => {
        const filename = this.fileProcessor.generateUniqueFilename(
          files[index].originalName,
          processed.metadata.hash
        );
        
        return {
          path: filename,
          content: processed.processedBuffer || processed.originalBuffer,
        };
      });

      // Upload as directory
      const directoryResult = await this.pinataClient.uploadDirectory(
        directoryFiles,
        {
          name: `batch_${Date.now()}`,
          keyvalues: {
            type: 'file_batch',
            fileCount: files.length.toString(),
            collectionId: options.collectionId || '',
            userId: options.userId || '',
            uploadedAt: Date.now().toString(),
          },
        }
      );

      // Create result
      const uploadResults: UploadFileResult[] = processedFiles.map((processed, index) => {
        const filename = this.fileProcessor.generateUniqueFilename(
          files[index].originalName,
          processed.metadata.hash
        );
        
        return {
          ipfsHash: `${directoryResult.IpfsHash}/${filename}`,
          filename,
          size: processed.metadata.processedSize || processed.metadata.size,
          mimeType: processed.metadata.mimeType,
        };
      });

      const totalSize = processedFiles.reduce(
        (sum, file) => sum + (file.metadata.processedSize || file.metadata.size),
        0
      );

      return {
        directoryHash: directoryResult.IpfsHash,
        files: uploadResults,
        totalSize,
      };
    } catch (error) {
      console.error('Batch upload failed:', error);
      throw new Error(`Failed to upload file batch: ${error.message}`);
    }
  }

  /**
   * Upload collection image
   */
  async uploadCollectionImage(
    buffer: Buffer,
    collectionName: string,
    options: {
      collectionId: string;
      userId: string;
    }
  ): Promise<UploadFileResult> {
    return this.uploadFile(
      buffer,
      `${collectionName}_collection.png`,
      {
        createThumbnail: true,
        quality: 90,
        ...options,
      }
    );
  }

  /**
   * Generate and upload metadata
   */
  async uploadMetadata(
    csvData: Record<string, any>[],
    imageCids: Record<string, string>,
    symbol: string,
    options: MetadataGenerationOptions & {
      collectionId: string;
      userId: string;
    }
  ): Promise<UploadMetadataResult> {
    try {
      // Generate metadata for all NFTs
      const metadataArray = this.metadataGenerator.generateMetadataBatch(
        csvData,
        imageCids,
        symbol,
        options
      );

      // Validate all metadata
      const validationErrors: string[] = [];
      metadataArray.forEach((metadata, index) => {
        const validation = this.metadataGenerator.validateMetadata(metadata);
        if (!validation.valid) {
          validationErrors.push(`NFT ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(`Metadata validation failed: ${validationErrors.join('; ')}`);
      }

      // Upload individual metadata files
      const individualHashes: string[] = [];
      
      for (let i = 0; i < metadataArray.length; i++) {
        const metadata = metadataArray[i];
        const result = await this.pinataClient.uploadJSON(
          metadata,
          {
            name: `${i}.json`,
            keyvalues: {
              type: 'nft_metadata',
              nftIndex: i.toString(),
              collectionId: options.collectionId,
              userId: options.userId,
            },
          }
        );
        individualHashes.push(result.IpfsHash);
      }

      // Upload combined metadata file
      const combinedMetadata = metadataArray.reduce((acc, metadata, index) => {
        acc[index.toString()] = metadata;
        return acc;
      }, {} as Record<string, NFTMetadata>);

      const combinedResult = await this.pinataClient.uploadJSON(
        combinedMetadata,
        {
          name: `collection_metadata_${Date.now()}.json`,
          keyvalues: {
            type: 'collection_metadata',
            nftCount: metadataArray.length.toString(),
            collectionId: options.collectionId,
            userId: options.userId,
          },
        }
      );

      return {
        metadataHash: combinedResult.IpfsHash,
        individualHashes,
        totalMetadata: metadataArray.length,
      };
    } catch (error) {
      console.error('Metadata upload failed:', error);
      throw new Error(`Failed to upload metadata: ${error.message}`);
    }
  }

  /**
   * Upload collection metadata
   */
  async uploadCollectionMetadata(
    name: string,
    symbol: string,
    description: string,
    imageHash: string,
    options: {
      collectionId: string;
      userId: string;
      externalUrl?: string;
      creators?: Array<{ address: string; verified: boolean; share: number }>;
    }
  ): Promise<string> {
    try {
      const metadata = this.metadataGenerator.generateCollectionMetadata(
        name,
        symbol,
        description,
        `ipfs://${imageHash}`,
        {
          externalUrl: options.externalUrl,
          creators: options.creators,
        }
      );

      const result = await this.pinataClient.uploadJSON(
        metadata,
        {
          name: `${symbol}_collection_metadata.json`,
          keyvalues: {
            type: 'collection_metadata',
            collectionId: options.collectionId,
            userId: options.userId,
          },
        }
      );

      return result.IpfsHash;
    } catch (error) {
      console.error('Collection metadata upload failed:', error);
      throw new Error(`Failed to upload collection metadata: ${error.message}`);
    }
  }

  /**
   * Get file from IPFS
   */
  async getFile(ipfsHash: string): Promise<Buffer> {
    return this.pinataClient.getFile(ipfsHash);
  }

  /**
   * Get JSON data from IPFS
   */
  async getJSON(ipfsHash: string): Promise<any> {
    return this.pinataClient.getJSON(ipfsHash);
  }

  /**
   * Get service analytics
   */
  async getAnalytics() {
    return this.pinataClient.getPinningAnalytics();
  }

  /**
   * Clean up unused files
   */
  async cleanupUnusedFiles(collectionId: string): Promise<void> {
    try {
      const pinnedFiles = await this.pinataClient.listPinnedFiles({
        metadata: { collectionId },
      });

      // Logic to identify and unpin unused files
      // This would require checking against database records
      console.log(`Found ${pinnedFiles.count} pinned files for collection ${collectionId}`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw new Error(`Failed to cleanup files: ${error.message}`);
    }
  }
}

export default IPFSService;
```

## API Integration

### app/api/upload/files/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import IPFSService from '@/lib/ipfs/ipfs-service';
import { z } from 'zod';

const uploadSchema = z.object({
  collectionId: z.string().optional(),
  createThumbnail: z.boolean().default(true),
  quality: z.number().min(1).max(100).default(85),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const options = uploadSchema.parse({
      collectionId: formData.get('collectionId'),
      createThumbnail: formData.get('createThumbnail') === 'true',
      quality: parseInt(formData.get('quality') as string) || 85,
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const ipfsService = new IPFSService();
    await ipfsService.initialize();

    // Convert files to buffers
    const fileBuffers = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalName: file.name,
      }))
    );

    // Upload files
    const result = await ipfsService.uploadFileBatch(fileBuffers, {
      ...options,
      userId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
```

### app/api/upload/metadata/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import IPFSService from '@/lib/ipfs/ipfs-service';

const metadataUploadSchema = z.object({
  collectionId: z.string(),
  csvData: z.array(z.record(z.any())),
  imageCids: z.record(z.string()),
  symbol: z.string(),
  collectionName: z.string().optional(),
  collectionFamily: z.string().optional(),
  creators: z.array(z.object({
    address: z.string(),
    verified: z.boolean(),
    share: z.number(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = metadataUploadSchema.parse(body);

    const ipfsService = new IPFSService();
    await ipfsService.initialize();

    const result = await ipfsService.uploadMetadata(
      data.csvData,
      data.imageCids,
      data.symbol,
      {
        collectionName: data.collectionName,
        collectionFamily: data.collectionFamily,
        creators: data.creators,
        collectionId: data.collectionId,
        userId: session.user.id,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Metadata upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}
```

## Environment Configuration

### .env.example (Additional Variables)
```bash
# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
PINATA_JWT=your_pinata_jwt_token

# Alternative IPFS Services
NFT_STORAGE_API_KEY=your_nft_storage_api_key
WEB3_STORAGE_API_KEY=your_web3_storage_api_key

# File Processing
MAX_FILE_SIZE=52428800  # 50MB in bytes
IMAGE_QUALITY=85
CREATE_THUMBNAILS=true

# IPFS Gateway
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---
**Status**: ✅ IPFS Integration & File Management Complete
**Dependencies**: Checkpoint 06 completed
**Estimated Time**: 2-3 days
**Next**: Checkpoint 08 - Frontend Components & UI Implementation