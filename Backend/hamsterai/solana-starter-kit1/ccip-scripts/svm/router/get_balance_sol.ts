import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import{getAssociatedTokenAddressSync,getAccount,TOKEN_PROGRAM_ID} from "@solana/spl-token";
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1/.env' });
import { Wallet,ethers } from 'ethers';

export async function getBalanceSolana(tokenMint){
    try{
        const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ;
        if(!SOLANA_RPC_URL) throw new Error("SOLANA_RPC_URL is not set");

        // get solana address
        const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY;
        if(!solanaPrivateKey) throw new Error("SOLANA_PRIVATE_KEY is not set");
        const solanaAddress = Keypair.fromSecretKey(Buffer.from(process.env.SOLANA_PRIVATE_KEY,"hex"));


        // get solana connection
        const solanaConnection = new Connection(SOLANA_RPC_URL);
        
        if(tokenMint){
            const associatedTokenAddress = getAssociatedTokenAddressSync(tokenMint,solanaAddress.publicKey);

            const accountInfo = await getAccount(solanaConnection,associatedTokenAddress);
            return accountInfo.amount;
        }
        else {
            const accounts = await solanaConnection.getParsedTokenAccountsByOwner(
                new PublicKey(solanaAddress.publicKey),
                { programId: TOKEN_PROGRAM_ID }
              );
              accounts.value.forEach(({ account }) => {
                const info = account.data.parsed.info;
                console.log('Token Mint:', info.mint, '余额:', info.tokenAmount.uiAmountString);
              });
        }

    }catch(error){
        console.error(error);
        return null;
    }

}