export declare enum SigningAlgorithm {
    ECDSA = "ECDSA",
    ED25519 = "ED25519",
    BIP340 = "BIP340"
}
export declare const BITCOIN_DERIVATION_PATHS: {
    LEGACY: number[];
    NATIVE_SEGWIT: number[];
    SEGWIT: number[];
};
export declare const MPC_CHAIN_CONFIG: Record<string, {
    derivationPath: number[];
    signingAlgorithm: SigningAlgorithm;
}>;
export declare enum ThresholdSignatureScheme {
    TWO_OF_TWO = "TWO_OF_TWO",
    TWO_OF_THREE = "TWO_OF_THREE",
    THREE_OF_FIVE = "THREE_OF_FIVE"
}
export declare const MPC_CONFIG: {
    TWO_OF_TWO: {
        numberOfParties: number;
        threshold: number;
        clientThreshold: number;
        dynamicServerThreshold: number;
    };
    TWO_OF_THREE: {
        numberOfParties: number;
        threshold: number;
        clientThreshold: number;
        dynamicServerThreshold: number;
    };
    THREE_OF_FIVE: {
        numberOfParties: number;
        threshold: number;
        clientThreshold: number;
        dynamicServerThreshold: number;
    };
};
export declare enum CreateRoomPartiesOptions {
    THRESHOLD = "threshold",
    FULL = "full"
}
//# sourceMappingURL=constants.d.ts.map