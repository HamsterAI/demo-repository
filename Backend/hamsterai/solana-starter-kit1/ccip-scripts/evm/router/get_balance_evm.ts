import { ethers, Wallet } from "ethers";
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1/.env' });

// 标准ERC20 ABI（只包含balanceOf方法）
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export async function getBalanceEvm(tokenAddress?: string) {
  try {
    const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;
    if (!ETHEREUM_RPC_URL) throw new Error("ETHEREUM_RPC_URL is not set");

    const ethereumPrivateKey = process.env.EVM_PRIVATE_KEY;
    if (!ethereumPrivateKey) throw new Error("EVM_PRIVATE_KEY is not set");

    const wallet = new Wallet(ethereumPrivateKey);
    const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

    if (tokenAddress) {
      // check token balance ERC20
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(wallet.address),
        tokenContract.decimals().catch(() => 18) // some contracts don't have decimals, default 18
      ]);
      return {
        //address: wallet.address,
        //tokenAddress,
        rawBalance: balance.toString(),
        formattedBalance: ethers.formatUnits(balance, decimals),
        decimals
      };
    } else {
      // check ETH balance
      const balance = await provider.getBalance(wallet.address);
      return {
        //address: wallet.address,
        //tokenAddress: wallet.address,
        rawBalance: balance.toString(),
        formattedBalance: ethers.formatEther(balance),
        decimals: 18
      };
    }
  } catch (err: any) {
    return { error: err.message };
  }
}