# Blockchain Installation

The Smart Contracts will be deployed on the Sepolia Testnet.

## 1- Environment File

Create a `.env` file with the following variables:

* QUICKNODE_API_KEY: The Quicknode API KEY (Also remember to change your Quicknode URL in `hardhat.config.js`)
* ETH_CALLER_WALLET_PRIVATE_KEY: The Private Key to deploy the Blockchain infrastructure (It must be approved for the Chainlink Functions BETA and own enough LINK)
* ETH_VALIDATOR_ADDRESS: The address you want to be the validator address.

## 2- Install the dependencies

Using npm install the dependencies:

```
npm install
```

## 3- Compile and Deploy the Smart Contracts

Before the deployment is important to compile the Smart Contracts to avoid some errors:

```
npm run build
```

If the Smart Contracts compiled successfully we can deploy the Smart Contracts.

Make sure your address is approved to use Chainlink Functions BETA and have at least 1 LINK.

The following command will deploy the Smart Contracts and create a subscription with 1 LINK (it will take a short while):

```
npm run deployControl
```

The Control Address and Subscription Id will be used in the Back-end Installation.

The Blockchain Structure is successfully deployed on the Sepolia Testnet!
