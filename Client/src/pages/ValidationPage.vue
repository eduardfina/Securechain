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
        <q-spinner-grid v-if="fullLoading" style="width: 34%; height: 5%; margin-left: 33%; margin-right: auto; margin-top: 4%"></q-spinner-grid>
      </div>
      <div v-if="modelValidations === 'open' && !fullLoading" class="q-pa-md">
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
                <q-img v-if="props.row.metadata" style="max-height: 40px; max-width: 40px" :src="props.row.metadata.image"/>
              </q-td>
              <q-td key="symbol" :props="props">
                <span v-if="props.row.contract.type === 'ERC721'">x</span>{{ props.row.metadata.symbol }}
              </q-td>
              <q-td key="name" :props="props">
                <span v-if="props.row.contract.type === 'ERC721'">x</span>{{ props.row.metadata.name }}
              </q-td>
              <q-td v-if="props.row.type !== 'ApproveAll'" key="amount/id" :props="props">
                {{ props.row.token }}
              </q-td>
              <q-td v-if="props.row.type === 'ApproveAll'" key="amount/id" :props="props">
                All
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
      <div v-if="modelValidations === 'closed' && !fullLoading" class="q-pa-md">
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
                <q-img v-if="props.row.metadata" style="max-height: 40px; max-width: 40px" :src="props.row.metadata.image"/>
              </q-td>
              <q-td key="symbol" :props="props">
                <span v-if="props.row.contract.type === 'ERC721'">x</span>{{ props.row.metadata.symbol }}
              </q-td>
              <q-td key="name" :props="props">
                <span v-if="props.row.contract.type === 'ERC721'">x</span>{{ props.row.metadata.name }}
              </q-td>
              <q-td key="amount/id" :props="props">
                {{ props.row.token }}
              </q-td>
              <q-td key="type" :props="props">
                {{ props.row.contract.type }}
              </q-td>
              <q-td key="action" :props="props">
                {{ props.row.type }}
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

        <q-card-section v-if="actualValidation.type !== 'ApproveAll'">
          <div v-if="actualValidation.contract.type === 'ERC20'" class="text">Amount: {{actualValidation.token}}</div>
          <div v-if="actualValidation.contract.type === 'ERC721'" class="text">Token: {{actualValidation.token}}</div>
        </q-card-section>

        <q-card-section v-if="actualValidation.contract.type === 'ERC721'">
          <q-img :src="actualValidation.metadata.image"></q-img>
        </q-card-section>

        <q-card-section>
          <div style="max-width: 300px" class="text">After the request transaction can take a couple of minuts for Chainlink Functions to validate.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn :loading="loading" @click="validate" v-if="actualValidation.type === 'ApproveAll' && !etherscan" flat label="Approve All" style="margin-left: auto; margin-right: auto; background-color: limegreen; color: white" />
          <q-btn :loading="loading" @click="validate" v-if="actualValidation.type === 'Approve' && !etherscan" flat label="Approve" style="margin-left: auto; margin-right: auto; background-color: green; color: white" />
          <q-btn :loading="loading" @click="validate" v-if="actualValidation.type === 'Transfer' && !etherscan" flat label="Transfer" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
          <q-btn :loading="loading" @click="validate" v-if="actualValidation.type === 'Downgrade' && !etherscan" flat label="Downgrade" style="margin-left: auto; margin-right: auto; background-color: cornflowerblue; color: white" />
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
      { name: 'action', align: 'center', label: "Action", field: 'action'},
      { name: 'validated', align: 'center', label: 'Validated', field: 'validated'}
    ]
    let validationsOpen = ref([]);
    let validationsClosed = ref([]);
    let modelValidations = ref('open');
    let fullLoading = ref(true);
    let etherscan = ref("");
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
      modelValidations,
      fullLoading,
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
      console.log("aaaa");
      const response = await ApiRepository.getMyValidations(localStorage.getItem('token'));
      console.log(response.data);
      this.validationsOpen = response.data.validationsOpen;
      this.validationsClosed = response.data.validationsClosed;
      this.fullLoading = false;
    },
    async validate() {
      this.loading = true;
      const contractAddress = this.actualValidation.contract.address;
      const process = this.actualValidation.process;
      const type = this.actualValidation.type;

      const response = await ApiRepository.acceptValidation(localStorage.getItem('token'), contractAddress, process, type);
      this.etherscan = "https://sepolia.etherscan.io/tx/" + response.data.hash;

      this.loading = false;
    }
  },
})
</script>
