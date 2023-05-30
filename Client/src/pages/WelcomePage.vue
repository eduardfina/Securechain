<template>
  <q-layout
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);"
  >
    <div class="column">
      <q-img src="../assets/logo.svg"></q-img>
      <q-btn style="background: linear-gradient(90deg, #34a2c9 6.67%, #0083CD 100%); color: lightgrey; border-radius: 5px; margin-top: 15px" @click="goLogin">
        Login
      </q-btn>
      <q-btn style="background: linear-gradient(90deg, #1d637c 6.67%, #035786 100%); color: lightgrey; border-radius: 5px; margin-top: 15px" @click="goRegister">
        Register
      </q-btn>
    </div>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WelcomePage',

  data () {
    this.fetch();
    return {
    }
  },
  methods: {
    async fetch() {
      if(localStorage.getItem('token'))
        this.$router.push('/Home');
    },
    goLogin() {
      this.$router.push('/Login');
    },
    goRegister() {
      this.$router.push('/Register');
    }
  },
})
</script>
