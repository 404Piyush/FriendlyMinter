# Checkpoint 08: Frontend Components & UI Implementation

## Objective
Implement comprehensive frontend components and UI using Next.js 14+, React, TypeScript, and Shadcn/UI for the cNFT minting platform.

## Prerequisites
- Checkpoint 07 completed (IPFS Integration)
- Shadcn/UI components installed
- Tailwind CSS configured
- TypeScript setup complete

## Core UI Dependencies
```bash
# Shadcn/UI Components (install as needed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add tooltip

# Additional UI Libraries
npm install react-dropzone
npm install react-hook-form
npm install @hookform/resolvers
npm install zod
npm install papaparse
npm install @types/papaparse
npm install lucide-react
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
```

## Layout Components

### components/layout/Header.tsx
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import WalletButton from '@/components/wallet/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  Home,
  Plus,
  FolderOpen,
  Settings,
  LogOut,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Collection', href: '/collections/create', icon: Plus },
  { name: 'My Collections', href: '/collections', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                FriendlyMinter
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection Status */}
            {connected && (
              <Badge variant="outline" className="hidden sm:flex">
                <Wallet className="w-3 h-3 mr-1" />
                {publicKey?.toBase58().slice(0, 4)}...
                {publicKey?.toBase58().slice(-4)}
              </Badge>
            )}

            {/* Wallet Button */}
            <WalletButton />

            {/* User Menu */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
```

### components/layout/Sidebar.tsx
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Plus,
  FolderOpen,
  Settings,
  BarChart3,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollections } from '@/hooks/useCollections';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Collection', href: '/collections/create', icon: Plus },
  { name: 'My Collections', href: '/collections', icon: FolderOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Documentation', href: '/docs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { collections, isLoading } = useCollections();

  const recentCollections = collections?.slice(0, 5) || [];

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recent Collections */}
      {!collapsed && (
        <div className="px-4 py-4">
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">
              Recent Collections
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : recentCollections.length > 0 ? (
              <div className="space-y-1">
                {recentCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {collection.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {collection._count?.nftMetadata || 0}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No collections yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4">
        <Separator className="mb-4" />
        {!collapsed && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Wallet className="w-4 h-4" />
            <span>Solana Network</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Collection Components

### components/collections/CreateCollectionForm.tsx
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/ui/file-upload';
import { useToast } from '@/components/ui/use-toast';
import { useCreateCollection } from '@/hooks/useCollections';
import { calculateMerkleTreeCost } from '@/lib/solana/merkle-tree-manager';
import { Upload, Info, Zap } from 'lucide-react';

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100),
  symbol: z.string().min(1, 'Symbol is required').max(10),
  description: z.string().max(1000).optional(),
  image: z.instanceof(File).optional(),
  maxSupply: z.number().min(1).max(1000000),
  royaltyPercentage: z.number().min(0).max(10).default(0),
  externalUrl: z.string().url().optional().or(z.literal('')),
});

type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

const SUPPLY_PRESETS = [
  { label: 'Small (100)', value: 100 },
  { label: 'Medium (1,000)', value: 1000 },
  { label: 'Large (10,000)', value: 10000 },
  { label: 'Extra Large (100,000)', value: 100000 },
];

export default function CreateCollectionForm() {
  const [step, setStep] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const createCollection = useCreateCollection();

  const form = useForm<CreateCollectionFormData>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
      maxSupply: 1000,
      royaltyPercentage: 0,
      externalUrl: '',
    },
  });

  const watchedMaxSupply = form.watch('maxSupply');

  // Calculate estimated cost when max supply changes
  React.useEffect(() => {
    if (watchedMaxSupply > 0) {
      const cost = calculateMerkleTreeCost(watchedMaxSupply);
      setEstimatedCost(cost);
    }
  }, [watchedMaxSupply]);

  const onSubmit = async (data: CreateCollectionFormData) => {
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const result = await createCollection.mutateAsync(formData);
      
      toast({
        title: 'Collection Created',
        description: 'Your collection has been created successfully.',
      });
      
      router.push(`/collections/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create collection. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% Complete</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Awesome Collection"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a unique and memorable name for your collection.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MAC"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        A short symbol for your collection (2-10 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your collection..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of your collection.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-website.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to your website or social media.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Collection Image */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Collection Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          accept="image/*"
                          maxSize={10 * 1024 * 1024} // 10MB
                          onFileSelect={(file) => field.onChange(file)}
                          className="h-64"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                Drop your image here or click to browse
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
                        </FileUpload>
                      </FormControl>
                      <FormDescription>
                        This image will represent your collection. Recommended size: 400x400px.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="maxSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Supply</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            type="number"
                            min={1}
                            max={1000000}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                          <div className="flex flex-wrap gap-2">
                            {SUPPLY_PRESETS.map((preset) => (
                              <Button
                                key={preset.value}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(preset.value)}
                                className={field.value === preset.value ? 'bg-purple-100' : ''}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        The maximum number of NFTs that can be minted in this collection.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="royaltyPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Royalty Percentage</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                          <div className="text-sm text-gray-500">
                            {field.value}% royalty on secondary sales
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Percentage of secondary sales that goes to the creator (0-10%).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cost Estimation */}
                {estimatedCost !== null && (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Estimated Costs:</div>
                        <div className="space-y-1">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {parsedData.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success */}
            {parsedData.errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  CSV file processed successfully! {parsedData.rows.length} NFT metadata records ready for upload.
                </AlertDescription>
              </Alert>
            )}

            {/* Data Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Data Preview</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                  className="flex items-center space-x-2"
                >
                  {isPreviewExpanded ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>{isPreviewExpanded ? 'Hide' : 'Show'} Preview</span>
                </Button>
              </div>

              {isPreviewExpanded && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers.slice(0, 5).map((header) => (
                          <TableHead key={header} className="font-medium">
                            {header}
                            {REQUIRED_COLUMNS.includes(header) && (
                              <Badge variant="destructive" className="ml-1 text-xs">
                                Required
                              </Badge>
                            )}
                            {RECOMMENDED_COLUMNS.includes(header) && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </TableHead>
                        ))}
                        {parsedData.headers.length > 5 && (
                          <TableHead>...</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.rows.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {parsedData.headers.slice(0, 5).map((header) => (
                            <TableCell key={header} className="max-w-[200px] truncate">
                              {row[header] || '-'}
                            </TableCell>
                          ))}
                          {parsedData.headers.length > 5 && (
                            <TableCell>...</TableCell>
                          )}
                        </TableRow>
                      ))}
                      {parsedData.rows.length > 5 && (
                        <TableRow>
                          <TableCell
                            colSpan={Math.min(parsedData.headers.length, 6)}
                            className="text-center text-gray-500"
                          >
                            ... and {parsedData.rows.length - 5} more rows
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Progress and Status Components

### components/ui/progress-tracker.tsx
```typescript
'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Upload,
  Coins,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
}

const getStepIcon = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'in-progress':
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStepColor = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return 'border-green-500 bg-green-50';
    case 'in-progress':
      return 'border-blue-500 bg-blue-50';
    case 'error':
      return 'border-red-500 bg-red-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

export default function ProgressTracker({
  steps,
  currentStep,
  className,
}: ProgressTrackerProps) {
  const completedSteps = steps.filter((step) => step.status === 'completed').length;
  const totalProgress = (completedSteps / steps.length) * 100;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Progress</span>
          <Badge variant="outline">
            {completedSteps} / {steps.length} Complete
          </Badge>
        </CardTitle>
        <Progress value={totalProgress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
                  getStepColor(step.status),
                  isActive && 'ring-2 ring-purple-500 ring-opacity-50'
                )}
              >
                {/* Step Number/Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                  {step.status === 'pending' ? (
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                  ) : (
                    getStepIcon(step.status)
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {step.title}
                    </h4>
                    <Badge
                      variant={step.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {step.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  
                  {/* Progress Bar for In-Progress Steps */}
                  {step.status === 'in-progress' && step.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">
                        {step.progress}% complete
                      </p>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {step.status === 'error' && step.error && (
                    <p className="text-sm text-red-600 mt-1">
                      {step.error}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### components/collections/MintingProgress.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProgressTracker from '@/components/ui/progress-tracker';
import {
  Pause,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Zap,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { MintJob } from '@/types';
import { useMintJobStatus } from '@/hooks/useMintJobs';
import { cn } from '@/lib/utils';

interface MintingProgressProps {
  jobId: string;
  onComplete?: (job: MintJob) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function MintingProgress({
  jobId,
  onComplete,
  onError,
  className,
}: MintingProgressProps) {
  const { data: job, isLoading, error } = useMintJobStatus(jobId);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (job?.status === 'COMPLETED' && onComplete) {
      onComplete(job);
    }
    if (job?.status === 'FAILED' && onError) {
      onError(job.error || 'Minting failed');
    }
  }, [job, onComplete, onError]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading job status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !job) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load job status: {error?.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const progress = job.totalNfts > 0 ? (job.processedNfts / job.totalNfts) * 100 : 0;
  const estimatedTimeRemaining = job.estimatedTimeRemaining;
  const mintingRate = job.mintingRate;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mintingSteps = [
    {
      id: 'preparation',
      title: 'Preparation',
      description: 'Validating metadata and preparing assets',
      status: job.processedNfts > 0 ? 'completed' : job.status === 'PROCESSING' ? 'in-progress' : 'pending',
    },
    {
      id: 'minting',
      title: 'Minting NFTs',
      description: `Minting ${job.totalNfts} compressed NFTs`,
      status: job.status === 'PROCESSING' && job.processedNfts > 0 ? 'in-progress' : 
             job.status === 'COMPLETED' ? 'completed' : 
             job.status === 'FAILED' ? 'error' : 'pending',
      progress: progress,
      error: job.status === 'FAILED' ? job.error : undefined,
    },
    {
      id: 'finalization',
      title: 'Finalization',
      description: 'Updating database and sending confirmations',
      status: job.status === 'COMPLETED' ? 'completed' : 'pending',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Job Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Minting Job #{job.id}</span>
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{job.processedNfts} / {job.totalNfts} NFTs</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="text-center text-sm text-gray-600">
              {progress.toFixed(1)}% Complete
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {job.processedNfts}
              </div>
              <div className="text-sm text-gray-600">Minted</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {job.totalNfts - job.processedNfts}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            
            {mintingRate && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {mintingRate.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">NFTs/min</div>
              </div>
            )}
            
            {estimatedTimeRemaining && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.ceil(estimatedTimeRemaining / 60)}
                </div>
                <div className="text-sm text-gray-600">Min left</div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          {job.status === 'PROCESSING' && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                disabled
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {/* Transaction Links */}
          {job.transactionSignatures && job.transactionSignatures.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Transactions:</h4>
              <div className="space-y-1">
                {job.transactionSignatures.slice(-3).map((signature, index) => (
                  <a
                    key={index}
                    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="font-mono">
                      {signature.slice(0, 8)}...{signature.slice(-8)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <ProgressTracker
        steps={mintingSteps}
        currentStep={job.status === 'PROCESSING' ? 'minting' : undefined}
      />

      {/* Error Details */}
      {job.status === 'FAILED' && job.error && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Minting failed:</p>
              <p className="text-sm">{job.error}</p>
              {job.failedNfts && job.failedNfts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Failed NFTs ({job.failedNfts.length}):
                  </p>
                  <ul className="text-sm list-disc list-inside">
                    {job.failedNfts.slice(0, 5).map((nft, index) => (
                      <li key={index}>{nft.name}</li>
                    ))}
                    {job.failedNfts.length > 5 && (
                      <li>... and {job.failedNfts.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {job.status === 'COMPLETED' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                Successfully minted {job.processedNfts} NFTs!
              </p>
              <p className="text-sm">
                All NFTs have been minted and are now available in your collection.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Environment Variables

```bash
# Frontend Environment Variables (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# External Services
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

## Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "ui:add": "npx shadcn-ui@latest add"
  }
}
```

## Next Steps
1. Install and configure Shadcn/UI components
2. Implement layout components (Header, Sidebar)
3. Create collection management components
4. Build file upload and CSV processing components
5. Implement progress tracking and status components
6. Add responsive design and mobile optimization
7. Integrate with backend APIs
8. Add comprehensive error handling
9. Implement loading states and skeletons
10. Add accessibility features (ARIA labels, keyboard navigation)

## Key Features Implemented
- **Responsive Layout**: Header with navigation and user menu
- **Collection Management**: Create collection form with multi-step wizard
- **File Upload**: Drag & drop with preview and validation
- **CSV Processing**: Parse and validate NFT metadata
- **Progress Tracking**: Real-time minting progress with status updates
- **Error Handling**: Comprehensive error states and user feedback
- **Modern UI**: Shadcn/UI components with Tailwind CSS styling
- **Type Safety**: Full TypeScript integration
- **Performance**: Optimized components with proper loading states text-sm">
                          <div className="flex justify-between">
                            <span>Merkle Tree Creation:</span>
                            <Badge variant="outline">
                              {estimatedCost.toFixed(4)} SOL
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Collection NFT:</span>
                            <Badge variant="outline">~0.01 SOL</Badge>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total Estimated:</span>
                            <Badge>
                              {(estimatedCost + 0.01).toFixed(4)} SOL
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createCollection.isPending}
                className="min-w-[120px]"
              >
                {createCollection.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Collection'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### components/collections/CollectionCard.tsx
```typescript
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
} from 'lucide-react';
import { Collection } from '@/types';
import { formatDate } from '@/lib/utils';

interface CollectionCardProps {
  collection: Collection;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onView?: (collection: Collection) => void;
}

export default function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onView,
}: CollectionCardProps) {
  const mintedCount = collection._count?.nftMetadata || 0;
  const mintedPercentage = (mintedCount / collection.maxSupply) * 100;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'READY':
        return 'bg-blue-100 text-blue-800';
      case 'MINTING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Collection Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {collection.imageUrl ? (
            <Image
              src={collection.imageUrl}
              alt={collection.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {collection.name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(collection.status)}>
              {collection.status}
            </Badge>
          </div>
          
          {/* Actions Menu */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(collection)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(collection)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {collection.externalUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={collection.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      External Link
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(collection)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Collection Info */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {collection.description || 'No description provided'}
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                Supply
              </div>
              <div className="font-medium">
                {mintedCount.toLocaleString()} / {collection.maxSupply.toLocaleString()}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(mintedPercentage, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Created
              </div>
              <div className="font-medium">
                {formatDate(collection.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Symbol */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono">
              {collection.symbol}
            </Badge>
            {collection.royaltyPercentage > 0 && (
              <Badge variant="secondary">
                {collection.royaltyPercentage}% Royalty
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/collections/${collection.id}`}>
            View Collection
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## File Upload Components

### components/ui/file-upload.tsx
```typescript
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onFileSelect?: (files: File | File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (urls: string | string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUpload({
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 1,
  onFileSelect,
  onUploadProgress,
  onUploadComplete,
  onError,
  className,
  children,
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejection) => {
          const { file, errors } = rejection;
          return `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`;
        });
        onError?.(errors.join('; '));
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          progress: 0,
          status: 'uploading',
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        
        // Notify parent component
        if (multiple) {
          onFileSelect?.(acceptedFiles);
        } else {
          onFileSelect?.(acceptedFiles[0]);
        }

        // Simulate upload progress (replace with actual upload logic)
        simulateUpload(newFiles);
      }
    },
    [multiple, onFileSelect, onError]
  );

  const simulateUpload = (files: UploadedFile[]) => {
    files.forEach((uploadedFile, index) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.file === uploadedFile.file) {
              const newProgress = Math.min(f.progress + 10, 100);
              if (newProgress === 100) {
                clearInterval(interval);
                return { ...f, progress: 100, status: 'completed' };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 100);
    });
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.file !== fileToRemove);
      
      // Revoke object URL to prevent memory leaks
      const fileData = prev.find((f) => f.file === fileToRemove);
      if (fileData?.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
      
      return updated;
    });
  };

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: accept === '*' ? undefined : { [accept]: [] },
    maxSize,
    maxFiles,
    multiple,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive || dropzoneActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        {children || (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? 'Drop files here'
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                {accept !== '*' && `Accepted: ${accept}`}
                {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                {maxFiles > 1 && ` • Max files: ${maxFiles}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((uploadedFile, index) => {
            const { file, preview, progress, status, error } = uploadedFile;
            
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <File className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Status Icon */}
                    {status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {status === 'uploading' && (
                    <Progress value={progress} className="h-1 mt-2" />
                  )}
                  
                  {/* Error Message */}
                  {status === 'error' && error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

## CSV Upload Component

### components/collections/CSVUpload.tsx
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploadProps {
  onDataParsed?: (data: Record<string, any>[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

const REQUIRED_COLUMNS = ['name'];
const RECOMMENDED_COLUMNS = ['description', 'image_filename'];
const RESERVED_COLUMNS = ['recipient_wallet'];

export default function CSVUpload({
  onDataParsed,
  onError,
  className,
}: CSVUploadProps) {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateData = (headers: string[], rows: Record<string, any>[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required columns
    const missingRequired = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col)
    );
    if (missingRequired.length > 0) {
      errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Check recommended columns
    const missingRecommended = RECOMMENDED_COLUMNS.filter(
      (col) => !headers.includes(col)
    );
    if (missingRecommended.length > 0) {
      warnings.push(
        `Missing recommended columns: ${missingRecommended.join(', ')}`
      );
    }

    // Validate row data
    rows.forEach((row, index) => {
      // Check for empty required fields
      REQUIRED_COLUMNS.forEach((col) => {
        if (!row[col] || row[col].toString().trim() === '') {
          errors.push(`Row ${index + 1}: Missing value for '${col}'`);
        }
      });

      // Check name length
      if (row.name && row.name.length > 100) {
        warnings.push(`Row ${index + 1}: Name is very long (${row.name.length} chars)`);
      }

      // Check description length
      if (row.description && row.description.length > 1000) {
        warnings.push(
          `Row ${index + 1}: Description is very long (${row.description.length} chars)`
        );
      }
    });

    // Check for duplicate names
    const names = rows.map((row) => row.name).filter(Boolean);
    const duplicateNames = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    if (duplicateNames.length > 0) {
      warnings.push(
        `Duplicate names found: ${[...new Set(duplicateNames)].join(', ')}`
      );
    }

    return { errors, warnings };
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        onError?.('Please upload a CSV file');
        return;
      }

      setIsProcessing(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: (results) => {
          try {
            const headers = results.meta.fields || [];
            const rows = results.data as Record<string, any>[];

            // Validate data
            const { errors, warnings } = validateData(headers, rows);

            const parsedData: ParsedData = {
              headers,
              rows,
              errors,
              warnings,
            };

            setParsedData(parsedData);

            if (errors.length === 0) {
              onDataParsed?.(rows);
            } else {
              onError?.(errors.join('; '));
            }
          } catch (error) {
            onError?.('Failed to process CSV file');
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error) => {
          onError?.(`CSV parsing error: ${error.message}`);
          setIsProcessing(false);
        },
      });
    },
    [onDataParsed, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const downloadTemplate = () => {
    const templateData = [
      {
        name: 'Example NFT 1',
        description: 'This is an example NFT description',
        image_filename: 'image1.png',
        trait_background: 'Blue',
        trait_rarity: 'Common',
        recipient_wallet: 'WALLET_ADDRESS_HERE',
      },
      {
        name: 'Example NFT 2',
        description: 'Another example NFT',
        image_filename: 'image2.png',
        trait_background: 'Red',
        trait_rarity: 'Rare',
        recipient_wallet: 'WALLET_ADDRESS_HERE',
      },
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nft_metadata_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload CSV Metadata</span>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Processing CSV...</span>
                </div>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? 'Drop your CSV file here'
                        : 'Drag & drop your CSV file here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to select a file
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Required columns: {REQUIRED_COLUMNS.join(', ')}</p>
                    <p>Recommended: {RECOMMENDED_COLUMNS.join(', ')}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation Results</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {parsedData.rows.length} rows
                </Badge>
                <Badge variant="outline">
                  {parsedData.headers.length} columns
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {parsedData.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors found:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {parsedData.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {parsedData.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1