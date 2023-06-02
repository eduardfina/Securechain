const {promises: fs} = require("fs");
const { GraphQLClient } = require("graphql-request");
const Config = require('../config/config.js')

const blockchainApiUrl = process.env.QUICKNODE_GRAPHQL_ENDPOINT;
const client = new GraphQLClient(blockchainApiUrl, {
    headers: { "x-api-key": `${process.env.QUICKNODE_GRAPHQL_API_KEY}` },
});

const SmartRepository = require("./SmartRepository");
const ContractRepository = require('./ContractRepository');

// TODO: For production environment create an efficient getUserAssets, Quicknode doesn't allow to get Sepolia Testnet NFTs metadata, doesn't allow to get user erc20 too.
// This solution is purely to give Sepolia assets information for the hackathon
exports.getUserAssets = async function (address) {
    const queryNFTs = `
        query Query($address: String!) {
          ethereumSepolia {
            walletByAddress(address: $address) {
              walletNFTs {
                edges {
                  node {
                    nft {
                      tokenId
                      metadata
                      contractAddress
                      contract {
                        name
                        symbol
                        address
                      }
                    }
                  }
                }
              }
            }
          }
        }`

    const response = await client.request(queryNFTs, {address: address});

    let NFTs = [];

    const getMetadata = async (NFT) => {
        NFT.node.nft.contract.address = SmartRepository.normalizeAddress(NFT.node.nft.contract.address);

        let identifier = {
            address: NFT.node.nft.contract.address,
            tokenId: NFT.node.nft.tokenId
        }

        let info = await exports.getInfoNFT(identifier);

        info['contract'] = NFT.node.nft.contract;
        info['tokenId'] = NFT.node.nft.tokenId;

        NFTs.push(info);
    }

    await Promise.all(response.ethereumSepolia.walletByAddress.walletNFTs.edges.map(getMetadata));

    const contracts = await ContractRepository.getAllTokenContracts();
    let tokens = [];

    const getTokenData = async (contract) => {
        let balance = await SmartRepository.call({address: contract, abi: Config.ERC20Abi}, "balanceOf", [address]);

        if(balance > 0) {
            const info = await exports.getInfoToken(contract);

            const token = {
                address: contract,
                name: info.name,
                symbol: info.symbol,
                decimals: info.decimals,
                balance
            }

            tokens.push(token);
        }
    }

    await Promise.all(contracts.map(getTokenData));

    return {
        nft: NFTs,
        token: tokens
    };
}

exports.getInfoToken = async function getInfoToken (address) {
    let name = await SmartRepository.call({address: address, abi: Config.ERC20Abi}, "name", []);
    let symbol = await SmartRepository.call({address: address, abi: Config.ERC20Abi}, "symbol", []);
    let decimals = await SmartRepository.call({address: address, abi: Config.ERC20Abi}, "decimals", []);

    return {name, symbol, decimals};
}

exports.getInfoNFT = async function getInfoNFT ({address, tokenId}) {
    let tokenURI = await SmartRepository.call({address, abi: Config.ERC721Abi}, "tokenURI", [tokenId]);

    if(tokenURI.includes("ipfs://"))
        tokenURI = ipfsToHttps(tokenURI);

    let json = {};
    try {
        const response = await fetch(tokenURI);
        let json = await response.json();

        if(json.image.includes("ipfs://"))
            json["image"] = ipfsToHttps(json.image);
    } catch (e) {
        console.log(e);
    }

    json["name"] = await SmartRepository.call({address: address, abi: Config.ERC721Abi}, "name", []);
    json["symbol"] = await SmartRepository.call({address: address, abi: Config.ERC721Abi}, "symbol", []);

    return json;
}

function ipfsToHttps (ipfs) {
    if(ipfs.includes("ipfs://")) {
        const strFile = ipfs.split("//");

        return "https://ipfs.io/ipfs/" + strFile[1];
    }

    return "";
}
