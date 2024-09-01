import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Chain } from "viem";
import { configureChains } from "wagmi";
import * as chains from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const configuredNetwork = getTargetNetwork();
const { onlyLocalBurnerWallet } = scaffoldConfig;


const sepolia= {
  id: 11155111,
  network: "sepolia",
  name: "Sepolia",
  nativeCurrency: {
       name: "Sepolia Ether",
       symbol: "SEP",
       decimals: 18,
  },
  rpcUrls: {
       default: {
           http:  ["https://endpoints.omniatech.io/v1/eth/sepolia/public"],
      },
       public: {
           http: ["https://endpoints.omniatech.io/v1/eth/sepolia/public"],
      },
  },
  blockExplorers: {
       etherscan: {
       name: "Etherscan",
       url: "https://sepolia.etherscan.io",
      },
       default: {
           name: "Etherscan",
           url: "https://sepolia.etherscan.io",
      },
  },
   contracts: {
       multicall3: {
           address: "0xca11bde05977b3631167028862be2a173976ca11",
           blockCreated: 6507670,
      },
  },
  testnet: true,
} as const satisfies Chain;


// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = [
  chains.goerli,
  sepolia,
];

/**
 * Chains for the app
 */
export const appChains = configureChains(
  enabledChains,
  [
    publicProvider(),
  ],
  
);

const walletsOptions = { chains: appChains.chains, projectId: scaffoldConfig.walletConnectProjectId };
const wallets = [
  metaMaskWallet({ ...walletsOptions, shimDisconnect: true }),
  walletConnectWallet(walletsOptions),
  ledgerWallet(walletsOptions),
  braveWallet(walletsOptions),
  coinbaseWallet({ ...walletsOptions, appName: "scaffold-eth-2" }),
  rainbowWallet(walletsOptions),
  ...(configuredNetwork.id === chains.hardhat.id || !onlyLocalBurnerWallet
    ? [burnerWalletConfig({ chains: [appChains.chains[0]] })]
    : []),
  safeWallet({ ...walletsOptions, debug: false, allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/] }),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets,
  },
]);
