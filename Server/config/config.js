// Load Environment variables
require('dotenv').config() // might remove for kubernetes
verifyEnvironmentVars()

const configuration = {
    defaultPort: parseInt(process.env.API_SERVICE_PORT || '3002'),
    dbHost: process.env.DB_HOST,
    defaultNetwork: process.env.NETWORK_NAME,
    xNFTVContractAbi: JSON.parse(process.env.XNFTV_CONTRACT_ABI),
    xTokenVContractAbi: JSON.parse(process.env.XTOKENV_CONTRACT_ABI),
    ERC20Abi: JSON.parse(process.env.ERC20_ABI),
    ERC721Abi: JSON.parse(process.env.ERC721_ABI),
    quicknode_graphql: {
        url: process.env.QUICKNODE_GRAPHQL_ENDPOINT,
        apiKey: process.env.QUICKNODE_API_KEY
    },
    control: {
        address: process.env.CONTROL_ADDRESS,
        abi: JSON.parse(process.env.CONTROL_ABI)
    },
    network: {},
    networks: {
        localhost: {
            name: 'localhost',
            host: 'http://127.0.0.1:8545',
            gasPrice: 0,
        },
        sepolia: {
            name: 'sepolia',
            host: `https://solemn-long-dust.ethereum-sepolia.discover.quiknode.pro/` + process.env.QUICKNODE_API_KEY,
            gasPrice: 300000
        }
    },
    account: {
        address: process.env.ETH_CALLER_WALLET_ADDRESS  || '',
        pk: process.env.ETH_CALLER_WALLET_PRIVATE_KEY || '',
    },
    codeLocation: 0,
    codeLanguage: 0,
    subscriptionId: 157
}
// Export configuration
module.exports = configuration

loadNetwork()

// Ensure all secret information is read from environment
function verifyEnvironmentVars() {
    const requiredEnvVars = [
        'API_SERVICE_PORT',
        'DB_HOST',
        'NETWORK_NAME',
        // QUICKNODE
        'QUICKNODE_API_KEY',
        // Ethereum: Caller Wallet
        'ETH_CALLER_WALLET_PRIVATE_KEY',
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
