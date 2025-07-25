'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  ExternalLink,
  Copy,
  Calendar,
  Hash,
  Users,
} from 'lucide-react';
import { Collection } from '@/types/collection';
import { cn } from '@/lib/utils';
import { getExplorerUrl } from '@/lib/solana';

interface CollectionCardProps {
  collection: Collection;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onUploadNfts?: (collection: Collection) => void;
  className?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onUploadNfts,
  className,
}) => {
  const handleCopyAddress = async () => {
    if (collection.merkleTreeAddress) {
      await navigator.clipboard.writeText(collection.merkleTreeAddress);
      // You might want to show a toast notification here
    }
  };

  const getStatusColor = (status: Collection['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'MINTING':
      case 'INITIALIZED':
        return 'bg-blue-500';
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Collection['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'MINTING':
        return 'Minting';
      case 'INITIALIZED':
        return 'Initialized';
      case 'DRAFT':
        return 'Draft';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={cn('group hover:shadow-lg transition-shadow duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Collection Image */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
              {collection.imageUrl ? (
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Hash className="h-6 w-6" />
                </div>
              )}
            </div>
            
            {/* Collection Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{collection.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {collection.symbol}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', getStatusColor(collection.status))} />
            {getStatusText(collection.status)}
          </Badge>
        </div>
        
        {/* Description */}
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {collection.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">NFTs:</span>
            <span className="font-medium">
              {collection.mintedCount || 0} / {collection.maxNfts}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {new Date(collection.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Merkle Tree Info */}
        {collection.merkleTreeAddress && (
          <div className="mt-3 p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Merkle Tree:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  asChild
                >
                  <a
                    href={getExplorerUrl(collection.merkleTreeAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            <p className="text-xs font-mono mt-1 truncate">
              {collection.merkleTreeAddress}
            </p>
          </div>
        )}
        
        {/* Tree Configuration */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-medium">{collection.maxDepth}</div>
            <div className="text-muted-foreground">Depth</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-medium">{collection.maxBufferSize}</div>
            <div className="text-muted-foreground">Buffer</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-medium">{collection.canopyDepth}</div>
            <div className="text-muted-foreground">Canopy</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex items-center justify-between">
        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/collections/${collection.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          
          {(collection.status === 'INITIALIZED' || collection.status === 'DRAFT') && onUploadNfts && (
            <Button size="sm" onClick={() => onUploadNfts(collection)}>
              <Upload className="h-4 w-4 mr-1" />
              Upload NFTs
            </Button>
          )}
        </div>
        
        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/collections/${collection.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(collection)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Collection
              </DropdownMenuItem>
            )}
            
            {(collection.status === 'INITIALIZED' || collection.status === 'DRAFT') && onUploadNfts && (
              <DropdownMenuItem onClick={() => onUploadNfts(collection)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload NFTs
              </DropdownMenuItem>
            )}
            
            {collection.merkleTreeAddress && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={getExplorerUrl(collection.merkleTreeAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </a>
                </DropdownMenuItem>
              </>
            )}
            
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(collection)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Collection
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;