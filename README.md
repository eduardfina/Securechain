# Securechain

[VIDEO PRESENTATION](https://youtu.be/v-rs1eO-mZs)

## Installation

* Front-end (Client): Follow the README of [Client Folder](Client)
* Back-end (Server): Follow the README of [Server Folder](Server)
* Blockchain (Smart Contract): Follow the README of [Smart Contract Folder](Smart%20Contract)

## Inspiration

During the last few years more than $100 million worth of NFTs were stolen.

The power of the blockchain is at the same time its weakness: giving the user full responsibility for their data, the private key of your hot wallet can not be changed and sometimes can be compromised.

Many cases of NFT theft currently exist, and current NFT anti-theft schemes, such as transferring NFTs to cold wallets, make NFTs inconvenient to use.

With Securechain I wanted to do a system to have your NFT in your hot wallet, being able to use it, but at the same time having the security that no one could steal your NFTs in case they get your private key.

One year ago I was victim of a wallet draining attack, someone injected a malicious code in my PC and stole all the ether and NFTs I had on Metamask.

It wasn't a lot of money, but it got me thinking about how I could protect the wallets in these cases. I remembered that in most banking systems when a payment is made they ask for a validation step by email or sms before accepting it. I thought that with a hybrid system where transfer validations could be created onchain and could be accepted or rejected offchain I could avoid many cases of wallet draining.

With the release of Chainlink Functions I saw the possibility to create this system, and now that the Hackathon is over I can say that with Securechain I have created a hybrid transfer validation system to protect NFTs and Tokens in hot wallets against wallet draining attacks.

## What it does

### Blockchain

Although it was a Hackathon and the time was limited I wanted to create a Blockchain structure ready to be used as a real world service.

That's why I created two new ERC standards, ERC-721 and ERC-20 with a validation step. I presented the two standards as EIPs, the ERC-721 has been accepted, you can find it as the [EIP-6997](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-6997.md), and the ERC-20 is in process to be accepted as the EIP-7144.
These two standards have a validation step in every transfer and approve transactions, except transfer transactions from an approved address. I created this exception because right now a lot of DAOs request the user the allowance to move their assets and expect it to act like the ERC-721 or ERC-20 standards, with this small change the DAOs will be able to directly transfer the assets without noticing they are ERC-6997 or ERC-7144.

In an ideal case all the NFT Collections and Token Smart Contracts would use these two standards to protect the owners, but I knew to have better chances to success you should adapt to the actual market, not to expect the actual market to adapt to your project, and the actual market is plenty of ERC-721 and ERC-20.
With this in mind I created two wrapper Smart Contracts, `xNFTV.sol` and `xTokenV.sol` that allow you to migrate your NFTs and Tokens to the new secured standards. The migration will be done with the `upgrade()` function and can be reverted with the `downgrade()` function, this last function also require a validation step to protect your assets.

Now that we have the system to generate the secured NFTs and Tokens we can explain the core of the Blockchain structure.

The `Control.sol` Smart Contract allows the structure to control the secured assets. It has the `deployxNFTV()` and `deployxTokenV()` functions, passing as a parameter an NFT or Token Smart Contract address they will deploy an `xNFTV.sol` or `xTokenV.sol`. This deployed wrapper Smart Contracts will allow to migrate the assets to secured assets, for example a BAYC NFT into a xBAYC or the token USDC into xUSDC.
In the deployment it will set the `Control.sol` Smart Contract address as the validator address of the new wrappers.

After the deployments, the `Control.sol` have direct connection with Chainlink Functions to accept the validations of the wrappers. It requests the validation status with `executeRequest()` function and the DON fulfill the request with the `fulfillRequest()` function, in case is an accepted validation it calls the respective validation function of the wrapper (`validateTransfer()`/`validateApproval()`/`validationDowngrade()`).
The `executeRequest()` function can only be called by the validator address, this will be used by the Back-end of Securechain and can be changed by the contract owner as a recovery plan in case of a Back-end attack.

When I was developing the `Control.sol` the Smart Contract exceeded the limit code size introduced by Spurious Dragon, to solve this problem I created the `Deployer.sol` to deploy the wrappers and connected to the `Control.sol` using the interface `IDeployer.sol`. It also connects with the wrappers using the interface `IValidation.sol`, avoiding import the `xNFTV.sol` and `xTokenV.sol` Smart Contracts.

The owner of `Control.sol` MUST validate the validator address once a month using the `increaseActiveTime()` function, if not all the wrapped NFTs and Tokens will mutate and act like the ERC-721 and ERC-20 standards, allowing the users to directly transfer and approve their assets without the validation step.
It should never happen, but I didn't want to have the user assets blocked with the impossibility of validate the transfer or approve petitions in case Securechain shut down or disappear. My main goal was that the Blockchain structure would not depend on the Back-end and no matter what happened it could mutate and continue working without locking user assets.

With the normal ERC-721 and ERC-20 standards you have a full Blockchain security for your assets, with the Blockchain structure I created you have two steps security (Blockchain and Back-end).
Having the `Control.sol` Smart Contract as the validator of all the wrapped assets I saw the opportunity to create a third security type, the full Back-end security. Calling the function `validatePermission()` you'll access the Full Control mode giving the validator address the allowance to move all your wrapped assets.
With this mode you'll be able to transfer your NFTs and Tokens directly from Securechain. I don't recommend it, because it's a centralization of your assets, but maybe some users are afraid of losing their private key and prefer the traditional system where they can recover their password. It would allow to transfer your assets directly from the website (without wallet extension) and at the same time having your assets in your hot wallet.

This was an explanation of what the Blockchain Structure does on Securechain, if you want to learn more about how it works in the [Smart Contract Folder](https://github.com/eduardfina/Securechain/tree/main/Smart%20Contract) of the Github Repository you'll find all the Smart Contracts with all the functions commented and the EIPs of the new standards.

### Back-end

I developed a Back-end capable to connect with the Blockchain using a Quicknode endpoint. Although it first was a proof of concept Back-end I wanted to develop it with all possible security measures (users and oracles authentication, validation of ownership before address register, curated error handling for all the functions). The Back-end can accept validations but NEVER can change validation's information, this information is strictly registered in the Blockchain structure.

#### AuthController

The Authentication Controller contains all the authentication functions. It has the functions `login()`/`register()`, then to validate logged users before every private endpoint will use `isLoggedIn()` function. To finalize, with the function `isOracleAuth()` it will validate if the caller is a Chainlink Oracle, this function is required to call the close validation endpoint.

#### ContractsController

The Contract Controller contains all the functions related with the creation of the wrapper Smart Contracts. It allows to create the wrapper Smart Contract of an existent NFT or Token Smart Contract with the function `createContract()`. Also has a get of the Contracts by wrapper address or original address (ERC-721/ERC-20). To finalize it contains the functions to get the user assets, the secured and not secured ones using Quicknode Graph API.

#### PermissionController

The Permission Controller contains all the functions related with the Full Control mode. It allows the users to see if they are in Full Control mode and the transactions they did, deny the mode with the `denyPermission()` function or transfer NFTs and Tokens with the `sendNFT()`/`sendToken()` functions.

#### UserController

The User Controller contains all the functions related with the user information. It allows the user to get and edit his personal information and see if a username/email/address is taken.
The function `setAddress()` receive by parameter a signed message from the Front-end of which it recovers the user address.
Also, the `changePassword()` function encrypt the password before saving it in the database.

#### ValidationController

The Validation Controller is the most important one, it contains all the functions related with the validations. It allows the users to get the validations data and accept the validations with the function `acceptValidation()`. The function will call the `executeRequest()` function of the Control Smart Contract.
Also contains the `closeValidation()` function only callable by the Chainlink Oracles.

#### Events Listening

The Back-end needs to listen the Blockchain Smart Contracts to get the changes in the Blockchain structure.
With the Quicknode endpoint via websockets I created 6 Blockchain subscriptions to listen the new events and save the information in the database. The `subscriptionDeploy()` to get the new wrapper Smart Contracts data, the `subscriptionDowngrade()`/`subscriptionTransfer()`/`subscriptionApprove()` to get the new validation data, the `subscriptionValidated()` to get the accepted validations data and the `subscriptionFullControlTransactions()` to get the Full Control transactions.

#### SmartRepository

To facilitate interaction with the Blockchain I developed the SmartRepository, all the calls/transactions or other functionalities that require web3.js are packed into this Repository.

In the video you'll find an explanation of how the validation process works.

### Front-end

My main objective with Securechain was to develop a hybrid transfer validation system using Blockchain and Back-end. I'm not used to Front-end development and my focus was on Back-end and Blockchain development, but I wanted to create a Front-end to show how the users will interact with Securechain.
Although was not my first objective I created a quite complete Front-end.

It contains an authentication system with Login/Register pages and a Logout option, the authentication token will be stored in the local storage.

To do all the Blockchain operations I created a SmartRepository for the Front-end too, this one connects to the Blockchain using Metamask and ethers.js.

When the user is logged and have a Blockchain address will be able to navigate between the Assets and Validations pages. The first one will be used to generate wrapper Smart Contracts, Upgrade assets and Downgrade assets. The validations page will be used to accept the validations and see the closed ones.

In the Full Control page the user will need to accept the Full Control mode. If he accepts the mode he'll be able to directly transfer his wrapped assets.

## How I built it

Since it's a solo project I'm the Full-Stack developer of Securechain.
It was a busy month, I had to develop at the same time the Front-end, the Back-end, the Smart Contracts and lead the validation process of the two new EIPs.
I would like to thank the Chainlink Community and Quicknode Discord Community, when I had problems they helped me to solve them quickly.

### Front-end

I developed the Front-end using the Quasar Framework and ethers.js to connect with Metamask.

### Back-end

I developed the Back-end using Node.js and MongoDB.

To connect with the Blockchain I used Quicknode technologies, for the web3.js functions I used Quicknode http enpoint, to listen events I used Quicknode wss endpoint and to get the user assets I used Quicknode Graph API. I could have used the same http endpoint with the Token and NFT API v2 bundle to get the user assets, but I preferred to use the Graph API to use different technologies.

To send the validation emails I used SocketLabs

### Blockchain

I developed the Smart Contracts using Solidity and deployed it on the Ethereum Sepolia Testnet.

As a development environment to test and deploy I used Hardhat.

The Control Smart Contract uses the Chainlink Functions DON to connect with the Back-end.

## Challenges I ran into

This project is one of my most challenging implementations yet. I think the biggest challenge was to develop all the Securechain system considering all the vulnerabilities that the project could have while developing the Smart Contracts in the most optimal way. In other words, to find the ideal balance between security and gas fee costs.

To create the Control Smart Contract I had to downsize the contract in order to not exceed the contract size limit introduced in Spurious Dragon. To downsize it I separated the deployment functions into the Deployer Smart Contract and interact with it and the wrapper Smart Contracts using interfaces.

I could say that for me another challenge was the development of the Front-end, I'm not used to the Front-end development and I learned a lot with this project.

To finalize, the process of writing an EIP and publishing it was something totally different from the rest of the project.

## Accomplishments that I'm proud of

I'm proud of the full project, being able to develop something like Securechain alone at the level I did.

Although the Front-end was not my first priority and I'm not used to the Front-end development I'm proud of how the website looks.

The Back-end is not only a proof of concept, it contains a lot of security components, users and oracles authentication, validation of ownership before address register, encrypted passwords, curated error handling for all the functions.

The Blockchain Structure is ready to be used in a production environment as a real service, not just as a Hackathon project.

## What I learned

I learned a lot about the Chainlink products. At the start of the Hackathon I barely knew anything of how the oracles interact with the offchain world, now I can understand the utility of the oracles and all the Chainlink ecosystem. Also, I learned a lot about the Quicknode utilities.

I learned how to write and an EIP and the process of publishing it.

I learned a lot about Front-end development creating the user interface.

## What's next for Securechain

Securechain started as a Hackathon project, but it exists to solve a problem. I'm ready to develop it professionally and bring Securechain to the real world. To do it I'll follow the next steps:

### Front-end

Hire a Front-end developer to create a professional website.

### Back-end

The Back-end is developed using Node.js and Javascript, I used this technologies due to the limited Hackathon time. For more security I will migrate the Back-end to Nest.js and Typescript, also I will develop the Back-end in microservices, separating the one with the validations and the one with the validator address. The first one will have the accept validation system and the second one execute the validation request in the Blockchain. With this system the hackers will need to hack the two microservices to accept and process a validation.

### Blockchain

The Blockchain structure is already fantastic, I think I found a solid Smart Contracts structure to develop Securechain. I would try to find some gas optimization, maybe something at YUL level to save the validation's data.

### Monetization

The most important part of a project is to be profitable. I thought about some ways to monetize Securechain.

* Charge a small commission for every validation accepted, wrapper deployment or direct transfer from the Full Control mode. I already was testing this idea, if you take a look at the users model of the Back-end you can see they have a balance attribute, and at the UserController the depositCrypto function.
* Create a monthly subscription to use the service.
* Create our own token to spend for validations, wrapper deployments or direct transfers. Something like LINK from Chainlink.
