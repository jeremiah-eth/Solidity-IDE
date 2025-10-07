# Solidity IDE

A professional, web-based Solidity IDE for smart contract development with Monaco editor, gas estimation, contract verification, and multi-chain support.

![Solidity IDE](https://img.shields.io/badge/Solidity-IDE-blue?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.9-purple?style=for-the-badge&logo=vite)

## 🚀 Features

### Core Development
- **Monaco Editor Integration**: Full-featured code editor with Solidity syntax highlighting
- **Real-time Compilation**: Compile Solidity contracts instantly with detailed error reporting
- **Multi-file Support**: Manage multiple contract files with file explorer
- **Sample Contracts**: Pre-loaded with common smart contract examples

### Deployment & Interaction
- **Multi-chain Support**: Deploy to Ethereum, Base, Polygon, and other networks
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Gas Estimation**: Real-time gas cost calculation before deployment
- **Contract Verification**: Verify contracts on block explorers
- **Contract Interaction**: Interact with deployed contracts through a user-friendly interface

### Developer Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts**: Efficient coding with customizable shortcuts
- **Error Handling**: Comprehensive error boundaries and user feedback
- **IPFS Integration**: Upload contract metadata to decentralized storage

## 🛠️ Technology Stack

- **Frontend**: React 19.2.0, TypeScript 5.9.3
- **Build Tool**: Vite 7.1.9
- **Styling**: Tailwind CSS 3.4.0
- **Editor**: Monaco Editor (VS Code engine)
- **Web3**: Ethers.js 6.x
- **Compiler**: Solidity Compiler (solc) 0.8.30
- **Package Manager**: Bun 1.2.23

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/jeremiah-eth/Solidity-IDE.git
cd Solidity-IDE

# Install dependencies
bun install

# Start development server
bun run dev
```

## 🚀 Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build

# Code Quality
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run type-check   # Run TypeScript type checking
bun run format       # Format code with Prettier

# Testing
bun run test         # Run tests (when implemented)
```

### Project Structure

```
src/
├── components/          # React components
│   ├── Editor.tsx       # Monaco editor wrapper
│   ├── FileExplorer.tsx # File management
│   ├── Deployer.tsx     # Contract deployment
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useWallet.ts     # Wallet connection logic
│   └── useContract.ts   # Contract management
├── utils/               # Utility functions
│   ├── solidityCompiler.ts
│   ├── contractDeployment.ts
│   └── ...
└── types/               # TypeScript type definitions
```

## 🧪 Testing & Deployment

### Test Deployment on Base Mainnet

We successfully tested the IDE by deploying a mock contract to Base Mainnet:

**Contract Address**: `0x140C07055B0B85efe91b80e765BCc24b3dd647d9`

**Transaction Hash**: `0xe0971021f9dc717753265e5c9e45f2f9cc63efc3352d571fd21cd195d9248fa7`

**Block Explorer**: [View on BaseScan](https://basescan.org/tx/0xe0971021f9dc717753265e5c9e45f2f9cc63efc3352d571fd21cd195d9248fa7)

**Transaction Details**:
- **Network**: Base Mainnet
- **Block**: 36531550
- **Gas Used**: 53,000 / 53,793 (98.53%)
- **Gas Price**: 0.02954044 Gwei
- **Transaction Fee**: 0.000001578813955821 ETH ($0.007052)
- **Status**: ✅ Success

This deployment demonstrates the IDE's capability to:
- Compile Solidity contracts
- Estimate gas costs accurately
- Deploy to production networks
- Handle real-world transaction scenarios

### Supported Networks

- **Ethereum Mainnet** (Chain ID: 1)
- **Base Mainnet** (Chain ID: 8453)
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Testnets**: Sepolia, Goerli, Base Sepolia


Create a `.env.local` file for environment-specific configuration:

```env
# Optional: Custom RPC endpoints
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_POLYGON_RPC_URL=https://polygon-rpc.com

# Optional: API keys for enhanced features
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
VITE_PINATA_API_KEY=your_pinata_api_key
```

## 🤝 Contributing

contributions are welcomed! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Ethers.js](https://docs.ethers.io/) for Web3 functionality
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Base Network](https://base.org/) for testnet support
- [BaseScan](https://basescan.org/) for blockchain explorer integration



## 🔗 Links

- **GitHub**: [@jeremiah-eth](https://github.com/jeremiah-eth)
- **Repository**: [Solidity-IDE](https://github.com/jeremiah-eth/Solidity-IDE)

---

**Built by jeremiah-eth**

