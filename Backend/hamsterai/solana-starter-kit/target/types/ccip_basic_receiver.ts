/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ccip_basic_receiver.json`.
 */
export type CcipBasicReceiver = {
  "address": "71FvYdgqSuSVvfNYyLUT8Qy16VSEVGd145v7sg8E3uDQ",
  "metadata": {
    "name": "ccipBasicReceiver",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "docs": [
    "CCIP Basic Receiver Program",
    "",
    "A Solana program that demonstrates how to receive and process CCIP messages.",
    "It supports receiving both arbitrary data and token transfers from other chains."
  ],
  "instructions": [
    {
      "name": "ccipReceive",
      "docs": [
        "Receive a CCIP message"
      ],
      "discriminator": [
        11,
        244,
        9,
        249,
        44,
        83,
        47,
        245
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The authority PDA from the offramp program that must sign the transaction",
            "This ensures only authorized offramp programs can call this function"
          ],
          "signer": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  120,
                  116,
                  101,
                  114,
                  110,
                  97,
                  108,
                  95,
                  101,
                  120,
                  101,
                  99,
                  117,
                  116,
                  105,
                  111,
                  110,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "const",
                "value": [
                  89,
                  54,
                  254,
                  202,
                  4,
                  47,
                  54,
                  31,
                  138,
                  243,
                  216,
                  94,
                  201,
                  203,
                  45,
                  43,
                  178,
                  219,
                  18,
                  129,
                  124,
                  96,
                  16,
                  13,
                  151,
                  1,
                  112,
                  110,
                  228,
                  195,
                  84,
                  95
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "offrampProgram"
            }
          }
        },
        {
          "name": "offrampProgram",
          "docs": [
            "The offramp program account",
            "Used for deriving PDA seeds"
          ]
        },
        {
          "name": "allowedOfframp",
          "docs": [
            "PDA from the router program that verifies this offramp is allowed",
            "If this PDA doesn't exist, the router doesn't allow this offramp"
          ]
        },
        {
          "name": "state",
          "docs": [
            "Program state account for verification"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "messagesStorage",
          "docs": [
            "Storage for received messages",
            "Will be updated with the latest message"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  115,
                  95,
                  115,
                  116,
                  111,
                  114,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "message",
          "type": {
            "defined": {
              "name": "any2SvmMessage"
            }
          }
        }
      ]
    },
    {
      "name": "closeStorage",
      "docs": [
        "Closes the messages storage account and returns lamports to the owner."
      ],
      "discriminator": [
        91,
        84,
        24,
        141,
        188,
        103,
        167,
        174
      ],
      "accounts": [
        {
          "name": "state",
          "docs": [
            "Program state account for owner verification and closing"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "messagesStorage",
          "docs": [
            "The messages storage account to close"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  115,
                  95,
                  115,
                  116,
                  111,
                  114,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "docs": [
            "The owner who will receive the rent lamports from the closed account"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program needed for closing accounts"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "getLatestMessage",
      "docs": [
        "Get the latest message received"
      ],
      "discriminator": [
        141,
        236,
        5,
        4,
        42,
        122,
        2,
        2
      ],
      "accounts": [
        {
          "name": "messagesStorage",
          "docs": [
            "The messages storage account to read from"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  115,
                  95,
                  115,
                  116,
                  111,
                  114,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "receivedMessage"
        }
      }
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the CCIP receiver program",
        "@param router - The CCIP router program ID"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The payer of the transaction, will become the owner"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "docs": [
            "The state account to be initialized"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "messagesStorage",
          "docs": [
            "Messages storage account to be initialized"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  115,
                  95,
                  115,
                  116,
                  111,
                  114,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "tokenAdmin",
          "docs": [
            "Token admin PDA that will have authority over all token accounts"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "Program state account for verification"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "router",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdrawTokens",
      "docs": [
        "Withdraw tokens from a program token account"
      ],
      "discriminator": [
        2,
        4,
        225,
        61,
        19,
        182,
        106,
        170
      ],
      "accounts": [
        {
          "name": "state",
          "docs": [
            "Program state account for verification"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "programTokenAccount",
          "docs": [
            "The token account owned by the program"
          ],
          "writable": true
        },
        {
          "name": "toTokenAccount",
          "docs": [
            "The destination token account"
          ],
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "The token mint"
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "The token program"
          ]
        },
        {
          "name": "tokenAdmin",
          "docs": [
            "The token admin PDA that has authority over program token accounts"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The authority (owner) of the program"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseState",
      "discriminator": [
        46,
        139,
        13,
        192,
        80,
        181,
        96,
        46
      ]
    },
    {
      "name": "messagesStorage",
      "discriminator": [
        77,
        193,
        189,
        128,
        132,
        219,
        78,
        170
      ]
    }
  ],
  "events": [
    {
      "name": "messageReceived",
      "discriminator": [
        231,
        68,
        47,
        77,
        173,
        241,
        157,
        166
      ]
    },
    {
      "name": "receiverInitialized",
      "discriminator": [
        237,
        24,
        23,
        23,
        78,
        35,
        102,
        162
      ]
    },
    {
      "name": "tokenReceived",
      "discriminator": [
        251,
        126,
        204,
        211,
        2,
        159,
        194,
        227
      ]
    },
    {
      "name": "tokensForwarded",
      "discriminator": [
        212,
        65,
        10,
        42,
        211,
        229,
        226,
        204
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidCaller",
      "msg": "Caller is not the configured CCIP router"
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "Unauthorized: Signer is not the program owner"
    },
    {
      "code": 6002,
      "name": "invalidRemainingAccounts",
      "msg": "Invalid remaining accounts structure for token transfer"
    },
    {
      "code": 6003,
      "name": "invalidTokenAccountOwner",
      "msg": "Provided token account owner does not match token program"
    },
    {
      "code": 6004,
      "name": "invalidTokenAdmin",
      "msg": "Provided token admin PDA is incorrect"
    },
    {
      "code": 6005,
      "name": "messageDataTooLarge",
      "msg": "Message data exceeds the maximum allowed size for this receiver"
    },
    {
      "code": 6006,
      "name": "tooManyTokens",
      "msg": "Number of tokens exceeds the maximum allowed for this receiver"
    },
    {
      "code": 6007,
      "name": "senderAddressTooLarge",
      "msg": "Sender address exceeds the maximum allowed size for this receiver"
    }
  ],
  "types": [
    {
      "name": "any2SvmMessage",
      "docs": [
        "Struct representing a cross-chain message format from any chain to Solana VM"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "messageId",
            "docs": [
              "Unique identifier of the cross-chain message"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceChainSelector",
            "docs": [
              "Identifier of the source blockchain (chain selector)"
            ],
            "type": "u64"
          },
          {
            "name": "sender",
            "docs": [
              "Address of the sender on the source chain (in bytes)"
            ],
            "type": "bytes"
          },
          {
            "name": "data",
            "docs": [
              "Arbitrary data payload in the message"
            ],
            "type": "bytes"
          },
          {
            "name": "tokenAmounts",
            "docs": [
              "List of token transfers included in the message"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "svmTokenAmount"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "baseState",
      "docs": [
        "Core state account for the CCIP Receiver program",
        "This account stores essential configuration like owner and router"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The owner of this CCIP Receiver program"
            ],
            "type": "pubkey"
          },
          {
            "name": "router",
            "docs": [
              "The CCIP Router program ID that this receiver works with"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "messageReceived",
      "docs": [
        "Event emitted when a cross-chain message is received"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "messageId",
            "docs": [
              "Unique identifier of the cross-chain message"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceChainSelector",
            "docs": [
              "Identifier of the source blockchain (chain selector)"
            ],
            "type": "u64"
          },
          {
            "name": "sender",
            "docs": [
              "Address of the sender on the source chain (in bytes)"
            ],
            "type": "bytes"
          },
          {
            "name": "dataLength",
            "docs": [
              "Length of the data payload in the message"
            ],
            "type": "u64"
          },
          {
            "name": "tokenCount",
            "docs": [
              "Number of token transfers included in the message"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "messageType",
      "docs": [
        "Enum representing different types of cross-chain messages"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "tokenTransfer"
          },
          {
            "name": "arbitraryMessaging"
          },
          {
            "name": "programmaticTokenTransfer"
          }
        ]
      }
    },
    {
      "name": "messagesStorage",
      "docs": [
        "Account for storing received cross-chain messages",
        "Keeps track of the latest message and some metadata"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastUpdated",
            "docs": [
              "Timestamp of when this storage was last updated"
            ],
            "type": "i64"
          },
          {
            "name": "messageCount",
            "docs": [
              "Total count of messages received since initialization"
            ],
            "type": "u64"
          },
          {
            "name": "latestMessage",
            "docs": [
              "The most recently received cross-chain message"
            ],
            "type": {
              "defined": {
                "name": "receivedMessage"
              }
            }
          }
        ]
      }
    },
    {
      "name": "receivedMessage",
      "docs": [
        "Struct representing a received cross-chain message"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "messageId",
            "docs": [
              "Unique identifier of the cross-chain message"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "messageType",
            "docs": [
              "Type of the message (token transfer, arbitrary message, or both)"
            ],
            "type": {
              "defined": {
                "name": "messageType"
              }
            }
          },
          {
            "name": "data",
            "docs": [
              "Arbitrary data payload in the message"
            ],
            "type": "bytes"
          },
          {
            "name": "tokenAmounts",
            "docs": [
              "List of token transfers included in the message"
            ],
            "type": {
              "vec": {
                "defined": {
                  "name": "svmTokenAmount"
                }
              }
            }
          },
          {
            "name": "receivedTimestamp",
            "docs": [
              "Timestamp when the message was received"
            ],
            "type": "i64"
          },
          {
            "name": "sourceChainSelector",
            "docs": [
              "Identifier of the source blockchain (chain selector)"
            ],
            "type": "u64"
          },
          {
            "name": "sender",
            "docs": [
              "Address of the sender on the source chain (in bytes)"
            ],
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "receiverInitialized",
      "docs": [
        "Event emitted when the receiver program is initialized"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "The pubkey of the program owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "router",
            "docs": [
              "The pubkey of the router program"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "svmTokenAmount",
      "docs": [
        "Struct representing a token amount in a cross-chain transfer"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "docs": [
              "The mint address of the token on Solana"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens (denominated in Solana token amount)"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenReceived",
      "docs": [
        "Event emitted when tokens are received in a cross-chain transfer"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "docs": [
              "The mint address of the received token"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens received"
            ],
            "type": "u64"
          },
          {
            "name": "index",
            "docs": [
              "Index of the token in the message's token list"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokensForwarded",
      "docs": [
        "Event emitted when tokens are forwarded to a recipient"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token",
            "docs": [
              "The mint address of the forwarded token"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens forwarded"
            ],
            "type": "u64"
          },
          {
            "name": "recipient",
            "docs": [
              "The recipient's token account address"
            ],
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
