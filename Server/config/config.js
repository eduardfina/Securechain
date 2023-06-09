// Load Environment variables
require('dotenv').config() // might remove for kubernetes
verifyEnvironmentVars()

const configuration = {
    defaultPort: parseInt(process.env.API_SERVICE_PORT || '3002'),
    defaultNetwork: process.env.NETWORK_NAME,
    xNFTVContractAbi: JSON.parse(process.env.XNFTV_CONTRACT_ABI),
    xTokenVContractAbi: JSON.parse(process.env.XTOKENV_CONTRACT_ABI),
    ERC20Abi: JSON.parse(process.env.ERC20_ABI),
    ERC721Abi: JSON.parse(process.env.ERC721_ABI),
    quicknode_graphql: {
        url: "https://api.quicknode.com/graphql",
        apiKey: process.env.QUICKNODE_GRAPHQL_API_KEY
    },
    control: {
        address: process.env.CONTROL_ADDRESS,
        abi: JSON.parse(process.env.CONTROL_ABI)
    },
    networks: {
        localhost: {
            name: 'localhost',
            host: 'http://127.0.0.1:8545',
            gasPrice: 0,
        },
        sepolia: {
            name: 'sepolia',
            host: `https://crimson-fluent-arrow.ethereum-sepolia.quiknode.pro/` + process.env.QUICKNODE_API_KEY,
            wss: `wss://crimson-fluent-arrow.ethereum-sepolia.quiknode.pro/` + process.env.QUICKNODE_API_KEY,
            gasPrice: 300000
        }
    },
    account: {
        address: process.env.ETH_CALLER_WALLET_ADDRESS  || '',
        pk: process.env.ETH_CALLER_WALLET_PRIVATE_KEY || '',
    },
    codeLocation: 0,
    codeLanguage: 0,
    subscriptionId: process.env.SUBSCRIPTION_ID,
    secrets: process.env.SECRETS
}
// Export configuration
module.exports = configuration

loadNetwork()

// Ensure all secret information is read from environment
function verifyEnvironmentVars() {
    const requiredEnvVars = [
        'API_SERVICE_PORT',
        'NETWORK_NAME',
        // Contract ABIs
        'XNFTV_CONTRACT_ABI',
        'XTOKENV_CONTRACT_ABI',
        'ERC20_ABI',
        'ERC721_ABI',
        // QUICKNODE
        'QUICKNODE_API_KEY',
        'QUICKNODE_GRAPHQL_API_KEY',
        // Control
        'CONTROL_ADDRESS',
        'CONTROL_ABI',
        // Ethereum: Caller Wallet
        'ETH_CALLER_WALLET_ADDRESS',
        'ETH_CALLER_WALLET_PRIVATE_KEY',
        // DON Secrets
        'SECRETS'
    ]

    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Error: ${key} is unset!`)
            process.exit(1)
        }
    })

    console.log(`Environment variables loaded successfully!`)
}
function loadNetwork() {
    console.log(`Configuring the network ${configuration.defaultNetwork}`)
    if (!configuration.networks[configuration.defaultNetwork]) {
        console.error(`Error: network ${configuration.defaultNetwork} doesn't exists!`)
        process.exit(1)
    }
    configuration.network = configuration.networks[configuration.defaultNetwork]
}
