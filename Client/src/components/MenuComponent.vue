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
        <q-item clickable :active="link === 'assets'" v-ripple>
          <q-item-section avatar>
            <q-icon name="inbox" />
          </q-item-section>

          <q-item-section>
            Assets
          </q-item-section>
        </q-item>

        <q-item :active="link === 'check'" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="check" />
          </q-item-section>

          <q-item-section>
            Validations
          </q-item-section>
        </q-item>

        <q-item  :active="link === 'send'" clickable v-ripple>
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

      <q-card-actions align="right">
        <q-btn flat label="Sign Metamask" style="margin-left: auto; margin-right: auto; background-color: darkorange; color: white" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {defineComponent, ref} from 'vue'
import ApiRepository from '../repositories/ApiRepository';
import {Jazzicon} from "vue-jazzicon/src/components";
import SmartRepository from '../repositories/SmartRepository';

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
    return {
      name,
      username,
      address,
      fullAddress
    }
  },
  methods: {
    async fetch() {
      console.log(localStorage.getItem('token'));
      await ApiRepository.getUserByAuth(localStorage.getItem('token')).then((response) => {
        const data = response.data;
        this.name = data.name + " " + data.lastName;
        this.username = data.username;

        if(data.address) {
          this.address = data.address.slice(0, 5) + "..." + data.address.slice(-4);
          this.fullAddress = data.address;
        } else {
          this.alert = false;
        }
      });
    },
    async logout() {
      localStorage.removeItem('token');
      this.$router.push('/');
    }
  }
})
</script>
