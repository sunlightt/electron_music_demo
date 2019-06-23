import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      name: 'play_music',
      component: require('@/components/PlayMusic').default
    },
    {
      path: '/add',
      name: 'add_music',
      component: require('@/components/AddMusic').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
