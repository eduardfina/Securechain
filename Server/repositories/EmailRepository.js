const nodemailer = require("nodemailer");
const Validations = require("../models/validations");
const SmartRepository = require("./SmartRepository");
const Config = require("../config/config");
const {promises: fs} = require("fs");
const Users = require("../models/users");

let lastBlock = process.env.VERIFIER_BLOCK;

let _options = {
    host: 'smtp.socketlabs.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SOCKETLABS_USER,
        pass: process.env.SOCKETLABS_PASSWORD
    },
};


exports.sendEmail = async function (to, subject, html) {
   try {
       let _message = {
           from: 'eduard.fina@exoheart.club',
           to: to,
           subject: subject,
           html: html
       };

       let transporter = nodemailer.createTransport(_options);
       await transporter.sendMail(_message, function (error, info) {
           if (error) { return console.log(error); }
           return "Message sent: " + info.response;
       });
   } catch (e) {
       return e;
   }
}

exports.sendNFTEmail = async function(to, proc, token, type, validationType, contract) {
    try {
        let v = await Validations.findOne({"process": proc, "token": token});
        let subject;
        let html;

        if(type === "ERC721") {
            subject = "Validate NFT Transfer";

            let tokenURI = await SmartRepository.call({address: contract, abi: Config.xNFTVContractAbi}, "tokenURI", [v.token]);
            let metadata;

            tokenURI = ipfsToHttps(tokenURI);

            let settings = { method: "Get" };
            while(metadata === undefined) {
                try {
                    await fetch(tokenURI, settings)
                        .then(res => res.json())
                        .then((json) => {
                            metadata = json;
                        });
                } catch (e) {
                    console.log(e);
                }
            }

            const data = await fs.readFile("./html/NFTvalidation.html");

            const urlValidation = "http://localhost:8080/#/Validation";
            html = data.toString();

            html = html.replaceAll("{{nft_name}}", metadata.name);
            html = html.replaceAll("{{nft_type}}", validationType);
            html = html.replaceAll("{{nft_image}}", metadata.image.replaceAll("ipfs://", "https://ipfs.io/ipfs/"));
            html = html.replaceAll("{{url_validation}}", urlValidation);
        }

        return await exports.sendEmail(to, subject, html);
    } catch (e) {
        console.error(e)
        return e;
    }
}

exports.getNFTEvents = async function () {
    try {
        const result = await SmartRepository.getEvents(Config.nftContractData, lastBlock, 'latest', 'Validate');
        lastBlock = await SmartRepository.getBlockNumber();

        for(let validation of result) {
            let v = new Validations();

            v.from = validation.returnValues.from;
            v.to = validation.returnValues.to;
            v.token = Config.nftContractData.address;
            v.amount = validation.returnValues.tokenId;
            v.process = validation.returnValues.validationId;
            v.type = "ERC721"
            v.isVault = false

            v.save();

            const user = await Users.findOne({'address': v.from});

            await exports.sendNFTEmail(user.email, v.process, v.token, "ERC721");
        }

        return result;

    } catch (e) {
        console.error(e)
        return e
    }
}

function ipfsToHttps (ipfs) {
    if(ipfs.includes("ipfs://")) {
        const strFile = ipfs.split("//");

        return "https://ipfs.io/ipfs/" + strFile[1];
    }

    return "";
}