'use strict';
const crypto = require('crypto');
const { Block } = require('./Block');

class Blockchain {
  constructor(blockchain) {
    this.blockchain = blockchain;
    if (!this.validate()) {
      this.blockchain = [new Block('Block #0')];
    }
  }

  _computeHash(block) {
    const strData = JSON.stringify(block.data);
    const strBlock = JSON.stringify(
      block.nonce + block.timestamp + block.prevHash + strData
    );

    const hash = crypto.createHash('SHA256');
    hash.update(strBlock).end();

    return hash.digest('hex');
  }

  _checkDuplicate(data) {
    for (let index = 1; index < this.blockchain.length; index++) {
      const currBlock = this.blockchain[index];
      if (data === currBlock.data) return true;
    }

    return false;
  }

  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  insertBlock(data) {
    if (!this._checkDuplicate(data)) {
      const lastBlock = this.getLastBlock();

      const newBlock = new Block(data, lastBlock.hash);
      newBlock.mine();

      this.blockchain.push(newBlock);

      return true;
    }

    return false;
  }

  validate() {
    try {
      for (let index = 1; index < this.blockchain.length; index++) {
        const currBlock = this.blockchain[index];
        const prevBlock = this.blockchain[index - 1];

        if (currBlock.hash !== this._computeHash(currBlock)) return false;
        if (currBlock.prevHash !== prevBlock.hash) return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { Blockchain };
