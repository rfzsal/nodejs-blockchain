'use strict';
require('dotenv').config();
const fs = require('fs').promises;
const express = require('express');
const IPFS = require('ipfs');
const { Blockchain } = require('./classes/Blockchain');
const router = require('./routers/router');

const app = express();
app.set('view engine', 'ejs');

const startServer = async () => {
  const node = await IPFS.create();

  // QmasdwSPjjwdcWyEcMauMST1DtbhpDdwUsofCwjstgUUpC
  const latestBlockchainCID = await fs.readFile('./latest-blockchain');
  const latestBlockchain = node.cat(latestBlockchainCID.toString());

  let tmpBLockchain = '';
  for await (const chunk of latestBlockchain) {
    tmpBLockchain += chunk.toString();
  }

  const parsedBlockchain = JSON.parse(tmpBLockchain);
  const blockchain = new Blockchain(parsedBlockchain);

  router(app, node, blockchain);

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}..`);
  });
};

startServer();
