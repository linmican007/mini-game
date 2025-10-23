import { createApp } from 'vue';
import App from './app.vue';

import './index.scss';

$(() => {
    try {
        const app = createApp(App);
        app.mount('#app');
    } catch (e) {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.style.padding = '20px';
        errorDiv.innerText = 'An error occurred during initialization:\n\n' + (e as Error).stack;
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
        console.error(e);
    }
});
