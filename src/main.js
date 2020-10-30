import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store"

import FastClick from 'fastclick'
import VueLazyload from "vue-lazyload";

import toast from "components/common/toast"

Vue.config.productionTip = false

Vue.prototype.$bus = new Vue()

//安装toast插件
Vue.use(toast)

//解决移动端300ms延迟
FastClick.attach(document.body)
//使用图片懒加载图片
Vue.use(VueLazyload)

new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app')
