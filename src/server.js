import express from 'express';
import { config } from './config/config.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(config.PORT, () => {
  console.log(`Server running at ${config.PORT}`);
});
