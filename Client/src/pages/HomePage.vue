<template>
  <q-layout
    class="window-height window-width row"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);">
    <MenuComponent link="assets"></MenuComponent>
    <div class="q-pa-md" style="width: 84%; margin-left: 15%; margin-top: 4%">
      <div class="q-gutter-y-md">
        <q-btn-toggle
          v-model="modelAssets"
          spread
          no-caps
          toggle-color="black"
          color="black"
          text-color="white"
          toggle-text-color="purple"
          :options="[
          {label: 'NFTs', value: 'nfts'},
          {label: 'Tokens', value: 'tokens'}
        ]"
        />
      </div>
      <q-scroll-area style="height: 95%; margin-top: 1%">
      <q-list class="q-pa-md row items-start q-gutter-md" v-if="modelAssets === 'nfts'">
        <q-card class="my-card" v-for="(nft, index) in NFTs" :key="index" style="background-color: white; width: 15%;">
          <img :src="nft.image">
          <q-card-section>
            <div style="font-size: 90%">{{nft.name || nft.contract.symbol}}</div>
            <div style="font-size: 70%">{{nft.contract.name}}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-btn v-if="nft.upgradable" flat label="Upgrade NFT" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white; width: 100%; font-size: 70%" />
            <q-btn v-if="nft.validator" flat label="Downgrade NFT" style="margin-left: auto; margin-right: auto; background-color: cornflowerblue; color: white; width: 100%; font-size: 70%" />
            <q-btn v-if="!nft.validator && !nft.upgradable" flat label="Validate Contract" style="margin-left: auto; margin-right: auto; background-color: darkred; color: white; width: 100%; font-size: 70%" />
          </q-card-section>
        </q-card>
      </q-list>
      </q-scroll-area>
    </div>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import ApiRepository from '../repositories/ApiRepository';
import MenuComponent from '../components/MenuComponent.vue';
import SmartRepository from '../repositories/SmartRepository';

