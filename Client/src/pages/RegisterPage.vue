<template>
  <q-layout
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(135deg,  #1E1E1E  0%, #2A3E84 100%);"
  >
    <div class="column">
      <div class="row">
            <q-form class="q-gutter-md">
              <h5 style="color: lightgrey; margin-bottom: 0"><b>Hello!</b></h5>
              <p style="color: lightgrey; margin-top: 0">Sign up to get started</p>
              <q-input outlined dark v-model="username" color="grey-3" type="username" label="Username">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input outlined dark v-model="name" color="grey-3" type="name" label="Name">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input outlined dark v-model="lastName" color="grey-3" type="lastname" label="Lastname">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input outlined dark v-model="email" color="grey-3" type="email" label="Email">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input outlined dark v-model="password" color="grey-3" type="password" label="Password">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
              <q-input outlined dark v-model="repeatPassword" color="grey-3" type="password" label="Repeat Password">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-form>
      </div>
      <q-btn :loading="loading" style="background: linear-gradient(90deg, #34a2c9 6.67%, #0083CD 100%); color: lightgrey; border-radius: 5px; margin-top: 15px" @click="register">
        Register
      </q-btn>
    </div>
  </q-layout>
</template>

<script>
import {defineComponent, ref} from 'vue'
import {useQuasar} from "quasar";
import ApiRepository from "src/repositories/ApiRepository";

export default defineComponent({
  name: 'RegisterPage',

  setup () {
    const $q = useQuasar();
    let username = ref("");
    let name = ref("");
    let lastName = ref("");
    let email = ref("");
    let password = ref("");
    let repeatPassword = ref("");
    let loading = ref(false);
    return {
      $q,
      username,
      name,
      lastName,
      email,
      password,
      repeatPassword,
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
    async register() {
      if(this.password !== this.repeatPassword) {
        this.$q.notify({
          message: "Passwords doesn't match",
          color: 'red'
        });
      } else {
        this.loading = true;

        try {
          const response = await ApiRepository.register(this.username, this.name, this.lastName, this.email, this.password);
          this.$q.notify({
            message: "Successfully registered " + this.username + "!",
            color: 'green'
          });
          this.$router.push('/Login');
        } catch (error) {
          this.$q.notify({
            message: error.response.data.error,
            color: 'red'
          });
        } finally {
          this.loading = false;
        }
      }
    }
  },
})
</script>
