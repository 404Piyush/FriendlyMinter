import type { Metadata } from 'next';
import { DemoExplorer } from '@/components/demo/DemoExplorer';

export const metadata: Metadata = {
  title: 'Demo',
  description:
    'Interactive demo of FriendlyMinter. Mock data simulates the full cNFT mint flow.',
};

export default function DemoPage() {
  return <DemoExplorer />;
}
