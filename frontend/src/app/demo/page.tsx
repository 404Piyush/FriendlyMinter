import React from 'react';
import { Metadata } from 'next';
import DemoShowcase from '@/components/demo/DemoShowcase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Database, 
  Zap, 
  Shield, 
  Code, 
  Palette 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Demo & Testing | FriendlyMinter',
  description: 'Interactive demo showcasing FriendlyMinter features with mock data',
};

const DemoPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FriendlyMinter Demo
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore all features with interactive mock data. Perfect for testing and demonstration purposes.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Database className="h-5 w-5" />
              Mock Data Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Comprehensive mock data including users, collections, NFTs, mint jobs, and analytics.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">Realistic Delays</Badge>
              <Badge variant="outline" className="text-xs">Error Simulation</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Zap className="h-5 w-5" />
              Interactive Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              Test mint job controls, collection management, and real-time progress tracking.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">Live Updates</Badge>
              <Badge variant="outline" className="text-xs">State Management</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Palette className="h-5 w-5" />
              UI Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              Showcase of all custom components, layouts, and design patterns used in the platform.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">Responsive</Badge>
              <Badge variant="outline" className="text-xs">Accessible</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Shield className="h-5 w-5" />
            Demo Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-amber-900">Mock API</p>
              <p className="text-amber-800">
                {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Network</p>
              <p className="text-amber-800">
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Debug Mode</p>
              <p className="text-amber-800">
                {process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' ? 'On' : 'Off'}
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-900">Mock Delay</p>
              <p className="text-amber-800">
                {process.env.NEXT_PUBLIC_MOCK_DELAY || '1000'}ms
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Code className="h-4 w-4 text-amber-700 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Development Notes</p>
                <ul className="text-xs text-amber-800 mt-1 space-y-1">
                  <li>• All data is simulated and resets on page refresh</li>
                  <li>• API calls include realistic delays and error scenarios</li>
                  <li>• Perfect for frontend development and testing</li>
                  <li>• No real blockchain transactions are performed</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Demo Component */}
      <DemoShowcase />

      {/* Footer */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This demo showcases the FriendlyMinter platform with comprehensive mock data.
              <br />
              Ready for backend integration and real Solana blockchain connectivity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoPage;