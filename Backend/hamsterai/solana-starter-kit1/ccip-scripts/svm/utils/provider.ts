import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { CCIPProvider, AddressConversion } from "../../../ccip-lib/svm";
import fs from "fs";
import { KEYPAIR_PATHS } from "./config-parser";
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { createLogger } from "../../../ccip-lib/svm/utils/logger";
import dotenv from "dotenv";
import bs58 from "bs58";

// Load environment variables
dotenv.config();

const logger = createLogger('Provider');

/**
 * Loads a keypair from a file or environment variable
 * @param filePath Path to keypair file (fallback if env var not available)
 * @returns Keypair
 */
export function loadKeypair(filePath: string = KEYPAIR_PATHS.DEFAULT): Keypair {
  try {
    // First try to load from environment variable
    const envPrivateKey = process.env.SOLANA_PRIVATE_KEY;
    if (envPrivateKey) {
      logger.info('Loading keypair from SOLANA_PRIVATE_KEY environment variable');
      
      // Check if private key is in base58 format (typical for wallet exports)
      if (envPrivateKey.length > 80 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(envPrivateKey)) {
        // base58 format
        logger.info('Detected base58 format private key');
        const privateKeyBytes = bs58.decode(envPrivateKey);
        return Keypair.fromSecretKey(privateKeyBytes);
      } else {
        // hex format
        logger.info('Detected hex format private key');
        // Remove '0x' prefix if present
        const cleanPrivateKey = envPrivateKey.startsWith('0x') ? envPrivateKey.slice(2) : envPrivateKey;
        const privateKeyBytes = Buffer.from(cleanPrivateKey, 'hex');
        return Keypair.fromSecretKey(privateKeyBytes);
      }
    }

    // Fallback to file-based keypair
    logger.info(`Loading keypair from file: ${filePath}`);
    const keypairData = fs.readFileSync(filePath, "utf-8");
    const keypairJson = JSON.parse(keypairData);
    return Keypair.fromSecretKey(Buffer.from(keypairJson));
  } catch (error) {
    logger.error(`Error loading keypair from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get a connection to the Solana network
 * @returns Connection
 */
export function getConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  logger.info(`Connecting to ${rpcUrl}`);
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Get a provider for interacting with Solana using Anchor
 * @returns AnchorProvider with publicKey property
 */
export async function getProvider(): Promise<AnchorProvider & { publicKey: PublicKey }> {
  const keypair = loadKeypair();
  const connection = getConnection();

  const provider = new AnchorProvider(
    connection,
    new Wallet(keypair),
    AnchorProvider.defaultOptions()
  );

  // Add the publicKey directly to the provider for convenience
  (provider as any).publicKey = keypair.publicKey;

  return provider as AnchorProvider & { publicKey: PublicKey };
}

/**
 * Creates a provider from a keypair path and connection
 * @param keypairPath Path to the keypair file
 * @param connection Connection to Solana network
 * @returns CCIPProvider instance
 */
export function createProviderFromPath(
  keypairPath: string = KEYPAIR_PATHS.DEFAULT,
  connection: Connection
): CCIPProvider {
  const keypair = loadKeypair(keypairPath);
  return createKeypairProvider(keypair, connection);
}

/**
 * Creates a provider from a keypair and connection
 * @param keypair Keypair to use for signing
 * @param connection Connection to Solana network
 * @returns CCIPProvider instance
 */
export function createKeypairProvider(
  keypair: Keypair,
  connection: Connection
): CCIPProvider {
  return {
    connection,
    wallet: keypair,
    getAddress(): PublicKey {
      return keypair.publicKey;
    },
    async signTransaction(
      tx: Transaction | VersionedTransaction
    ): Promise<Transaction | VersionedTransaction> {
      if (tx instanceof VersionedTransaction) {
        // For VersionedTransaction, use the new signing method
        tx.sign([keypair]);
        return tx;
      } else {
        // For traditional Transaction, use partialSign
        tx.partialSign(keypair);
        return tx;
      }
    },
  };
}

// Re-export the SDK's AddressConversion for convenience
export { AddressConversion };
