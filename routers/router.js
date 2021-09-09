'use strict';
const fs = require('fs').promises;
const formidable = require('formidable');

const asyncFunction = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = (app, node, blockchain) => {
  app.get(
    '/',
    asyncFunction(async (req, res) => {
      res.render('index');
    })
  );

  app.get(
    '/blockchain',
    asyncFunction(async (req, res) => {
      const data = {
        isValid: blockchain.validate(),
        blockchain: blockchain.blockchain
      };

      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 2));
    })
  );

  app.post(
    '/sign',
    asyncFunction(async (req, res) => {
      const form = formidable();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(err.httpCode || 400).send(err);
          return;
        }

        if (!files.file) {
          res.status(400).end();
          return;
        }

        const uploadedFile = await fs.readFile(files.file.path);
        const file = node.add(uploadedFile);
        const fileCID = (await file).path;

        if (blockchain.insertBlock(fileCID)) {
          const strBlockchain = JSON.stringify(blockchain.blockchain);
          const latestBlockchain = node.add(strBlockchain);
          const latestBlockchainCID = (await latestBlockchain).path;

          await fs.rm('./latest-blockchain');
          await fs.writeFile('./latest-blockchain', latestBlockchainCID);
        }

        res.send(fileCID);
      });
    })
  );

  app.post(
    '/verify',
    asyncFunction(async (req, res) => {
      const form = formidable();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(err.httpCode || 400).send(err);
          return;
        }

        if (!files.file) {
          res.status(400).end();
          return;
        }

        const uploadedFile = await fs.readFile(files.file.path);
        const file = node.add(uploadedFile, { onlyHash: true });
        const fileCID = (await file).path;

        for (const block of blockchain.blockchain) {
          if (fileCID === block.data) {
            res.send({ cid: fileCID, hash: block.hash });
            return;
          }
        }

        res.end();
      });
    })
  );
};
