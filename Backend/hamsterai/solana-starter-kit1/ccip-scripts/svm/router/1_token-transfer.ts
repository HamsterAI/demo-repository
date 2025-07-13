

// Import our unified configuration
import {
  ChainId,
  getCCIPSVMConfig,
  CHAIN_SELECTORS,
  FeeTokenType as ConfigFeeTokenType,
} from "../../config";

// Import helper for checking help flag
import {
  printUsage,
  parseCCIPArgs,
  executeCCIPScript,
  CCIPMessageConfig,
} from "../utils";

// Get configuration
const config = getCCIPSVMConfig(ChainId.SOLANA_DEVNET);

// =================================================================
// CCIP MESSAGE CONFIGURATION
// Core parameters that will be sent in the CCIP message
// =================================================================
const CCIP_MESSAGE_CONFIG: CCIPMessageConfig = {
  // Destination configuration
  destinationChain: ChainId.ETHEREUM_SEPOLIA,
  destinationChainSelector:
    CHAIN_SELECTORS[ChainId.ETHEREUM_SEPOLIA].toString(),
  evmReceiverAddress: "0x4aEeE376E7b9F0fAb9883382Bd5f9c8D22764ABb",

  // Token transfers configuration - supports multiple tokens
  tokenAmounts: [
    {
      tokenMint: config.bnmTokenMint, // BnM token on Solana Devnet
      amount: "10000000", // String representation of raw token amount (0.01 with 9 decimals)
    },
  ],

  // Fee configuration
  feeToken: ConfigFeeTokenType.NATIVE, // Use SOL for fees

  // Message data (empty for token transfers, or custom data for messaging)
  messageData: "", // Empty data for token transfer only

  // Extra arguments configuration
  extraArgs: {
    gasLimit: 0, // No execution on destination for token transfers
    allowOutOfOrderExecution: true, // Allow out-of-order execution
  },
};

// =================================================================
// SCRIPT CONFIGURATION
// Parameters specific to this script, not part of the CCIP message
// =================================================================
const SCRIPT_CONFIG = {
  computeUnits: 1_400_000, // Maximum compute units for Solana
  minSolRequired: 0.005, // Minimum SOL needed for transaction
  
  // Default extraArgs values (used as fallbacks if not provided in message config)
  defaultExtraArgs: {
    gasLimit: 0, // Default gas limit for token transfers
    allowOutOfOrderExecution: true, // Default to allow out-of-order execution
  },
};
// =================================================================

/**
 * Main token transfer function
 */
async function tokenTransfer(): Promise<void> {
  // Parse command line arguments
  const cmdOptions = parseCCIPArgs("token-transfer");

  // Execute the CCIP script with our configuration
  await executeCCIPScript({
    scriptName: "token-transfer",
    usageName: "svm:token-transfer",
    messageConfig: CCIP_MESSAGE_CONFIG,
    scriptConfig: SCRIPT_CONFIG,
    cmdOptions,
  });
}

// Check if help is requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printUsage("svm:token-transfer");
  process.exit(0);
}

// Run the script
tokenTransfer().catch((err) => {
  console.error(`Unhandled error in token transfer: ${err}`);
  process.exit(1);
});
