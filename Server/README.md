# Back-end Installation

The Server will be running in localhost.

## 1- Environment File

Create a .env file with the following variables:

* API_SERVICE_PORT: The Server listening port.
* MongoDB configuration, an example for localhost can be: 

```
MONGO_DSN=mongodb://localhost:27017/local
MONGO_DATABASE=local
MONGO_USER=
MONGO_PASSWORD=
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=
```

* QUICKNODE_API_KEY: Quicknode EP API-KEY.
* QUICKNODE_GRAPHQL_API_KEY: Quicknode Graph API-KEY.
* SECRET: Secret to encrypt the generate authentication tokens, can be a random string.
* NETWORK_NAME: The Blockchain network where the Smart Contracts are deployed, use "sepolia".
* ETH_CALLER_WALLET_ADDRESS: The public key of the validator address.
* ETH_CALLER_WALLET_PRIVATE_KEY: The private key of the validator address.
* CONTROL_ADDRESS: The Control Smart Contract address we deployed in the Blockchain Installation.
* CONTROL_ABI: The Control Smart Contract abi (in artifacts folder after Blockchain Installation).
* XNFTV_CONTRACT_ABI: The xNFTV Smart Contract abi (in artifacts folder after Blockchain Installation).
* ERC20_ABI: The ERC20 Standard abi.
* ERC721_ABI: The ERC721 Standard abi.
* SECRETS: The Chainlink Secrets array with the oracle authentication token as "API_KEY", can use the `/generate` EP to generate the oracle token.
* SUBSCRIPTION_ID: The Chainlink Subscription ID we created in the Blockchain Installation.

SocketLabs authentication, as soon as I don't have SocketLabs subscription anymore I removed the send email calls. If you want to recover it is ready to use in `EmailRepository.js`, it will require the following environment variables:

* SOCKETLABS_USER (optional)
* SOCKETLABS_PASSWORD (optional)

## 2- DON Request API Endpoint

The file `request.js` of requests folder is the one the DON will execute. It will call the endpoints `/isValid` and `/closeValidation`.

The variable "API_ENDPOINT" of the file `request.js` must be changed with the API url.

To locally test it I used ngrok, it creates a forwarding link to connect your localhost to the internet.
An example of generated link to use as API_ENDPOINT could be "https://5ab2-83-45-100-118.eu.ngrok.io".

It's easy to use, can find more documentation at [ngrok](https://ngrok.com/).

## 3- Install the dependencies


Using npm install the dependencies:

```
npm install
```

## 4- Run the Server

With npm run the Server:

```
npm run start
```

Finally, we have our Server running, listening the Blockchain and the API requests.

**Note:** Maybe you'll notice when upgrade your assets you still have your normal asset and not the wrapped one, or vice-versa with the downgrade.
This is a problem of Quicknode, the project get the user assets using their Graph API, and at least at the Sepolia Testnet they don't refresh the NFTs information instantly, can take a while to see your assets updated.