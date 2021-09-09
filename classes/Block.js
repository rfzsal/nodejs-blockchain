'use strict';
const crypto = require('crypto');

class Block {
  constructor(data = '', prevHash = '0') {
    this.nonce = 0;
    this.timestamp = Date.now();
    this.data = data;
    this.prevHash = prevHash;
    this.hash = this._computeHash();
  }

  _computeHash() {
    const strData = JSON.stringify(this.data);
    const strBlock = JSON.stringify(
      this.nonce + this.timestamp + this.prevHash + strData
    );

    const hash = crypto.createHash('SHA256');
    hash.update(strBlock).end();

    return hash.digest('hex');
  }

  mine() {
    while (this.hash.substr(0, 3) !== 'abc') {
      this.nonce++;
      this.hash = this._computeHash();
    }
  }
}

module.exports = { Block };
