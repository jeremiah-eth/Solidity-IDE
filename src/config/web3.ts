import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  celo,
  celoAlfajores
} from '@reown/appkit/networks'

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Set existing networks
export const networks = [
  mainnet,
  sepolia,
  base,
  baseSepolia,
  celo,
  celoAlfajores
]

// 3. Create a metadata object - optional
const metadata = {
  name: 'Solidity IDE',
  description: 'Professional Solidity IDE for smart contract development',
  url: 'https://solidity-ide.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 4. Create the AppKit instance
export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})
