const {promises: fs} = require("fs");
const { GraphQLClient } = require("graphql-request");
const Config = require('../config/config.js')

const blockchainApiUrl = process.env.QUICKNODE_GRAPHQL_ENDPOINT;
const client = new GraphQLClient(blockchainApiUrl, {
    headers: { "x-api-key": `${process.env.QUICKNODE_GRAPHQL_API_KEY}` },
});

const SmartRepository = require("./SmartRepository");

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

    for(let NFT of response.ethereumSepolia.walletByAddress.walletNFTs.edges) {
        let identifier = {
            address: NFT.node.nft.contractAddress,
            tokenId: NFT.node.nft.tokenId
        }

        let info = await getInfoNFT(identifier);

        info['contract'] = NFT.node.nft.contract;

        NFTs.push(info);
    }

    const queryTokens = `
        query Query($address: String!) {
          ethereumSepolia {
            walletByAddress(address: $address) {
              tokenBalances {
                edges {
                  node {
                    contractAddress
                    totalBalance
                  }
                }
              }
            }
          }
        }`

    const tokens = await client.request(queryTokens, {address: address});



    return {
        nft: NFTs,
        token: tokens.ethereumSepolia.walletByAddress.tokenBalances.edges
    };
}

async function getInfoNFT ({address, tokenId}) {
    let tokenURI = await SmartRepository.call({address, abi: Config.ERC721Abi}, "tokenURI", [tokenId]);

    if(tokenURI.includes("ipfs://"))
        tokenURI = ipfsToHttps(tokenURI);

    const response = await fetch(tokenURI);
    const json = await response.json();

    if(json.image.includes("ipfs://"))
        json["image"] = ipfsToHttps(json.image);

    return json;
}

function ipfsToHttps (ipfs) {
    if(ipfs.includes("ipfs://")) {
        const strFile = ipfs.split("//");

        return "https://ipfs.io/ipfs/" + strFile[1];
    }

    return "";
}
