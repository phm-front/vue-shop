import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 注册全局css
import './assets/css/global.css'
// 注册字体图标样式
import './assets/fonts/iconfont.css'
//导入treeTable
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//配置axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//拦截请求，需要授权的 API ，在请求头中使用Authorization字段添加 token 令牌
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//将axios挂在到Vue的原型对象上,使每个实例对象都能访问从而发送请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)
//定义vue全局过滤器，处理时间
//dataFormate 函数名
Vue.filter('dateFormate', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

//配置富文本编辑器

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
