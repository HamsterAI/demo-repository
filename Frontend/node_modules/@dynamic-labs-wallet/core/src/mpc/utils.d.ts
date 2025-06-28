import { ThresholdSignatureScheme } from './constants';
import { ENVIRONMENT_ENUM } from '../constants';
export declare const getMPCChainConfig: (chainName: string) => {
    derivationPath: number[];
    signingAlgorithm: import("./constants").SigningAlgorithm;
};
export declare const getTSSConfig: (thresholdSignatureScheme: ThresholdSignatureScheme) => {
    threshold: number;
    numberOfParties: number;
};
export declare const getClientThreshold: (thresholdSignatureScheme: ThresholdSignatureScheme) => number;
export declare const getDynamicServerThreshold: (thresholdSignatureScheme: ThresholdSignatureScheme) => number;
/**
 * Helper function to get the reshare config for client and server shares
 * @param {ThresholdSignatureScheme} oldThresholdSignatureScheme - The current threshold signature scheme
 * @param {ThresholdSignatureScheme} newThresholdSignatureScheme - The target threshold signature scheme
 * @returns {{
 *   existingClientShareCount: number,
 *   newClientShareCount: number,
 *   existingServerShareCount: number,
 *   newServerShareCount: number
 * }} The number of existing and new client and server shares needed
 */
export declare const getReshareConfig: ({ oldThresholdSignatureScheme, newThresholdSignatureScheme, }: {
    oldThresholdSignatureScheme: ThresholdSignatureScheme;
    newThresholdSignatureScheme: ThresholdSignatureScheme;
}) => {
    existingClientShareCount: number;
    newClientShareCount: number;
    existingServerShareCount: number;
    newServerShareCount: number;
};
/**
 * Helper function to get the reshare config for client and server shares
 * @param {ThresholdSignatureScheme} oldThresholdSignatureScheme - The current threshold signature scheme
 * @param {ThresholdSignatureScheme} newThresholdSignatureScheme - The target threshold signature scheme
 * @returns {{
 *   existingServerShareCount: number,
 *   newServerhareCount: number,
 *   existingDynamicServerShareCount: number,
 *   newDynamicServerShareCount: number
 * }} The number of existing and new client and server shares needed
 */
export declare const getServerWalletReshareConfig: ({ oldThresholdSignatureScheme, newThresholdSignatureScheme, }: {
    oldThresholdSignatureScheme: ThresholdSignatureScheme;
    newThresholdSignatureScheme: ThresholdSignatureScheme;
}) => {
    existingExternalServerShareCount: number;
    newExternalServerShareCount: number;
    existingDynamicServerShareCount: number;
    newDynamicServerShareCount: number;
};
export declare const URL_PATTERNS: {
    development: RegExp;
    preprod: RegExp;
    production: RegExp;
};
export declare function getEnvironmentFromUrl(url?: string): ENVIRONMENT_ENUM;
//# sourceMappingURL=utils.d.ts.map