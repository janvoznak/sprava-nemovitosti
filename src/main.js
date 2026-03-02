import { createApp } from 'vue'
import router from './router'
import Sidebar from './components/Sidebar.vue'
import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

// Register global components
app.component('Sidebar', Sidebar)

// Use router
app.use(router)

// Mount app
app.mount('#app')
