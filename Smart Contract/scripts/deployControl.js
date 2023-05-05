const {ethers} = require("hardhat");
const {networks} = require("../hardhat.config");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Control = await ethers.getContractFactory("Control");
    const control = await Control.deploy(networks["sepolia"]["functionsOracleProxy"], "0x5Ce8C624286e91b44e5278FA446c36C2b017bfe8");

    console.log("Control address: ", control.address);

    await control.increaseActiveTime();

    console.log("Active control time increased, 1 month");

    const Deployer = await ethers.getContractFactory("Deployer");
    const dep = await Deployer.deploy(control.address);

    console.log("Deployer address: ", dep.address);

    let res = await control.setDeployer(dep.address);

    console.log("Deployer connected to Control");

    const RegistryFactory = await ethers.getContractFactory(
        "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
    )
    const registry = await RegistryFactory.attach(networks["sepolia"]["functionsBillingRegistryProxy"]);

    const createSubscriptionTx = await registry.createSubscription();

    console.log("Creating subscription, waiting 2 blocks...")
    const createSubscriptionReceipt = await createSubscriptionTx.wait(2);

    const subscriptionId = createSubscriptionReceipt.events[0].args["subscriptionId"].toNumber();

    console.log("Subscription created with ID: ", subscriptionId);

    const LinkTokenFactory = await ethers.getContractFactory("LinkToken");
    const linkToken = await LinkTokenFactory.attach(networks["sepolia"]["linkToken"]);

    const fundTx = await linkToken.transferAndCall(
        networks["sepolia"]["functionsBillingRegistryProxy"],
        ethers.utils.parseUnits("10"),
        ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
    );

    console.log("Funding subscription, waiting 2 blocks...");
    await fundTx.wait(2);
    console.log("Subscription " + subscriptionId + "funded with " + ethers.utils.formatEther("10000000000000000000") + " LINK");

    const addTx = await registry.addConsumer(subscriptionId, control.address);
    console.log("Adding Consumer, waiting 2 blocks...");
    await addTx.wait(2)

    console.log("Authorized consumer contract:" + control.address);

    console.log("SUBSCRIPTION DATA:");
    const subInfo = await registry.getSubscription(subscriptionId)
    console.log(`\nCreated subscription with ID: ${subscriptionId}`)
    console.log(`Owner: ${subInfo[1]}`)
    console.log(`Balance: ${ethers.utils.formatEther(subInfo[0])} LINK`)
    console.log(`${subInfo[2].length} authorized consumer contract${subInfo[2].length === 1 ? "" : "s"}:`)
    console.log(subInfo[2])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });