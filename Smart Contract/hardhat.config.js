require("@nomiclabs/hardhat-waffle")
require('solidity-coverage');

// Load Environment variables
require('dotenv').config() // might remove for kubernetes
verifyEnvironmentVars()

task("accounts", "Prints the list of accounts", async (_, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

const SOLC_SETTINGS = {
    optimizer: {
        enabled: true,
        runs: 1_000,
    },
}

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: SOLC_SETTINGS,
            },
            {
                version: "0.8.7",
                settings: SOLC_SETTINGS,
            },
            {
                version: "0.7.0",
                settings: SOLC_SETTINGS,
            },
            {
                version: "0.6.6",
                settings: SOLC_SETTINGS,
            },
            {
                version: "0.4.24",
                settings: SOLC_SETTINGS,
            },
        ],
    },
    networks: {
        hardhat: {
            blockGasLimit: 100000000
        },
        sepolia: {
            url: `https://crimson-fluent-arrow.ethereum-sepolia.quiknode.pro/${process.env.QUICKNODE_API_KEY}`,
            accounts: [process.env.ETH_CALLER_WALLET_PRIVATE_KEY],
            linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
            linkPriceFeed: "0x42585eD362B3f1BCa95c640FdFf35Ef899212734",
            functionsOracleProxy: "0x649a2C205BE7A3d5e99206CEEFF30c794f0E31EC",
            functionsBillingRegistryProxy: "0x3c79f56407DCB9dc9b852D139a317246f43750Cc"
        }
    },
    namedAccounts: {
        deployer: 0
    }
}

// Ensure all secret information is read from environment
function verifyEnvironmentVars() {
    const requiredEnvVars = [
        // QUICKNODE
        'QUICKNODE_API_KEY',
        // Ethereum: Caller Wallet
        'ETH_CALLER_WALLET_PRIVATE_KEY'
    ]

    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Error: ${key} is unset!`)
            process.exit(1)
        }
    })

    console.log(`Environment variables loaded successfully!`)
}
