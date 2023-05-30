<template>
  <q-layout
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);"
  >
    <div class="column">
      <div class="row">
            <q-form class="q-gutter-md">
              <h5 style="color: lightgrey; margin-bottom: 0"><b>Hello Again!</b></h5>
              <p style="color: lightgrey; margin-top: 0">Welcome Back</p>
              <q-input outlined dark v-model="username" color="grey-3" type="username" label="Username">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input outlined dark v-model="password" color="grey-3" type="password" label="Password">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-form>
      </div>
      <q-btn :loading="loading" style="background: linear-gradient(90deg, #34a2c9 6.67%, #0083CD 100%); color: lightgrey; border-radius: 5px; margin-top: 15px" @click="login()">
        Login
      </q-btn>
    </div>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import ApiRepository from '../repositories/ApiRepository';

export default defineComponent({
  name: 'LoginPage',

  setup () {
    const $q = useQuasar();
    let username = ref("");
    let password = ref("");
    let loading = ref(false);
    return {
      $q,
      username,
      password,
      loading
    }
  },
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
    async login() {
      this.loading = true;
      try {
        const response = await ApiRepository.login(this.username, this.password);
        this.$q.notify({
          message: "Successfully logged " + this.username + "!",
          color: 'green'
        });
        localStorage.setItem('token', response.data.token);
        this.$router.push('/Home');
      } catch (error) {
        this.$q.notify({
          message: error.response.data.message || error.response.data.error,
          color: 'red'
        });
      } finally {
        this.loading = false;
      }
    }
  },
})
</script>
