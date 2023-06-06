# Inspiration

During the last few years more than $100 million worth of NFTs were stolen. 

The power of the blockchain is at the same time its weakness: giving the user full responsibility for their data, the private key of your hot wallet can not be changed and sometimes can be compromised.

Many cases of NFT theft currently exist, and current NFT anti-theft schemes, such as transferring NFTs to cold wallets, make NFTs inconvenient to use.

With Securechain I wanted to do a system to have your NFT in your hot wallet, being able to use it, but at the same time having the security that no one could steal your NFTs in case they get your private key.

One year ago I was victim of a wallet draining attack, someone injected a malicious code in my PC and steal all the ether and NFTs I had on Metamask.

It wasn't a lot of money, but it got me thinking about how I could protect the wallets in these cases. I remembered that in most banking systems when a payment is made they ask for a validation step by email or sms before accepting it. I thought that with a hybrid system where onchain transfer validations could be created and offchain could be accepted or rejected I could avoid many cases of wallet draining.

With the release of Chainlink Functions I saw the possibility to create this system, and now that the Hackathon is over I can say that with Securechain I have created a hybrid transfer validation system to protect NFTs and Tokens in hot wallets.

# What it does

## Blockchain

Although it was a Hackathon and the time was limited I wanted to create a Blockchain structure ready to be used as a real world service.

That's why I created two new ERC standards, ERC-721 and ERC-20 with a validation step. I presented the two standards as EIPs, the ERC-721 has been accepted, you can find it as the [EIP-6997](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-6997.md), and the ERC-20 is in process to be accepted as the EIP-7144.
These two standards have a validation step in every transfer and approve transactions, except transfer transactions from an approved address. I created this exception because right now a lot of DAOs request the user the allowance to move their assets and expect it to act like the ERC-721 or ERC-20 standards, with this small change the DAOs will be able to directly transfer the assets without noticing they are ERC-6997 or ERC-7144.

In an ideal case all the NFT Collections and Token Smart Contracts would use these two standards to protect the owners, but I knew to have better chances to success you should adapt to the actual market and not expect the actual market to adapt to your project, and the actual market is plenty of ERC-721 and ERC-20.
With this in mind I created two wrapper Smart Contracts, `xNFTV.sol` and `xTokenV.sol` that allow you to migrate your NFTs and Tokens to the new secured standards. The migration will be done with the `upgrade()` function and can be reverted with the `downgrade()` function, this last function also require a validation step to protect your assets.

Now that we have the system to generate the secured NFTs and Tokens we can explain the core of the Blockchain structure. 

The `Control.sol` Smart Contract allow the structure to control the secured assets. It has the `deployxNFTV()` and `deployxTokenV()` functions, passing as a parameter an NFT or Token Smart Contract address they will deploy an `xNFTV.sol` or `xTokenV.sol`. This deployed wrapper Smart Contracts will allow to migrate the assets to secured assets, for example a BAYC NFT into a xBAYC or the token USDC into a xUSDC.
In the deployment it will set the `Control.sol` Smart Contract address as the validator address of the new wrappers.

After the deployments, the `Control.sol` have direct connection with Chainlink Functions to accept the validations of the wrappers. It requests the validation status with `executeRequest()` function and the DON fulfill the request with the `fulfillRequest()` function, in case is an accepted validation it calls the respective validation function of the wrapper (`validateTransfer()`/`validateApproval()`/`validationDowngrade()`).
The `executeRequest()` function can only be called by the validator address, this will be used by the Back-end of Securechain and can be changed by the contract owner as a recovery plan in case of a Back-end attack.

When I was developing the `Control.sol` the Smart Contract exceeds the limit code size introduced by Spurious Dragon, to solve this problem I created the `Deployer.sol` to deploy the wrappers and connected to the `Control.sol` using the interface `IDeployer.sol`. It also connects with the wrappers using the interface `IValidation.sol`, avoiding import the `xNFTV.sol` and `xTokenV.sol` Smart Contracts.

The owner of `Control.sol` MUST validate the validator address once a month using the `increaseActiveTime()` function, if not all the wrapped NFTs and Tokens will mutate and act like the ERC-721 and ERC-20 standards, allowing the users to directly transfer and approve their assets without the validation step.
It should never happen, but I didn't want to have the user assets blocked with the impossibility of validate the transfer or approve petitions in case Securechain shut down or disappear. My main goal was that the Blockchain structure would not depend on the Back-end and no matter what happened it could mutate and continue working without locking user assets.

With the normal ERC-721 and ERC-20 standards you have a full Blockchain security for your assets, with the Blockchain Structure I created you have two steps security (Blockchain and Back-end).
Having the `Control.sol` Smart Contract as the validator of all the wrapped assets I saw the opportunity to create a third security type, the full Back-end security. Calling the function `validatePermission()` you'll access the Full Control mode giving the validator address the allowance to move all your wrapped assets.
With this mode you'll be able to transfer your NFTs and Tokens directly from Securechain. I don't recommend it, because it's a centralization of your assets, but maybe some users are afraid of losing their private key and prefer the traditional system where they can recover their password. It would allow to transfer your assets directly from the website (without wallet extension) and at the same time having your assets in your hot wallet.

This was an explanation of what the Blockchain Structure does on Securechain, if you want to learn more about how it works in the [Smart Contract Folder](https://github.com/eduardfina/Securechain/tree/main/Smart%20Contract) of the Github Repository you'll find all the Smart Contracts with all the functions commented and the EIPs of the new standards.

## Back-end

