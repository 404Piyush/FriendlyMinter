'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateCollectionData } from '@/types/collection';
import { Loader2, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  maxNfts: z.number().min(1, 'Must be at least 1').max(1000000, 'Too many NFTs'),
  maxDepth: z.number().min(3, 'Minimum depth is 3').max(30, 'Maximum depth is 30'),
  maxBufferSize: z.number().min(8, 'Minimum buffer size is 8').max(2048, 'Maximum buffer size is 2048'),
  canopyDepth: z.number().min(0, 'Minimum canopy depth is 0').max(17, 'Maximum canopy depth is 17'),
  royaltyBasisPoints: z.number().min(0, 'Minimum royalty is 0%').max(10000, 'Maximum royalty is 100%'),
  creatorAddress: z.string().optional(),
});

type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

interface CreateCollectionFormProps {
  onSubmit: (data: CreateCollectionData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateCollectionForm: React.FC<CreateCollectionFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      maxDepth: 14,
      maxBufferSize: 64,
      canopyDepth: 0,
      royaltyBasisPoints: 500, // 5%
    },
  });

  const maxNfts = watch('maxNfts');
  const maxDepth = watch('maxDepth');
  const maxBufferSize = watch('maxBufferSize');

  // Calculate recommended values based on maxNfts
  React.useEffect(() => {
    if (maxNfts) {
      const recommendedDepth = Math.ceil(Math.log2(maxNfts));
      const recommendedBufferSize = Math.min(64, Math.max(8, Math.ceil(maxNfts / 100)));
      
      if (recommendedDepth >= 3 && recommendedDepth <= 30) {
        setValue('maxDepth', recommendedDepth);
      }
      if (recommendedBufferSize >= 8 && recommendedBufferSize <= 2048) {
        setValue('maxBufferSize', recommendedBufferSize);
      }
    }
  }, [maxNfts, setValue]);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFormSubmit = async (data: CreateCollectionFormData) => {
    const collectionData: CreateCollectionData = {
      ...data,
      image: imageFile || undefined,
    };
    await onSubmit(collectionData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Collection</CardTitle>
        <CardDescription>
          Create a new cNFT collection with optimized Merkle tree configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My Awesome Collection"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  {...register('symbol')}
                  placeholder="MAC"
                  className="uppercase"
                />
                {errors.symbol && (
                  <p className="text-sm text-destructive">{errors.symbol.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your collection..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Collection Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Collection Image</h3>
            
            {imagePreview ? (
              <div className="relative w-32 h-32">
                <img
                  src={imagePreview}
                  alt="Collection preview"
                  className="w-full h-full object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag & drop an image here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Merkle Tree Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Merkle Tree Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxNfts">Maximum NFTs</Label>
                <Input
                  id="maxNfts"
                  type="number"
                  {...register('maxNfts', { valueAsNumber: true })}
                  placeholder="1000"
                />
                {errors.maxNfts && (
                  <p className="text-sm text-destructive">{errors.maxNfts.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxDepth">Tree Depth</Label>
                <Input
                  id="maxDepth"
                  type="number"
                  {...register('maxDepth', { valueAsNumber: true })}
                  min={3}
                  max={30}
                />
                {errors.maxDepth && (
                  <p className="text-sm text-destructive">{errors.maxDepth.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: {maxNfts ? Math.ceil(Math.log2(maxNfts)) : 'Enter max NFTs first'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxBufferSize">Buffer Size</Label>
                <Input
                  id="maxBufferSize"
                  type="number"
                  {...register('maxBufferSize', { valueAsNumber: true })}
                  min={8}
                  max={2048}
                />
                {errors.maxBufferSize && (
                  <p className="text-sm text-destructive">{errors.maxBufferSize.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="canopyDepth">Canopy Depth</Label>
                <Input
                  id="canopyDepth"
                  type="number"
                  {...register('canopyDepth', { valueAsNumber: true })}
                  min={0}
                  max={17}
                />
                {errors.canopyDepth && (
                  <p className="text-sm text-destructive">{errors.canopyDepth.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Higher values reduce proof size but increase cost
                </p>
              </div>
            </div>
          </div>

          {/* Royalty Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Royalty Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="royaltyBasisPoints">Royalty Percentage</Label>
                <Input
                  id="royaltyBasisPoints"
                  type="number"
                  {...register('royaltyBasisPoints', { valueAsNumber: true })}
                  min={0}
                  max={10000}
                  step={100}
                />
                {errors.royaltyBasisPoints && (
                  <p className="text-sm text-destructive">{errors.royaltyBasisPoints.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {watch('royaltyBasisPoints') ? (watch('royaltyBasisPoints') / 100).toFixed(1) : '0'}% royalty
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creatorAddress">Creator Address (Optional)</Label>
                <Input
                  id="creatorAddress"
                  {...register('creatorAddress')}
                  placeholder="Creator wallet address"
                />
                {errors.creatorAddress && (
                  <p className="text-sm text-destructive">{errors.creatorAddress.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Collection...
              </>
            ) : (
              'Create Collection'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCollectionForm;