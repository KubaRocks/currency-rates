import express, { Express } from 'express';
import dotenv from 'dotenv';
import { rates } from "./src/routes/rates";
import NodeCache from "node-cache";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "hello from API"})
});

app.get('/rates/:symbols', (req, res) => {
  return rates(req, res, cache);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
