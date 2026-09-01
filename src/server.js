import express from 'express';
import { config } from './config/config.js';
import { cors } from './middlewares/cors.js';

const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(config.PORT, () => {
  console.log(`Server running at ${config.PORT}`);
});
