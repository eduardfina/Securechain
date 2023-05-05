const ContractRepository = require("../repositories/ContractRepository");
const ValidationRepository = require("../repositories/ValidationRepository");

var Web3 = require('web3');
var web3 = new Web3('wss://solemn-long-dust.ethereum-sepolia.discover.quiknode.pro/' + process.env.QUICKNODE_API_KEY);

const deploy_hash = web3.utils.sha3('Deploy(address,address,string)');
const downgrade_hash = web3.utils.sha3('ValidateDowngrade(address,uint256,uint256)');
const transfer_hash = web3.utils.sha3('ValidateTransfer(address,address,uint256,uint256)');
const approveERC20_hash = web3.utils.sha3('ValidateApprove(address,address,uint256,uint256)');
const approveERC721_hash = web3.utils.sha3('ValidateApprove(address,address,uint256,bool,uint256)');
const validated_hash = web3.utils.sha3('Validated(address,uint256,string)');


var main = async function main() {
    var subscriptionDeploy = web3.eth.subscribe('logs',{address: [process.env.CONTROL_ADDRESS], topics: [deploy_hash]},(error, event) => {
        }).on("connected", function(subscriptionId){
            console.log('SubID: ',subscriptionId);
        })
        .on('data', async function(event){
            const address = normalizeAddress(event.topics[1]);
            const originalAddress = normalizeAddress(event.topics[2]);
            const parameters = web3.eth.abi.decodeParameters(['string'], event.data);

            await ContractRepository.addContract(address, originalAddress, parameters[0]);
        });

    var subscriptionDowngrade = web3.eth.subscribe('logs',{topics: [downgrade_hash]},(error, event) => {
        }).on("connected", function(subscriptionId){
            console.log('SubID: ',subscriptionId);
        })
        .on('data', async function(event){
            if(await ContractRepository.existsContract(event.address)) {
                const address = normalizeAddress(event.topics[1]);
                const tokenId = web3.utils.toNumber(event.topics[2]);
                const process = web3.utils.toNumber(event.topics[3]);

                await ValidationRepository.addValidation(event.address, process, "Downgrade", address, "", tokenId);
            }
        });

    var subscriptionTransfer = web3.eth.subscribe('logs',{topics: [transfer_hash]},(error, event) => {
    }).on("connected", function(subscriptionId){
        console.log('SubID: ',subscriptionId);
    })
        .on('data', async function(event){
            if(await ContractRepository.existsContract(event.address)) {
                const address = normalizeAddress(event.topics[1]);

                if(await ContractRepository.isNFTContract(event.address)) {
                    const token = web3.utils.toNumber(event.topics[2]);
                    const process = web3.utils.toNumber(event.topics[3]);

                    const parameters = web3.eth.abi.decodeParameters(['address'], event.data);

                    await ValidationRepository.addValidation(event.address, process, "Transfer", address, parameters[0], token);
                } else {
                    const to = normalizeAddress(event.topics[2]);
                    const process = web3.utils.toNumber(event.topics[3]);

                    const parameters = web3.eth.abi.decodeParameters(['uint256'], event.data);

                    await ValidationRepository.addValidation(event.address, process, "Transfer", address, to, parameters[0]);
                }
            }
        });

    var subscriptionApprove = web3.eth.subscribe('logs',{topics: [[approveERC20_hash, approveERC721_hash]]},(error, event) => {
    }).on("connected", function(subscriptionId){
        console.log('SubID: ',subscriptionId);
    })
        .on('data', async function(event){
            if(await ContractRepository.existsContract(event.address)) {
                const address = normalizeAddress(event.topics[1]);
                const contract = await ContractRepository.getContract(event.address);
                let type = "Approve";

                if(contract.type === "ERC721") {
                    if( web3.utils.toNumber(event.topics[2]) === 1 )
                        type = "ApproveAll";
                    const process = web3.utils.toNumber(event.topics[3]);

                    const parameters = web3.eth.abi.decodeParameters(['address', 'uint256'], event.data);

                    await ValidationRepository.addValidation(event.address, process, type, address, parameters[0], parameters[1]);
                } else {
                    const to = normalizeAddress(event.topics[2]);
                    const process = web3.utils.toNumber(event.topics[3]);

                    const token = web3.eth.abi.decodeParameters(['uint256'], event.data);

                    await ValidationRepository.addValidation(event.address, process, type, address, to, token[0]);
                }
            }
        });

    var subscriptionValidated = web3.eth.subscribe('logs',{address: [process.env.CONTROL_ADDRESS], topics: [validated_hash]},(error, event) => {
    }).on("connected", function(subscriptionId){
        console.log('SubID: ',subscriptionId);
    })
        .on('data', async function(event){
            const contractAddress = normalizeAddress(event.topics[1]);
            const process = web3.utils.toNumber(event.topics[2]);
            let type = "Transfer";

            if(event.topics[3] === "0x49744f73ac510aced35a20ef86473bc34529de321fe2acb1b906e8c1f98b059e")
                type = "Approve"
            if(event.topics[3] === "0x97f38ec4cb32b35d05ef2d091a1802da4380c577ff6c9294602b42512e0f6c2c")
                type = "Downgrade";

            await ValidationRepository.validateEvent(contractAddress, process, type);
        });
}

normalizeAddress = function normalizeAddress(address) {
    address = address.substring(2);

    while(address.charAt(0) === "0") {
        address = address.substring(1);
    }

    return web3.utils.toChecksumAddress("0x" + address);
}

module.exports.main = main;