// services/seedGenerator.js
const bip39 = require("bip39");

const generateSeedPhrase = () => {
  const mnemonic = bip39.generateMnemonic(); // 12-word phrase by default
  return mnemonic;
};

module.exports = generateSeedPhrase;
