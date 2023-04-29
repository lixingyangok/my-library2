import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import router from './router/router.js';
import store2 from 'store2';
// ▼ 样式
import './common/style/minireset.css';
import './common/style/global.scss';
import './common/lib/fontawesome-free-5.15.4-web/css/all.min.css';
import 'element-plus/dist/index.css';


// createApp(App).mount('#app')
// ▼ app
const myApp = createApp(App);
myApp.use(router);
myApp.use(ElementPlus);
myApp.mount('#app');