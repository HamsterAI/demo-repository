import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// 钱包连接
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { mainnet } from "wagmi/chains";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { http } from "viem";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

const queryClient = new QueryClient();

// const config = getDefaultConfig({
//   appName: "My RainbowKit App",
//   projectId: "d3c730c7436b85349fc1dd2c5995498a",
//   chains: [mainnet],
//   ssr: false, // If your dApp uses server side rendering (SSR)
// });

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

createRoot(document.getElementById("root")!).render(
  // <WagmiProvider config={config}>
  //   <QueryClientProvider client={queryClient}>
  //     <RainbowKitProvider>
  //       <StrictMode>
  //         <App />
  //       </StrictMode>
  //     </RainbowKitProvider>
  //   </QueryClientProvider>
  // </WagmiProvider>

  <DynamicContextProvider
    settings={{
      // Find your environment id at https://app.dynamic.xyz/dashboard/developer
      environmentId: "15942db2-837c-45fd-bc06-bff012a7634b",
      walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
    }}
  >
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DynamicWagmiConnector>
          <App />
        </DynamicWagmiConnector>
      </QueryClientProvider>
    </WagmiProvider>
  </DynamicContextProvider>
);