export default defineComponent({
  name: 'HomePage',

  components: {
    MenuComponent
  },

  setup () {
    const $q = useQuasar();
    let username = ref("");
    let password = ref("");
    let loading = ref(false);
    let NFTs = [
      {
        "name": "MetaSamurai #2",
        "description": "MetaSamurai by 1BLOCK STUDIO\n\nMetaSamurai holders will receive membership access to exclusive drops, collaborations, and unique experiences.\n\nCommunity is at the forefront of our foundation and each MetaSamurai NFT unlocks entry to the 1BLOCK Ecosystem and future projects.\n\nWe are creating a space to accelerate growth of creators. Let's build the 1BLOCKVERSE together. We got your back. Visit us at [metasamurai.world](http://metasamurai.world/) for more details.",
        "image": "https://ipfs.io/ipfs/QmZGB5Gc4xDET4EZju4m35xzipkzTbzmzbPq6FUQgdLiqE",
        "attributes": [],
        "contract": {
          "name": "xMeta Samurai",
          "symbol": "xMESA",
          "address": "0x5624f98a2ae9003b3057df979ae4b99f220a8077"
        },
        "validator": true,
        "upgradable": false
      },
        {
          "image": "https://ipfs.io/ipfs/QmcJYkCKK7QPmYWjp4FD2e3Lv5WCGFuHNUByvGKBaytif4",
          "attributes": [
            {
              "trait_type": "Eyes",
              "value": "3d"
            },
            {
              "trait_type": "Mouth",
              "value": "Bored Cigarette"
            },
            {
              "trait_type": "Fur",
              "value": "Robot"
            },
            {
              "trait_type": "Hat",
              "value": "Sea Captain's Hat"
            },
            {
              "trait_type": "Background",
              "value": "Aquamarine"
            }
          ],
          "contract": {
            "name": "Bored Apes Yatch Club",
            "symbol": "BAYC",
            "address": "0x64c07d3a5ded5aad8bf6c4ae53e7f608742b75fd"
          },
          "validator": false,
          "upgradable": true
        },
        {
          "image": "https://ipfs.io/ipfs/QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6",
          "attributes": [
            {
              "trait_type": "Background",
              "value": "Purple"
            },
            {
              "trait_type": "Eyes",
              "value": "Bored"
            },
            {
              "trait_type": "Mouth",
              "value": "Tongue Out"
            },
            {
              "trait_type": "Clothes",
              "value": "Bone Necklace"
            },
            {
              "trait_type": "Fur",
              "value": "Cheetah"
            }
          ],
          "contract": {
            "name": "Bored Apes Yatch Club",
            "symbol": "BAYC",
            "address": "0x64c07d3a5ded5aad8bf6c4ae53e7f608742b75fd"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi",
          "attributes": [
            {
              "trait_type": "Mouth",
              "value": "Grin"
            },
            {
              "trait_type": "Clothes",
              "value": "Vietnam Jacket"
            },
            {
              "trait_type": "Background",
              "value": "Orange"
            },
            {
              "trait_type": "Eyes",
              "value": "Blue Beams"
            },
            {
              "trait_type": "Fur",
              "value": "Robot"
            }
          ],
          "contract": {
            "name": "xBored Apes Yatch Club",
            "symbol": "xBAYC",
            "address": "0xdbca656732caefc7ab7e7019b239d33b7bae2188"
          },
          "validator": true,
          "upgradable": false
        },
        {
          "name": "Azuki #1",
          "image": "https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/1.png",
          "attributes": [
            {
              "trait_type": "Type",
              "value": "Human"
            },
            {
              "trait_type": "Hair",
              "value": "Pink Hairband"
            },
            {
              "trait_type": "Clothing",
              "value": "White Qipao with Fur"
            },
            {
              "trait_type": "Eyes",
              "value": "Daydreaming"
            },
            {
              "trait_type": "Mouth",
              "value": "Lipstick"
            },
            {
              "trait_type": "Offhand",
              "value": "Gloves"
            },
            {
              "trait_type": "Background",
              "value": "Off White D"
            }
          ],
          "contract": {
            "name": "Azuki",
            "symbol": "AK",
            "address": "0xaa39cc83a040b05924b004416b93ef13666bbe82"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "name": "Azuki #3",
          "image": "https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/3.png",
          "attributes": [
            {
              "trait_type": "Type",
              "value": "Human"
            },
            {
              "trait_type": "Hair",
              "value": "Green Spiky"
            },
            {
              "trait_type": "Headgear",
              "value": "Frog Headband"
            },
            {
              "trait_type": "Neck",
              "value": "Frog Headphones"
            },
            {
              "trait_type": "Clothing",
              "value": "Green Yukata"
            },
            {
              "trait_type": "Eyes",
              "value": "Careless"
            },
            {
              "trait_type": "Mouth",
              "value": "Grass"
            },
            {
              "trait_type": "Offhand",
              "value": "Katana"
            },
            {
              "trait_type": "Background",
              "value": "Red"
            }
          ],
          "contract": {
            "name": "Azuki",
            "symbol": "AK",
            "address": "0xaa39cc83a040b05924b004416b93ef13666bbe82"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "name": "Azuki #2",
          "image": "https://ipfs.io/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/2.png",
          "attributes": [
            {
              "trait_type": "Type",
              "value": "Human"
            },
            {
              "trait_type": "Hair",
              "value": "Pink Flowy"
            },
            {
              "trait_type": "Ear",
              "value": "Red Tassel"
            },
            {
              "trait_type": "Clothing",
              "value": "Vest"
            },
            {
              "trait_type": "Eyes",
              "value": "Ruby"
            },
            {
              "trait_type": "Mouth",
              "value": "Chewing"
            },
            {
              "trait_type": "Background",
              "value": "Red"
            }
          ],
          "contract": {
            "name": "xAzuki",
            "symbol": "xAK",
            "address": "0x1ae1cb5e6bf7b7fa807a6e0b0cec8b64196ed15e"
          },
          "validator": true,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmbvZ2hbF3nEq5r3ijMEiSGssAmJvtyFwiejTAGHv74LR5",
          "name": "Doodle #2",
          "description": "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000. Each Doodle allows its owner to vote for experiences and activations paid for by the Doodles Community Treasury. Burnt Toast is the working alias for Scott Martin, a Canadian–based illustrator, designer, animator and muralist.",
          "attributes": [
            {
              "trait_type": "face",
              "value": "designer glasses"
            },
            {
              "trait_type": "hair",
              "value": "poopie"
            },
            {
              "trait_type": "body",
              "value": "blue fleece"
            },
            {
              "trait_type": "background",
              "value": "yellow"
            },
            {
              "trait_type": "head",
              "value": "purple"
            }
          ],
          "contract": {
            "name": "Doodles",
            "symbol": "DOODLE",
            "address": "0xf7f01921fda6a1416054a0e184b1971456754b0b"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmVpwaCqLut3wqwB5KSQr2fGnbLuJt5e3LhNvzvcisewZB",
          "name": "Doodle #3",
          "description": "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000. Each Doodle allows its owner to vote for experiences and activations paid for by the Doodles Community Treasury. Burnt Toast is the working alias for Scott Martin, a Canadian–based illustrator, designer, animator and muralist.",
          "attributes": [
            {
              "trait_type": "face",
              "value": "designer glasses"
            },
            {
              "trait_type": "hair",
              "value": "holographic mohawk"
            },
            {
              "trait_type": "body",
              "value": "pink fleece"
            },
            {
              "trait_type": "background",
              "value": "gradient 1"
            },
            {
              "trait_type": "head",
              "value": "pale"
            }
          ],
          "contract": {
            "name": "Doodles",
            "symbol": "DOODLE",
            "address": "0xf7f01921fda6a1416054a0e184b1971456754b0b"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmcyuFVLbfBmSeQ9ynu4dk67r97nB1abEekotuVuRGWedm",
          "name": "Doodle #4",
          "description": "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000. Each Doodle allows its owner to vote for experiences and activations paid for by the Doodles Community Treasury. Burnt Toast is the working alias for Scott Martin, a Canadian–based illustrator, designer, animator and muralist.",
          "attributes": [
            {
              "trait_type": "face",
              "value": "happy"
            },
            {
              "trait_type": "hair",
              "value": "purple long"
            },
            {
              "trait_type": "body",
              "value": "spotted hoodie"
            },
            {
              "trait_type": "background",
              "value": "gradient 2"
            },
            {
              "trait_type": "head",
              "value": "purple"
            }
          ],
          "contract": {
            "name": "Doodles",
            "symbol": "DOODLE",
            "address": "0xf7f01921fda6a1416054a0e184b1971456754b0b"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmTDxnzcvj2p3xBrKcGv1wxoyhAn2yzCQnZZ9LmFjReuH9",
          "name": "Doodle #1",
          "description": "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000. Each Doodle allows its owner to vote for experiences and activations paid for by the Doodles Community Treasury. Burnt Toast is the working alias for Scott Martin, a Canadian–based illustrator, designer, animator and muralist.",
          "attributes": [
            {
              "trait_type": "face",
              "value": "holographic beard"
            },
            {
              "trait_type": "hair",
              "value": "white bucket cap"
            },
            {
              "trait_type": "body",
              "value": "purple sweater with satchel"
            },
            {
              "trait_type": "background",
              "value": "grey"
            },
            {
              "trait_type": "head",
              "value": "gradient 2"
            }
          ],
          "contract": {
            "name": "xDoodles",
            "symbol": "xDOODLE",
            "address": "0x89425ac778d16d73d1fb95bac60653d55c9192bd"
          },
          "validator": true,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmVbye61dgnVGC2H2fE1obBvvE8zGXUD835J2vQU4KdE2F",
          "name": "Nakamigos #1",
          "attributes": [
            {
              "trait_type": "Hat/Helmet",
              "value": "Lumberjack Hat"
            },
            {
              "trait_type": "Mouth",
              "value": "Flat"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Breakdancer Blue"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0x87b5b658a7bf3199286e8f1fb1b87f8cca403e79"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmXqirGqZXU3mDHpjCBzNz4f6fPXkXyyNxdrPdD6wiPDrw",
          "name": "Nakamigos #2",
          "attributes": [
            {
              "trait_type": "Facial Hair",
              "value": "Solid Beard"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Breakdancer Elite"
            },
            {
              "trait_type": "Hair",
              "value": "Frump"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0x87b5b658a7bf3199286e8f1fb1b87f8cca403e79"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmRtCwEWcueRSF7SFBR1gjjzvFrucVe3hYQudKgwGbR47z",
          "name": "Nakamigos #3",
          "attributes": [
            {
              "trait_type": "Vest/Armor",
              "value": "Life Vest"
            },
            {
              "trait_type": "Hair",
              "value": "Long Blonde"
            },
            {
              "trait_type": "Mouth",
              "value": "Flat"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Long Sleeve Olive"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0x87b5b658a7bf3199286e8f1fb1b87f8cca403e79"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmVbye61dgnVGC2H2fE1obBvvE8zGXUD835J2vQU4KdE2F",
          "name": "Nakamigos #1",
          "attributes": [
            {
              "trait_type": "Hat/Helmet",
              "value": "Lumberjack Hat"
            },
            {
              "trait_type": "Mouth",
              "value": "Flat"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Breakdancer Blue"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0xc6c45e8ec9dad1a85999418ae735d1b82adb98b5"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmXqirGqZXU3mDHpjCBzNz4f6fPXkXyyNxdrPdD6wiPDrw",
          "name": "Nakamigos #2",
          "attributes": [
            {
              "trait_type": "Facial Hair",
              "value": "Solid Beard"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Breakdancer Elite"
            },
            {
              "trait_type": "Hair",
              "value": "Frump"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0xc6c45e8ec9dad1a85999418ae735d1b82adb98b5"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "image": "https://ipfs.io/ipfs/QmRtCwEWcueRSF7SFBR1gjjzvFrucVe3hYQudKgwGbR47z",
          "name": "Nakamigos #3",
          "attributes": [
            {
              "trait_type": "Vest/Armor",
              "value": "Life Vest"
            },
            {
              "trait_type": "Hair",
              "value": "Long Blonde"
            },
            {
              "trait_type": "Mouth",
              "value": "Flat"
            },
            {
              "trait_type": "Shirt/Jacket",
              "value": "Long Sleeve Olive"
            },
            {
              "trait_type": "Type",
              "value": "Human Latte"
            }
          ],
          "contract": {
            "name": "Nakamigos",
            "symbol": "NAKA",
            "address": "0xc6c45e8ec9dad1a85999418ae735d1b82adb98b5"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
          "image": "https://ipfs.io/ipfs/QmcxJoj2F24qXpasJ9XKSXyzuEHHJqdX9sv7Er5isBxZ95",
          "name": "Cool Cat #2",
          "attributes": [
            {
              "trait_type": "body",
              "value": "blue cat skin"
            },
            {
              "trait_type": "hats",
              "value": "costume frog"
            },
            {
              "trait_type": "shirt",
              "value": "tanktop sailor red"
            },
            {
              "trait_type": "face",
              "value": "ninja blue"
            },
            {
              "trait_type": "tier",
              "value": "classy_1"
            }
          ],
          "points": {
            "Body": 0,
            "Hats": 4,
            "Shirt": 2,
            "Face": 1
          },
          "ipfs_image": "https://ipfs.io/ipfs/QmcxJoj2F24qXpasJ9XKSXyzuEHHJqdX9sv7Er5isBxZ95",
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK",
          "contract": {
            "name": "Cool Cats NFT",
            "symbol": "CAT",
            "address": "0xba574595dae591d2ee3ea8f38551b92f91af3785"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
          "image": "https://ipfs.io/ipfs/QmY3aNgaE3NNHc3sZTBENFgRosny1EGCWjUZV5aTXvTB5S",
          "name": "Cool Cat #3",
          "attributes": [
            {
              "trait_type": "body",
              "value": "blue cat skin"
            },
            {
              "trait_type": "hats",
              "value": "mohawk purple"
            },
            {
              "trait_type": "shirt",
              "value": "hoodie purple"
            },
            {
              "trait_type": "face",
              "value": "beard pirate"
            },
            {
              "trait_type": "tier",
              "value": "cool_2"
            }
          ],
          "points": {
            "Body": 0,
            "Hats": 1,
            "Shirt": 1,
            "Face": 2
          },
          "ipfs_image": "https://ipfs.io/ipfs/QmY3aNgaE3NNHc3sZTBENFgRosny1EGCWjUZV5aTXvTB5S",
          "google_image": "https://drive.google.com/uc?id=1sHLQkAbPdbT4U7Ct_kkawL3J3G_rHRWD",
          "contract": {
            "name": "Cool Cats NFT",
            "symbol": "CAT",
            "address": "0xba574595dae591d2ee3ea8f38551b92f91af3785"
          },
          "validator": false,
          "upgradable": false
        },
        {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
          "image": "https://ipfs.io/ipfs/QmYrxAviWHGugdikgU1Awc8MRtfqxMYYRmBuCTMEc5mCAx",
          "name": "Cool Cat #1",
          "attributes": [
            {
              "trait_type": "body",
              "value": "blue cat skin"
            },
            {
              "trait_type": "hats",
              "value": "hat black"
            },
            {
              "trait_type": "shirt",
              "value": "winter red"
            },
            {
              "trait_type": "face",
              "value": "sunglasses blue"
            },
            {
              "trait_type": "tier",
              "value": "wild_1"
            }
          ],
          "points": {
            "Body": 0,
            "Shirt": 2,
            "Hats": 2,
            "Face": 1
          },
          "ipfs_image": "https://ipfs.io/ipfs/QmYrxAviWHGugdikgU1Awc8MRtfqxMYYRmBuCTMEc5mCAx",
          "google_image": "https://drive.google.com/uc?id=1ZYdHKuETneoIWDNvbLD0SHmG83-LXXw1",
          "contract": {
            "name": "xCool Cats NFT",
            "symbol": "xCAT",
            "address": "0x3c231abbca983145fc2c80e0a60f5824b67dcd77"
          },
          "validator": true,
          "upgradable": false
        },
        {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
          "image": "https://ipfs.io/ipfs/QmYrxAviWHGugdikgU1Awc8MRtfqxMYYRmBuCTMEc5mCAx",
          "name": "Cool Cat #1",
          "attributes": [
            {
              "trait_type": "body",
              "value": "blue cat skin"
            },
            {
              "trait_type": "hats",
              "value": "hat black"
            },
            {
              "trait_type": "shirt",
              "value": "winter red"
            },
            {
              "trait_type": "face",
              "value": "sunglasses blue"
            },
            {
              "trait_type": "tier",
              "value": "wild_1"
            }
          ],
          "points": {
            "Body": 0,
            "Shirt": 2,
            "Hats": 2,
            "Face": 1
          },
          "ipfs_image": "https://ipfs.io/ipfs/QmYrxAviWHGugdikgU1Awc8MRtfqxMYYRmBuCTMEc5mCAx",
          "google_image": "https://drive.google.com/uc?id=1ZYdHKuETneoIWDNvbLD0SHmG83-LXXw1",
          "contract": {
            "name": "Cool Cats NFT",
            "symbol": "CAT",
            "address": "0xab46561fb1771f41c347a72a01eb8e65de9b963d"
          },
          "validator": false,
          "upgradable": false
        }
    ],
    modelAssets = ref('nfts');
    return {
      $q,
      username,
      password,
      loading,
      NFTs,
      modelAssets
    }
  },
  data () {
    this.fetch();
    return {
    }
  },
  methods: {
    async fetch() {
      if(!localStorage.getItem('token')) {
        this.$router.push('/');
      }

      //const response = await ApiRepository.getMyAssets(localStorage.getItem('token'))
    },
    async login() {
      this.loading = true;
      try {
        const response = await ApiRepository.login(this.username, this.password);
        this.$q.notify({
          message: "Successfully logged " + this.username + "!",
          color: 'green'
        });
      } catch (error) {
        this.$q.notify({
          message: error.response.data.error,
          color: 'red'
        });
      } finally {
        this.loading = false;
      }
    }
  },
})
</script>
