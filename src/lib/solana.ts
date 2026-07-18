import { Connection, clusterApiUrl, Commitment } from '@solana/web3.js';
import { SolanaNetwork } from '@/types/api';

// Ankr RPC URLs for different networks
const ANKR_RPC_URLS = {
  'devnet': 'https://rpc.ankr.com/solana_devnet',
  'testnet': 'https://rpc.ankr.com/solana_testnet', 
  'mainnet-beta': 'https://rpc.ankr.com/solana'
} as const;

// Fallback to public RPC if Ankr is not available
const FALLBACK_RPC_URLS = {
  'devnet': clusterApiUrl('devnet'),
  'testnet': clusterApiUrl('testnet'),
  'mainnet-beta': clusterApiUrl('mainnet-beta')
} as const;

export class SolanaConnectionManager {
  private static instance: SolanaConnectionManager;
  private connections: Map<string, Connection> = new Map();
  private currentNetwork: SolanaNetwork;
  private commitment: Commitment;

  private constructor() {
    this.currentNetwork = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as SolanaNetwork) || 'devnet';
    this.commitment = 'confirmed';
  }

  public static getInstance(): SolanaConnectionManager {
    if (!SolanaConnectionManager.instance) {
      SolanaConnectionManager.instance = new SolanaConnectionManager();
    }
    return SolanaConnectionManager.instance;
  }

  public getConnection(network?: SolanaNetwork): Connection {
    const targetNetwork = network || this.currentNetwork;
    const connectionKey = `${targetNetwork}-${this.commitment}`;

    if (!this.connections.has(connectionKey)) {
      const rpcUrl = this.getRpcUrl(targetNetwork);
      const connection = new Connection(rpcUrl, {
        commitment: this.commitment,
        wsEndpoint: this.getWsEndpoint(targetNetwork),
        confirmTransactionInitialTimeout: 60000,
      });
      this.connections.set(connectionKey, connection);
    }

    return this.connections.get(connectionKey)!;
  }

  private getRpcUrl(network: SolanaNetwork): string {
    // Prioritize environment variable, then Ankr, then fallback
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    
    if (process.env.NEXT_PUBLIC_ANKR_RPC_URL) {
      return process.env.NEXT_PUBLIC_ANKR_RPC_URL;
    }

    return ANKR_RPC_URLS[network] || FALLBACK_RPC_URLS[network];
  }

  private getWsEndpoint(network: SolanaNetwork): string | undefined {
    // WebSocket endpoints for real-time updates
    const wsEndpoints = {
      'devnet': 'wss://rpc.ankr.com/solana_devnet/ws',
      'testnet': 'wss://rpc.ankr.com/solana_testnet/ws',
      'mainnet-beta': 'wss://rpc.ankr.com/solana/ws'
    };
    
    return wsEndpoints[network];
  }

  public async testConnection(network?: SolanaNetwork): Promise<boolean> {
    try {
      const connection = this.getConnection(network);
      const version = await connection.getVersion();
      console.log(`✅ Connected to Solana ${network || this.currentNetwork}:`, version);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to Solana ${network || this.currentNetwork}:`, error);
      return false;
    }
  }

  public getCurrentNetwork(): SolanaNetwork {
    return this.currentNetwork;
  }

  public setNetwork(network: SolanaNetwork): void {
    this.currentNetwork = network;
    // Clear existing connections to force new connections with new network
    this.connections.clear();
  }

  public setCommitment(commitment: Commitment): void {
    this.commitment = commitment;
    // Clear existing connections to force new connections with new commitment
    this.connections.clear();
  }
}

// Export singleton instance
export const solanaConnection = SolanaConnectionManager.getInstance();

// Helper functions
export const getConnection = (network?: SolanaNetwork) => {
  return solanaConnection.getConnection(network);
};

export const getCurrentNetwork = () => {
  return solanaConnection.getCurrentNetwork();
};

export const testSolanaConnection = async (network?: SolanaNetwork) => {
  return await solanaConnection.testConnection(network);
};

// Network configuration constants
export const SOLANA_NETWORKS: Record<SolanaNetwork, { name: string; explorer: string }> = {
  'devnet': {
    name: 'Devnet',
    explorer: 'https://explorer.solana.com/?cluster=devnet'
  },
  'testnet': {
    name: 'Testnet', 
    explorer: 'https://explorer.solana.com/?cluster=testnet'
  },
  'mainnet-beta': {
    name: 'Mainnet Beta',
    explorer: 'https://explorer.solana.com/'
  }
};

// Utility to get explorer URL for transaction
export const getExplorerUrl = (signature: string, network?: SolanaNetwork): string => {
  const targetNetwork = network || getCurrentNetwork();
  const baseUrl = SOLANA_NETWORKS[targetNetwork].explorer;
  return `${baseUrl}/tx/${signature}`;
};