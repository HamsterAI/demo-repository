import { executeCCIPScript, CCIPMessageConfig } from '../utils';
import { ChainId, getCCIPSVMConfig, CHAIN_SELECTORS, FeeTokenType as ConfigFeeTokenType } from '../../config';

/**
 * 通过参数调用tokenTransfer核心逻辑，供HTTP API使用
 */
export async function runTokenTransfer({ tokenMint, tokenAmount, fromChain, toChain, receiver }) {
  // 获取配置
  const config = getCCIPSVMConfig(ChainId.SOLANA_DEVNET);

  // 构建CCIP消息配置
  const CCIP_MESSAGE_CONFIG: CCIPMessageConfig = {
    destinationChain: ChainId.ETHEREUM_SEPOLIA, // TODO: 可根据toChain参数动态调整
    destinationChainSelector: CHAIN_SELECTORS[ChainId.ETHEREUM_SEPOLIA].toString(),
    evmReceiverAddress: receiver,
    tokenAmounts: [
      {
        tokenMint: tokenMint || config.bnmTokenMint,
        amount: tokenAmount,
      },
    ],
    feeToken: ConfigFeeTokenType.NATIVE,
    messageData: '',
    extraArgs: {
      gasLimit: 0,
      allowOutOfOrderExecution: true,
    },
  };

  // 脚本配置
  const SCRIPT_CONFIG = {
    computeUnits: 1_400_000,
    minSolRequired: 0.005,
    defaultExtraArgs: {
      gasLimit: 0,
      allowOutOfOrderExecution: true,
    },
  };

  // 直接调用核心执行函数
  await executeCCIPScript({
    scriptName: 'token-transfer',
    usageName: 'svm:token-transfer',
    messageConfig: CCIP_MESSAGE_CONFIG,
    scriptConfig: SCRIPT_CONFIG,
    cmdOptions: {}, // 可扩展支持更多参数
  });

  return { success: true };
} 