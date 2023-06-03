<template>
  <q-layout
    class="window-height window-width row"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);">
    <MenuComponent link="fullControl"></MenuComponent>
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
              <q-btn @click="nftForm = true; actualToken = nft" flat label="Transfer NFT" style="margin-left: auto; margin-right: auto; background-color: goldenrod; color: white; width: 100%; font-size: 70%" />
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
                <q-btn @click="tokenForm = true; actualToken = props.row" flat label="Transfer Tokens" style="background-color: goldenrod; color: white; font-size: 70%" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="nftForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div class="text-h6">Transfer {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <div class="text">Token Id: {{actualToken.tokenId}}</div>
        </q-card-section>

        <q-card-section>
          <q-img :src="actualToken.image"></q-img>
        </q-card-section>

        <q-card-section>
          <q-input outlined dark v-model="receiver" color="grey-3" type="text" label="Receiver Address">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-if="!etherscan" :loading="loading" @click="transferNFT" flat label="Transfer Tokens" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn v-if="etherscan" @click="openURL(etherscan)" flat label="See on Etherscan" style="margin-left: auto; margin-right: auto; background-color: dodgerblue; color: white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="tokenForm" style="background-color: rgba(237, 231, 225, 0.3);">
      <q-card style="background-color: black; color: white;">
        <q-card-section>
          <div class="text-h6">Transfer {{actualToken.name}} ({{actualToken.symbol}})</div>
        </q-card-section>

        <q-card-section>
          <div class="text">Total amount: {{actualToken.balance}}</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined dark v-model="receiver" color="grey-3" type="text" label="Receiver Address">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
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

        <q-card-actions align="right">
          <q-btn v-if="!etherscan" :loading="loading" @click="transferTokens" flat label="Transfer Tokens" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
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

export default defineComponent({
  name: 'FullControlPage',

  components: {
    MenuComponent
  },

  setup () {
    const $q = useQuasar();
    let tokenForm = ref(false);
    let nftForm = ref(false);
    let actualToken = ref({});
    let username = ref("");
    let password = ref("");
    let fullLoading = ref(true);
    let loading = ref(false);
    let amount = ref();
    let receiver = ref("");
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
    let etherscan = ref('');
    return {
      $q,
      username,
      password,
      tokenForm,
      nftForm,
      fullLoading,
      actualToken,
      loading,
      columns,
      amount,
      NFTs,
      tokens,
      modelAssets,
      receiver,
      etherscan
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

      const response = await ApiRepository.getMySecuredAssets(localStorage.getItem('token'))
      this.fullLoading = false;

      this.NFTs = response.data.assets.nft;
      this.tokens = response.data.assets.token;
    },
    async transferNFT () {
      this.loading = true;
      const contractAddress = this.actualToken.contract.address;
      const receiver = this.receiver;
      const tokenId = this.actualToken.tokenId;

      const response = await ApiRepository.sendNFT(localStorage.getItem('token'), receiver, contractAddress, tokenId);

      this.etherscan = "https://sepolia.etherscan.io/tx/" + response.data.transaction.hash;
      this.loading = false;

      this.$q.notify({
        message: "Successfully send!",
        color: 'green'
      });

      await this.fetch();
    },
    async transferTokens () {
      this.loading = true;
      const contractAddress = this.actualToken.address;
      const receiver = this.receiver;
      const amount = this.amount;

      const response = await ApiRepository.sendToken(localStorage.getItem('token'), receiver, contractAddress, amount);

      this.etherscan = "https://sepolia.etherscan.io/tx/" + response.data.transaction.hash;
      this.loading = false;

      this.$q.notify({
        message: "Successfully send!",
        color: 'green'
      });

      await this.fetch();
    }
  },
})
</script>
