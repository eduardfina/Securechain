
const routes = [
  { path: "/", component: () => import('pages/WelcomePage.vue')},
  { path: '/Login', component: () => import('pages/LoginPage.vue') },
  { path: '/Register', component: () => import('pages/RegisterPage.vue')},
  { path: '/Home', component: () => import('pages/HomePage.vue')},
  { path: '/Validation', component: () => import('pages/ValidationPage.vue')},
  { path: '/FullControl', component: () => import('pages/FullControlPage.vue')},

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
