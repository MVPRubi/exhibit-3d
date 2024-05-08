import { createApp } from "vue";
import App from "./App.vue";
import { ImagePreview } from "vant";

import "./style.css";
import 'vant/lib/index.css';

const app = createApp(App);

app.use(ImagePreview);

app.mount("#app");
