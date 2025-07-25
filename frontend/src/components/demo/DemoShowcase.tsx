'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Folder, 
  Image, 
  Zap, 
  TrendingUp, 
  Bell, 
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Database
} from 'lucide-react';
import { mockAPI } from '@/lib/mock-api-enhanced';
import { Collection, MintJob, User, NFTMetadata } from '@/types';

interface DemoShowcaseProps {
  className?: string;
}

export const DemoShowcase: React.FC<DemoShowcaseProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [mintJobs, setMintJobs] = useState<MintJob[]>([]);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDemoData = async () => {
    setLoading(true);
    try {
      const [usersData, collectionsData, jobsData, nftData, analyticsData, notificationsData] = await Promise.all([
        mockAPI.getUsers(),
        mockAPI.getCollections(),
        mockAPI.getMintJobs(),
        mockAPI.getNftMetadata(),
        mockAPI.getAnalytics(),
        mockAPI.getNotifications('user-1')
      ]);
      
      setUsers(usersData);
      setCollections(collectionsData);
      setMintJobs(jobsData);
      setNftMetadata(nftData);
      setAnalytics(analyticsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMintJob = async (jobId: string) => {
    try {
      await mockAPI.startMintJob(jobId);
      loadDemoData(); // Refresh data
    } catch (error) {
      console.error('Error starting mint job:', error);
    }
  };

  const handlePauseMintJob = async (jobId: string) => {
    try {
      await mockAPI.pauseMintJob(jobId);
      loadDemoData(); // Refresh data
    } catch (error) {
      console.error('Error pausing mint job:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROCESSING':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  if (loading && !users.length) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading demo data...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Banner */}
      {process.env.NEXT_PUBLIC_SHOW_MOCK_DATA_BANNER === 'true' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Demo Mode Active</h3>
                <p className="text-sm text-blue-700">
                  You're viewing mock data for demonstration purposes. All interactions are simulated.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadDemoData}
                disabled={loading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="jobs">Mint Jobs</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Active creators</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collections.length}</div>
                <p className="text-xs text-muted-foreground">{collections.filter(c => c.isActive).length} active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalNftsMinted || 0}</div>
                <p className="text-xs text-muted-foreground">Across all collections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalVolume || 0} SOL</div>
                <p className="text-xs text-muted-foreground">All-time volume</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-1 rounded-full ${
                      notification.type === 'success' ? 'bg-green-100' :
                      notification.type === 'error' ? 'bg-red-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {getStatusIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{user.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Collections</p>
                      <p className="text-muted-foreground">{user.totalCollections}</p>
                    </div>
                    <div>
                      <p className="font-medium">NFTs Minted</p>
                      <p className="text-muted-foreground">{user.totalNftsMinted}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Spent</p>
                      <p className="text-muted-foreground">{user.totalSpent} SOL</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-8)}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid gap-4">
            {collections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle>{collection.name}</CardTitle>
                        <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Symbol: <code className="bg-muted px-1 rounded">{collection.symbol}</code></span>
                        <span>Supply: {collection.totalSupply}</span>
                        <span>Minted: {collection.mintedCount}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Floor Price</p>
                      <p className="text-muted-foreground">{collection.floorPrice} SOL</p>
                    </div>
                    <div>
                      <p className="font-medium">24h Volume</p>
                      <p className="text-muted-foreground">{collection.volume24h} SOL</p>
                    </div>
                    <div>
                      <p className="font-medium">Royalty</p>
                      <p className="text-muted-foreground">{collection.royalty}%</p>
                    </div>
                  </div>
                  {collection.tags && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {collection.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4">
            {mintJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      Mint Job #{job.id.slice(-8)}
                    </CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Total NFTs</p>
                        <p className="text-muted-foreground">{job.totalNfts}</p>
                      </div>
                      <div>
                        <p className="font-medium">Minted</p>
                        <p className="text-muted-foreground">{job.mintedCount}</p>
                      </div>
                      <div>
                        <p className="font-medium">Failed</p>
                        <p className="text-muted-foreground">{job.failedCount}</p>
                      </div>
                      <div>
                        <p className="font-medium">Cost</p>
                        <p className="text-muted-foreground">{job.actualCost.toFixed(3)} SOL</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                    
                    {job.errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{job.errorMessage}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {job.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartMintJob(job.id)}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {job.status === 'PROCESSING' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePauseMintJob(job.id)}
                          disabled={loading}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nftMetadata.map((nft) => (
              <Card key={`${nft.collectionId}-${nft.tokenId}`}>
                <CardHeader className="pb-3">
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{nft.name}</h3>
                      <p className="text-sm text-muted-foreground">{nft.description}</p>
                    </div>
                    
                    {nft.rarity && (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{nft.rarity}</Badge>
                        {nft.rarityScore && (
                          <span className="text-sm text-muted-foreground">
                            Score: {nft.rarityScore}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Attributes:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(nft.attributes).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-muted p-1 rounded">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.successRate}%</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Avg Mint Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageMintCost} SOL</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalVolume} SOL</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total NFTs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalNftsMinted}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topCollections.map((collection: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{collection.name}</p>
                          <p className="text-sm text-muted-foreground">{collection.volume} SOL volume</p>
                        </div>
                        <Badge variant={collection.change.startsWith('+') ? 'default' : 'destructive'}>
                          {collection.change}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DemoShowcase;