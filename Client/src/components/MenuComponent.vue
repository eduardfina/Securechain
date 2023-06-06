<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :width="200"
    :breakpoint="400"
    style="background-color: black; color: white"
  >
    <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px;">
      <q-list padding>
        <q-item @click="goToAssets()" clickable :active="link === 'assets'" v-ripple>
          <q-item-section avatar>
            <q-icon name="inbox" />
          </q-item-section>

          <q-item-section>
            Assets
          </q-item-section>
        </q-item>

        <q-item @click="goToCheck()" :active="link === 'check'" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="check" />
          </q-item-section>

          <q-item-section>
            Validations
          </q-item-section>
        </q-item>

        <q-item @click="goToFullControl()" :active="link === 'fullControl'" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="send" />
          </q-item-section>

          <q-item-section>
            Full Control
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple style="position: fixed; bottom: 0; width: 100%" @click="logout()">
          <q-item-section avatar>
            <q-icon color="red" name="logout" />
          </q-item-section>

          <q-item-section style="color: red">
            Log out
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <q-img class="absolute-top" style="height: 150px; background-color: black;">
      <div class="absolute-bottom bg-transparent">
        <q-avatar size="56px" class="q-mb-sm">
          <jazzicon :address="fullAddress" />
        </q-avatar>
        <div class="text-weight-bold">{{name}}</div>
        <div>@{{username}}</div>
        <div>{{address}}</div>
      </div>
    </q-img>
  </q-drawer>
  <q-dialog persistent v-model="alert" style="background-color: rgba(237, 231, 225, 0.8);">
    <q-card style="background-color: black; color: white">
      <q-card-section>
        <div class="text-h6">Address Signature</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Before using Securechain you must connect your address using Metamask.
      </q-card-section>

      <q-card-section v-if="metamaskAddress" class="q-pt-none">
        Address: {{metamaskAddress}}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn :loading="loading" v-if="!metamaskAddress" @click="connectMetamask" flat label="Sign Metamask" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
        <q-btn :loading="loading" v-if="metamaskAddress" @click="confirmAddress" flat label="Confirm Address" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-if="link === 'fullControl'" persistent v-model="modelControl" style="background-color: rgba(237, 231, 225, 0.8);">
    <q-card style="background-color: black; color: white">
      <q-card-section>
        <div class="text-h6">Full Control required</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Giving SecureChain a full control will allow the user to transfer their assets instantly from the dApp but it can be dangerous for your account, all your assets will be centralized.

        Please do this at your own risk.
      </q-card-section>

      <q-card-section v-if="metamaskAddress" class="q-pt-none">
        Address: {{metamaskAddress}}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn @click="goToAssets" flat label="Go Back" style="margin-left: auto; margin-right: auto; background-color: green; color: white" />
        <q-btn :loading="loading" @click="giveFullControl" flat label="Full Control" style="margin-left: auto; margin-right: auto; background-color: darkred; color: white" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {defineComponent, ref} from 'vue'
import ApiRepository from '../repositories/ApiRepository';
import {Jazzicon} from "vue-jazzicon/src/components";
import SmartRepository from '../repositories/SmartRepository';
import Globals from '../config/globals';

export default defineComponent({
  name: 'MenuComponent',
  props: {
    link: {
      type: String,
      default: null
    },
  },
  components: {
    [Jazzicon.name]: Jazzicon
  },
  setup () {
    return {
      alert: ref(false)
    }
  },
  data () {
    this.fetch();
    let name = ref("");
    let username = ref("");
    let address = ref("");
    let fullAddress = ref("");
    let modelControl = ref(false);
    let metamaskAddress = ref("");
    let loading = ref(false);
    return {
      name,
      username,
      address,
      fullAddress,
      modelControl,
      metamaskAddress,
      loading
    }
  },
  methods: {
    async fetch() {
      await ApiRepository.getUserByAuth(localStorage.getItem('token')).then(async (response) => {
        const data = response.data;
        this.name = data.name + " " + data.lastName;
        this.username = data.username;

        if (data.address) {
          this.address = data.address.slice(0, 5) + "..." + data.address.slice(-4);
          this.fullAddress = data.address;
          this.alert = false;

          const response = await ApiRepository.getPermission(localStorage.getItem('token'), this.fullAddress);
          this.modelControl = !(response.data.permission);
        } else {
          this.alert = true;
        }
      });

      this.metamaskAddress = SmartRepository.getMyAddress();
    },
    async logout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    async goToAssets() {
      this.$router.push('/Home');
    },
    async goToCheck() {
      this.$router.push('/Validation')
    },
    async goToFullControl() {
      this.$router.push('/FullControl');
    },
    async connectMetamask() {
      this.loading = true;
      await SmartRepository.connectMetamask();

      this.metamaskAddress = SmartRepository.getMyAddress();
      this.loading = false;
    },
    async confirmAddress() {
      this.loading = true;

      const message = await SmartRepository.signMessage("Validate Address");

      try {
        await ApiRepository.setAddress(localStorage.getItem('token'), this.metamaskAddress, message);
        this.$q.notify({
          message: "Successfully validated!",
          color: 'green'
        });
        location.reload();
      } catch (e) {
        this.$q.notify({
          message: "Validation failed",
          color: 'red'
        });
      }

      this.loading = false;
    },
    async giveFullControl() {
      this.loading = true;
      await SmartRepository.transaction(Globals.control, "validatePermission", []);
      const response = await ApiRepository.getPermission(localStorage.getItem('token'), this.fullAddress);
      this.modelControl = !(response.data.permission);
      this.loading = false;

      this.$q.notify({
        message: "Full access successfully given!",
        color: 'green'
      });
    }
  }
})
</script>
