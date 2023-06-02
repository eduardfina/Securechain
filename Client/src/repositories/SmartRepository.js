import { ethers } from "ethers";

let provider = null;
let signer = null;
let accounts = null;

export default {
  async connectMetamask() {
    try {
        provider = new ethers.BrowserProvider(window.ethereum, 'sepolia');
        signer = await provider.getSigner();
        provider.send("eth_requestAccounts", []).then((acc) => {
          accounts = acc;
        }).catch((e) => {
          console.log(e);
        })
    } catch (e) {
      console.log('-----------------------------------------------------------------------------------');
      console.log('Metamask not detected!');
      console.log('-----------------------------------------------------------------------------------');
    }
  },
  async signMessage(msg){
    return await signer.signMessage(msg);
  },
  async getMyAddress() {
    return await signer.getAddress();
  },
  parseEther(value){
    return ethers.parseEther(value.toString());
  },
  decodeEther(value){
    return parseFloat(value) / (10 ** 18);
  },
  getBalanceOf(address){
    return provider.getBalance(address);
  },
  async call(contractInfo, functionContract, args){
    if(!provider)
      await this.connectMetamask();

    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
    return contract[functionContract].apply(null, args);
  },
  async transaction(contractData,functionName,args, value = 0){
    if(!provider)
      await this.connectMetamask();
    console.log(provider);

    if(value > 0) {
      const overrides = {
        value: ethers.parseEther(value.toString())
      };
      args.push(overrides)
    }
    let contract = new ethers.Contract(contractData.address, contractData.abi, signer);
    let tx = await contract[functionName].apply(null, args);
    return await tx.wait();
  },
  async sendETH(quantity,to) {
    return await signer.sendTransaction({to: to, value: ethers.parseEther(quantity.toString())});
  }
};
