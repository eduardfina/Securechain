const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Verifier", function () {
    let users = [];
    let VerifierFac = null;
    let Verifier = null;
    let BasicTokenFac = null;
    let BasicToken = null;

    beforeEach(async function() {
        users = await ethers.getSigners();
        VerifierFac = await ethers.getContractFactory("Verifier");
        Verifier = await VerifierFac.deploy(users[1].address);
        await Verifier.deployed();

        BasicTokenFac = await ethers.getContractFactory("BasicToken");
        BasicToken = await BasicTokenFac.deploy();
        await BasicToken.deployed();

        await BasicToken.mint(1000);
        await BasicToken.increaseAllowance(Verifier.address, 1000);
    });
    afterEach(function() {
        users = null;
        VerifierFac = null;
        Verifier = null;
        BasicTokenFac = null;
        BasicToken = null;
    });
    it("Test deploy", async function () {
        expect((await Verifier.validator())).to.equal(users[1].address);
    });
    it("Test receiveToken", async function () {
        await Verifier.receiveToken(BasicToken.address, 500);

        expect((await Verifier.accountStorage(users[0].address, BasicToken.address))).to.equal(500);
    });
    it("Test transferToken not enough balance", async function () {
       await expect(Verifier.transferToken(BasicToken.address, users[1].address, 200))
           .to.be.revertedWith("transferToken: Not enough balance");
    });
    it("Test transferToken", async function () {
        await Verifier.receiveToken(BasicToken.address, 500);

        await Verifier.transferToken(users[1].address, BasicToken.address, 200);

        expect((await Verifier.transferInformation(0)).creator).to.equal(users[0].address);
        expect((await Verifier.transferInformation(0)).to).to.equal(users[1].address);
        expect((await Verifier.transferInformation(0)).token).to.equal(BasicToken.address);
        expect((await Verifier.transferInformation(0)).amount).to.equal(200);
        expect((await Verifier.transferInformation(0)).valid).to.equal(false);
        expect(await Verifier.totalProcess()).to.equal(1);
    });
    it("Test validateTransferToken not validator", async function () {
       await expect(Verifier.validateTransferToken(1))
           .to.be.revertedWith("Validator: sender is not the validator");
    });
    it("Test validateTransferToken not validator", async function () {
        await expect(Verifier.connect(users[1]).validateTransferToken(1))
            .to.be.revertedWith("validateTransferToken: process doesn't exists");
    });
    it("Test validateTransferToken not enough balance", async function (){
        await Verifier.receiveToken(BasicToken.address, 300);

        await Verifier.transferToken(users[1].address, BasicToken.address, 200);
        await Verifier.transferToken(users[1].address, BasicToken.address, 200);

        await Verifier.connect(users[1]).validateTransferToken(0);

        await expect(Verifier.connect(users[1]).validateTransferToken(1))
            .to.be.revertedWith("validateTokenTransfer: Not enough balance");
    });
    it("Test validateTransferToken", async function () {
        await Verifier.receiveToken(BasicToken.address, 300);

        await Verifier.transferToken(users[1].address, BasicToken.address, 200);

        await Verifier.connect(users[1]).validateTransferToken(0);

        expect((await Verifier.transferInformation(0)).valid).to.equal(true);
        expect(await Verifier.balanceOf(users[0].address, BasicToken.address)).to.equal(100);
        expect(await BasicToken.balanceOf(users[1].address)).to.equal(200);
    });
    it("Test transferTokenFrom not validator", async function () {
        await expect(Verifier.transferTokenFrom(users[0].address, users[1].address, BasicToken.address, 200))
            .to.be.revertedWith("Validator: sender is not the validator");
    });
    it("Test transferTokenFrom not complete allowance", async function () {
        await expect(Verifier.connect(users[1]).transferTokenFrom(users[0].address, users[2].address, BasicToken.address, 200))
            .to.be.revertedWith("transferTokenFrom: not enough allowance");
    });
    it("Test transferTokenFrom not enough balance", async function () {
       await Verifier.toggleCompleteAllowance();

       await expect(Verifier.connect(users[1]).transferTokenFrom(users[0].address, users[1].address, BasicToken.address, 200))
           .to.be.revertedWith("transferTokenFrom: not enough balance");
    });
    it("Test transferTokenFrom token allowance", async function () {
        await Verifier.receiveToken(BasicToken.address, 500);

        await Verifier.toggleTokenAllowance(BasicToken.address);
        await Verifier.connect(users[1]).transferTokenFrom(users[0].address, users[2].address, BasicToken.address, 150);

        expect(await Verifier.balanceOf(users[0].address, BasicToken.address)).to.equal(350);
        expect(await BasicToken.balanceOf(users[2].address)).to.equal(150);
    });
    it("Test transferTokenFrom complete allowance", async function () {
        await Verifier.receiveToken(BasicToken.address, 500);

        await Verifier.toggleCompleteAllowance();
        await Verifier.connect(users[1]).transferTokenFrom(users[0].address, users[2].address, BasicToken.address, 150);

        expect(await Verifier.balanceOf(users[0].address, BasicToken.address)).to.equal(350);
        expect(await BasicToken.balanceOf(users[2].address)).to.equal(150);
    });
    it("Test newValidator not owner", async function () {
       await expect(Verifier.connect(users[1]).newValidator(users[2].address))
           .to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Test newValidator", async function () {
       await Verifier.newValidator(users[2].address);

       expect(await Verifier.validator()).to.equal(users[2].address);
    });
    it("Test balanceOf", async function () {
       expect(await Verifier.balanceOf(users[0].address, BasicToken.address)).to.equal(0);

       await Verifier.receiveToken(BasicToken.address, 250);

       expect(await Verifier.balanceOf(users[0].address, BasicToken.address)).to.equal(250);
    });
    it("Test toggleTokenAllowance", async function () {
        expect(await Verifier.tokenAllowance(users[0].address, BasicToken.address)).to.equal(false);

        await Verifier.toggleTokenAllowance(BasicToken.address);

        expect(await Verifier.tokenAllowance(users[0].address, BasicToken.address)).to.equal(true);
    });
    it("Test toggleCompleteAllowance", async function () {
        expect(await Verifier.completeAllowance(users[0].address)).to.equal(false);

        await Verifier.toggleCompleteAllowance();

        expect(await Verifier.completeAllowance(users[0].address)).to.equal(true);
    });
});