import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 注册全局css
import './assets/css/global.css'
// 注册字体图标样式
import './assets/fonts/iconfont.css'
//配置axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//将axios挂在到Vue的原型对象上,使每个实例对象都能访问从而发送请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
