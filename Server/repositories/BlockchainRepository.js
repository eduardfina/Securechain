const {promises: fs} = require("fs");
const { GraphQLClient } = require("graphql-request");

const blockchainApiUrl = process.env.QUICKNODE_GRAPHQL_ENDPOINT;
const client = new GraphQLClient(blockchainApiUrl, {
    headers: { "x-api-key": `${process.env.QUICKNODE_GRAPHQL_API_KEY}` },
});


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
                      name
                    }
                  }
                }
              }
            }
          }
        }`

    const NFTs = await client.request(queryNFTs, {address: address});

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

    const data = {
        nft: NFTs.ethereumSepolia.walletByAddress.walletNFTs.edges,
        token: tokens.ethereumSepolia.walletByAddress.tokenBalances.edges
    }

    return data;
}