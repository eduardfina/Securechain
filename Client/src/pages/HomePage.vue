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
        <q-spinner-grid v-if="fullLoading" style="width: 34%; height: 5%; margin-left: 33%; margin-right: auto; margin-top: 4%"></q-spinner-grid>
      </div>
      <q-scroll-area v-if="modelAssets === 'nfts'" style="height: 95%; margin-top: 1%">
      <q-list class="q-pa-md row items-start q-gutter-md">
        <q-card class="my-card" v-for="(nft, index) in NFTs" :key="index" style="background-color: white; width: 15%;">
          <img :src="nft.image">
          <q-card-section>
            <div style="font-size: 90%">{{nft.name || nft.contract.symbol}}</div>
            <div style="font-size: 70%">{{nft.contract.name}}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-btn @click="actualToken=nft; upgradeForm=true" v-if="nft.upgradable" flat label="Upgrade NFT" style="margin-left: auto; margin-right: auto; background-color: limegreen; color: white; width: 100%; font-size: 70%" />
            <q-btn @click="actualToken=nft; downgradeForm=true" v-if="nft.validator" flat label="Downgrade NFT" style="margin-left: auto; margin-right: auto; background-color: cornflowerblue; color: white; width: 100%; font-size: 70%" />
            <q-btn @click="actualToken=nft; validateForm=true" v-if="!nft.validator && !nft.upgradable" flat label="Validate Contract" style="margin-left: auto; margin-right: auto; background-color: darkred; color: white; width: 100%; font-size: 70%" />
          </q-card-section>
        </q-card>
      </q-list>
      </q-scroll-area>
      <div v-if="modelAssets === 'tokens' && !fullLoading" class="q-pa-md">
        <q-table
          color="white"
          card-class="bg-black text-white"
          table-class="text-grey"
          table-header-class="text-white"
          flat
          bordered
          :columns="columns"
          :rows="tokens"
          row-key="symbol"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="symbol" :props="props">
                {{ props.row.symbol }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="balance" :props="props">
                {{ props.row.balance}}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn v-if="props.row.upgradable" @click="tokenForm = true; actualToken = props.row" flat label="Upgrade Tokens" style="background-color: limegreen; color: white; font-size: 70%" />
                <q-btn v-if="props.row.validator" @click="tokenForm = true; actualToken = props.row" flat label="Downgrade Tokens" style="background-color: cornflowerblue; color: white; font-size: 70%" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="tokenForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div v-if="actualToken.upgradable" class="text-h6">Upgrade {{actualToken.name}} ({{actualToken.symbol}})</div>
          <div v-if="actualToken.validator" class="text-h6">Downgrade {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <div class="text">Total amount: {{actualToken.balance}}</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined dark v-model="amount" color="grey-3" type="number" label="Amount" min="0" :max="actualToken.balance">
            <template v-slot:prepend>
              <q-icon name="money" />
            </template>

            <template v-slot:append>
              <q-btn flat label="MAX" @click="amount = actualToken.balance"/>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section v-if="actualToken.validator">
          <div class="text">Remember to validate the downgrade before the transaction.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :loading="loading" @click="upgradeTokens" v-if="actualToken.upgradable && !etherscan" flat label="Upgrade" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn :loading="loading" @click="downgradeTokens" v-if="actualToken.validator && !etherscan" flat label="Downgrade" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn v-if="etherscan" @click="openURL(etherscan)" flat label="See on Etherscan" style="margin-left: auto; margin-right: auto; background-color: dodgerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog @close="etherscan = ''; loading = false;" v-model="upgradeForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div class="text-h6">Upgrade {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <q-img :src="actualToken.image"></q-img>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="!etherscan" :loading="loading" @click="upgradeNFT(actualToken)" flat label="Upgrade NFT" style="margin-left: auto; margin-right: auto; background-color: limegreen; color: white" />
          <q-btn v-if="etherscan" @click="openURL(etherscan)" flat label="See on Etherscan" style="margin-left: auto; margin-right: auto; background-color: dodgerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog @close="etherscan = ''; loading = false;" v-model="downgradeForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div class="text-h6">Downgrade {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <q-img :src="actualToken.image"></q-img>
        </q-card-section>

        <q-card-section>
          <div class="text">Remember to validate the downgrade before the transaction.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="!etherscan" :loading="loading" @click="downgradeNFT(actualToken)" flat label="Downgrade NFT" style="margin-left: auto; margin-right: auto; background-color: cornflowerblue; color: white" />
          <q-btn v-if="etherscan" @click="openURL(etherscan)" flat label="See on Etherscan" style="margin-left: auto; margin-right: auto; background-color: dodgerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog @close="etherscan = ''; loading = false;" v-model="validateForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div class="text-h6">Validate {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="!etherscan" :loading="loading" @click="createContract(actualToken.contract.address)" flat label="Validate Contract" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn v-if="etherscan" @click="openURL(etherscan)" flat label="See on Etherscan" style="margin-left: auto; margin-right: auto; background-color: dodgerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import {openURL, useQuasar} from 'quasar';
import ApiRepository from '../repositories/ApiRepository';
import MenuComponent from '../components/MenuComponent.vue';
import SmartRepository from '../repositories/SmartRepository';
import Globals from '../config/globals';

export default defineComponent({
  name: 'HomePage',

  components: {
    MenuComponent
  },

  setup () {
    const $q = useQuasar();
    let tokenForm = ref(false);
    let upgradeForm = ref(false);
    let downgradeForm = ref(false);
    let validateForm = ref(false);
    let actualToken = ref({});
    let username = ref("");
    let password = ref("");
    let fullLoading = ref(true);
    let loading = ref(false);
    let amount = ref();
    let etherscan = ref("");
    let columns = [{
      name: 'symbol',
      required: true,
      label: 'Symbol',
      align: 'left',
      field: 'symbol',
      format: val => `${val}`,
      sortable: true
      },
      { name: 'name', align: 'center', label: 'Name', field: 'name'},
      { name: 'balance', label: 'Balance', field: row => row.balance/row.decimals },
      { name: 'action', label: 'Action', field: 'action'}
    ]
    let NFTs = ref([]);
    let tokens = ref([]);
    let modelAssets = ref('nfts');
    let userAddress = ref('');
    return {
      $q,
      username,
      password,
      tokenForm,
      upgradeForm,
      downgradeForm,
      validateForm,
      fullLoading,
      actualToken,
      loading,
      columns,
      amount,
      NFTs,
      tokens,
      etherscan,
      modelAssets,
      userAddress
    }
  },
  data () {
    this.fetch();
    return {
    }
  },
  methods: {
    openURL,
    async fetch() {
      if(!localStorage.getItem('token')) {
        this.$router.push('/');
      }

      const response = await ApiRepository.getMyAssets(localStorage.getItem('token'))
      this.fullLoading = false;

      this.NFTs = response.data.assets.nft;
      this.tokens = response.data.assets.token;

      const res = await ApiRepository.getUserByAuth(localStorage.getItem('token'));
      this.userAddress = res.data.address;

    },
    async createContract(address) {
      this.loading = true;
      const response = await ApiRepository.createContract(localStorage.getItem('token'), address);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + response.data.contract;

      await this.fetch();

      this.$q.notify({
        message: "Contract created",
        color: 'green'
      });
    },
    async upgradeNFT() {
      this.loading = true;
      let response = await ApiRepository.getContractFromOriginalAddress(localStorage.getItem('token'), this.actualToken.contract.address);
      const securedContract = response.data.contract.address;

      const allowance = await SmartRepository.call({address: this.actualToken.contract.address, abi: Globals.erc721abi}, 'isApprovedForAll', [this.userAddress, securedContract]);

      if(!allowance) {
        await SmartRepository.transaction({address: this.actualToken.contract.address, abi: Globals.erc721abi}, 'setApprovalForAll', [securedContract, true]);
      }

      const res = await SmartRepository.transaction({address: securedContract, abi: Globals.nftVabi}, 'upgrade', [this.actualToken.tokenId]);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + res.hash;

      this.loading = false;
    },
    async downgradeNFT() {
      this.loading = true;

      const res = await SmartRepository.transaction({address: this.actualToken.contract.address, abi: Globals.nftVabi}, 'downgrade', [this.actualToken.tokenId]);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + res.hash;

      this.loading = false;
    },
    async upgradeTokens() {
      this.loading = true;
      let response = await ApiRepository.getContractFromOriginalAddress(localStorage.getItem('token'), this.actualToken.address);
      const securedContract = response.data.contract.address;

      const allowance = await SmartRepository.call({address: this.actualToken.address, abi: Globals.erc20abi}, 'allowance', [this.userAddress, securedContract]);

      if(allowance < this.amount) {
        await SmartRepository.transaction({address: this.actualToken.address, abi: Globals.erc721abi}, 'approve', [securedContract, "999999999999999999999999999999"]);
      }

      const res = await SmartRepository.transaction({address: securedContract, abi: Globals.tokenVabi}, 'upgrade', [this.amount]);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + res.hash;

      this.loading = false;
    },
    async downgradeTokens() {
      this.loading = true;

      const res = await SmartRepository.transaction({address: this.actualToken.address, abi: Globals.tokenVabi}, 'downgrade', [this.userAddress, this.amount]);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + res.hash;

      this.loading = false;
    }
  },
})
</script>
