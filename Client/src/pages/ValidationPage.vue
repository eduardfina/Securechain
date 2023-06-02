<template>
  <q-layout
    class="window-height window-width row"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);">
    <MenuComponent link="check"></MenuComponent>
    <div class="q-pa-md" style="width: 84%; margin-left: 15%; margin-top: 4%">
      <div class="q-gutter-y-md">
        <q-btn-toggle
          v-model="modelValidations"
          spread
          no-caps
          toggle-color="black"
          color="black"
          text-color="white"
          toggle-text-color="purple"
          :options="[
          {label: 'Open', value: 'open'},
          {label: 'Closed', value: 'closed'}
        ]"
        />
      </div>
      <div v-if="modelValidations === 'open'" class="q-pa-md">
        <q-table
          color="white"
          card-class="bg-black text-white"
          table-class="text-grey"
          table-header-class="text-white"
          flat
          bordered
          :columns="columnsOpen"
          :rows="validationsOpen"
          row-key="symbol"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="token" :props="props">
                <q-img style="max-height: 40px; max-width: 40px" :src="props.row.metadata.image"/>
              </q-td>
              <q-td key="symbol" :props="props">
                {{ props.row.metadata.symbol }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.metadata.name }}
              </q-td>
              <q-td key="amount/id" :props="props">
                {{ props.row.token }}
              </q-td>
              <q-td key="type" :props="props">
                {{ props.row.contract.type }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn v-if="props.row.type === 'ApproveAll'" @click="validationForm = true; actualValidation = props.row" flat label="Approve All" style="background-color: limegreen; color: white; font-size: 70%" />
                <q-btn v-if="props.row.type === 'Approve'" @click="validationForm = true; actualValidation = props.row" flat label="Approve" style="background-color: green; color: white; font-size: 70%" />
                <q-btn v-if="props.row.type === 'Transfer'" @click="validationForm = true; actualValidation = props.row" flat label="Transfer" style="background-color: darkorange; color: white; font-size: 70%" />
                <q-btn v-if="props.row.type === 'Downgrade'" @click="validationForm = true; actualValidation = props.row" flat label="Downgrade" style="background-color: cornflowerblue; color: white; font-size: 70%" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <div v-if="modelValidations === 'closed'" class="q-pa-md">
        <q-table
          color="white"
          card-class="bg-black text-white"
          table-class="text-grey"
          table-header-class="text-white"
          flat
          bordered
          :columns="columnsClosed"
          :rows="validationsClosed"
          row-key="symbol"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="token" :props="props">
                <q-img style="max-height: 40px; max-width: 40px" :src="props.row.metadata.image"/>
              </q-td>
              <q-td key="symbol" :props="props">
                {{ props.row.metadata.symbol }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.metadata.name }}
              </q-td>
              <q-td key="amount/id" :props="props">
                {{ props.row.token }}
              </q-td>
              <q-td key="type" :props="props">
                {{ props.row.contract.type }}
              </q-td>
              <q-td key="validated" :props="props">
                <q-icon v-if="props.row.accept" class="text-green" size="2em" name="check"></q-icon>
                <q-icon v-if="!props.row.accept" class="text-red" size="2em" name="close"></q-icon>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="validationForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div v-if="actualValidation.type === 'ApproveAll'" class="text-h6">Approve all {{actualValidation.metadata.name}} ({{actualValidation.metadata.symbol}})</div>
          <div v-if="actualValidation.type === 'Approve'" class="text-h6">Approve {{actualValidation.metadata.name}} ({{actualValidation.metadata.symbol}})</div>
          <div v-if="actualValidation.type === 'Transfer'" class="text-h6">Transfer {{actualValidation.metadata.name}} ({{actualValidation.metadata.symbol}})</div>
          <div v-if="actualValidation.type === 'Downgrade'" class="text-h6">Downgrade {{actualValidation.metadata.name}} ({{actualValidation.metadata.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <div v-if="actualValidation.contract.type === 'ERC20'" class="text">Amount: {{actualValidation.token}}</div>
          <div v-if="actualValidation.contract.type === 'ERC721' && actualValidation.type !== 'ApproveAll'" class="text">Token: {{actualValidation.token}}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-if="actualValidation.type === 'ApproveAll'" flat label="Approve All" style="margin-left: auto; margin-right: auto; background-color: limegreen; color: white" />
          <q-btn v-if="actualValidation.type === 'Approve'" flat label="Approve" style="margin-left: auto; margin-right: auto; background-color: green; color: white" />
          <q-btn v-if="actualValidation.type === 'Transfer'" flat label="Transfer" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn v-if="actualValidation.type === 'Downgrade'" flat label="Downgrade" style="margin-left: auto; margin-right: auto; background-color: cornflowerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import ApiRepository from '../repositories/ApiRepository';
import MenuComponent from '../components/MenuComponent.vue';
import SmartRepository from '../repositories/SmartRepository';

export default defineComponent({
  name: 'ValidationPage',

  components: {
    MenuComponent
  },

  setup () {
    const $q = useQuasar();
    let validationForm = ref(false);
    let actualValidation = ref({});
    let username = ref("");
    let password = ref("");
    let loading = ref(false);
    let amount = ref();
    let columnsOpen = [
      {name: "token", align: 'center', label: 'Token', field: 'token'},
      {name: 'symbol', required: true, label: 'Symbol', align: 'center', field: 'symbol', format: val => `${val}`, sortable: true},
      { name: 'name', align: 'center', label: 'Name', field: 'name'},
      { name: 'amount/id', align: 'center', label: 'Amount/Id', field: 'amount' },
      { name: 'type', align: 'center', label: "Type", field: 'type'},
      { name: 'action', label: 'Action', field: 'action'}
    ]
    let columnsClosed = [
      {name: "token", align: 'center', label: 'Token', field: 'token'},
      {name: 'symbol', required: true, label: 'Symbol', align: 'center', field: 'symbol', format: val => `${val}`, sortable: true},
      { name: 'name', align: 'center', label: 'Name', field: 'name'},
      { name: 'amount/id', align: 'center', label: 'Amount/Id', field: 'amount' },
      { name: 'type', align: 'center', label: "Type", field: 'type'},
      { name: 'validated', align: 'center', label: 'Validated', field: 'validated'}
    ]
    let validationsOpen = [
      {
        "_id": "64556ad8c4dce5442bca75f1",
        "accept": false,
        "active": true,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 0,
        "type": "ApproveAll",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0x48cE883eb427De41587DB5A96aED876488dfc5b5",
        "token": 0,
        "__v": 0,
        "metadata": {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
            "image": "https://ipfs.io/ipfs/QmcxJoj2F24qXpasJ9XKSXyzuEHHJqdX9sv7Er5isBxZ95",
            "name": "Cool Cats NFT",
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
            "symbol": "CAT"
        }
      },
      {
        "_id": "64557ab00e3ca2a30ee74dd7",
        "accept": true,
        "active": true,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 3,
        "type": "Downgrade",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "",
        "token": 4,
        "__v": 0,
        "metadata": {
          "description": "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.",
          "image": "https://ipfs.io/ipfs/QmcxJoj2F24qXpasJ9XKSXyzuEHHJqdX9sv7Er5isBxZ95",
          "name": "Cool Cats NFT",
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
          "symbol": "CAT"
        }
      }
    ];
    let validationsClosed = [
      {
        "_id": "64556a0cc4dce5442bca75b4",
        "accept": false,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 0,
        "type": "Downgrade",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "",
        "token": 1,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=1ZYdHKuETneoIWDNvbLD0SHmG83-LXXw1"
        }
      },
      {
        "_id": "64556a24c4dce5442bca75b9",
        "accept": false,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 0,
        "type": "Transfer",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0xD1a33005d8520369EeC0f180358e7487581886A4",
        "token": 1,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=1ZYdHKuETneoIWDNvbLD0SHmG83-LXXw1"
        }
      },
      {
        "_id": "64556a30c4dce5442bca75be",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 1,
        "type": "Downgrade",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "",
        "token": 1,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=1ZYdHKuETneoIWDNvbLD0SHmG83-LXXw1"
        }
      },
      {
        "_id": "64556b44c4dce5442bca75f6",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 1,
        "type": "Transfer",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0xD1a33005d8520369EeC0f180358e7487581886A4",
        "token": 2,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK"
        }
      },
      {
        "_id": "64556b68c4dce5442bca75fc",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 1,
        "type": "Approve",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0x48cE883eb427De41587DB5A96aED876488dfc5b5",
        "token": 2,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK"
        }
      },
      {
        "_id": "64556c04c4dce5442bca7643",
        "accept": false,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 2,
        "type": "Approve",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0xDd9696dd94d6D04FCe98c05358f4bDA592bE6a8f",
        "token": 2,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK"
        }
      },
      {
        "_id": "64556d78c4dce5442bca7699",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 2,
        "type": "Downgrade",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "",
        "token": 2,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK"
        }
      },
      {
        "_id": "64556e5dc4dce5442bca76ca",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 2,
        "type": "Transfer",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0x5Ce8C624286e91b44e5278FA446c36C2b017bfe8",
        "token": 2,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=19D3NWq1oZCKO7EFLPSMcmUSENNRegyvK"
        }
      },
      {
        "_id": "64556f34c4dce5442bca76fb",
        "accept": true,
        "active": false,
        "contract": {
          "_id": "645569c4c4dce5442bca75b1",
          "address": "0x6F467e038e46AfC27CC05B45a29eEc48F0779233",
          "originalAddress": "0xab46561fb1771f41c347a72a01eb8e65de9b963d",
          "type": "ERC721",
          "__v": 0
        },
        "process": 3,
        "type": "Approve",
        "owner": "0x35C7FbeD330eF8bc41C679104a4294A4d7a83C40",
        "to": "0x5Ce8C624286e91b44e5278FA446c36C2b017bfe8",
        "token": 3,
        "__v": 0,
        "metadata": {
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
          "google_image": "https://drive.google.com/uc?id=1sHLQkAbPdbT4U7Ct_kkawL3J3G_rHRWD"
        }
      }
    ];
    let modelValidations = ref('closed');
    return {
      $q,
      username,
      password,
      validationForm,
      actualValidation,
      loading,
      columnsOpen,
      columnsClosed,
      amount,
      validationsOpen,
      validationsClosed,
      modelValidations
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

      //const response = await ApiRepository.getMyValidations(localStorage.getItem('token'));
      //console.log(response.data);
      //this.validationsOpen = response.data.validationsOpen;
      //this.validationsClosed = response.data.validationsClosed;
    }
  },
})
</script>
