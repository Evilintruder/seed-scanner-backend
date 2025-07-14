// Dependencies
const bip39 = require("bip39");
let bip32 = require("bip32");
if (bip32.default) bip32 = bip32.default;
const bitcoin = require("bitcoinjs-lib");
const ethUtil = require("ethereumjs-util");
const { Keypair: SolanaKeypair } = require("@solana/web3.js");
const rippleKeypairs = require("ripple-keypairs");
const TronWeb = require("tronweb");
const StellarSdk = require("stellar-sdk");
const ed25519 = require("ed25519-hd-key");
const nacl = require("tweetnacl");

// deriveAddresses function
const deriveAddresses = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  const addresses = {};

  // --- Ethereum-based coins ---
  const ethNode = root.derivePath("m/44'/60'/0'/0/0");
  const ethAddress = `0x${ethUtil.publicToAddress(ethNode.publicKey, true).toString("hex")}`;
  addresses.ETH = addresses.USDT = addresses.USDC = addresses.BNB = ethAddress;

  // --- Bitcoin (BTC) Bech32 ---
  const btcNode = root.derivePath("m/84'/0'/0'/0/0");
  addresses.BTC = bitcoin.payments.p2wpkh({
    pubkey: btcNode.publicKey,
    network: bitcoin.networks.bitcoin,
  }).address;

  

  // XRP DERIVATION (FULLY HARDENED, Trust Wallet compatible)
const ed25519 = require("ed25519-hd-key");
const nacl = require("tweetnacl");
const rippleKeypairs = require("ripple-keypairs");

const xrpDerivation = ed25519.derivePath("m/44'/144'/0'", seed);  // ✅ fully hardened
const xrpKeyPair = nacl.sign.keyPair.fromSeed(xrpDerivation.key);     // use ed25519 seed
const xrpPubKeyHex = Buffer.from(xrpKeyPair.publicKey).toString("hex");
addresses.XRP = rippleKeypairs.deriveAddress(xrpPubKeyHex);           // ✅ Correct XRP address


  // --- Solana (SOL)
  const solDerivation = ed25519.derivePath("m/44'/501'/0'", seed);
  const solKeypair = SolanaKeypair.fromSeed(solDerivation.key);
  addresses.SOL = solKeypair.publicKey.toBase58();

  // --- TRON
  const tronNode = root.derivePath("m/44'/195'/0'/0/0");
  const tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io" });
  addresses.TRON = tronWeb.address.fromPrivateKey(tronNode.privateKey.toString("hex"));

  // --- XLM (Stellar)
  const xlmDerivation = ed25519.derivePath("m/44'/148'/0'", seed);
  const xlmKeypair = StellarSdk.Keypair.fromRawEd25519Seed(xlmDerivation.key);
  addresses.XLM = xlmKeypair.publicKey();

  return addresses;
};

module.exports = deriveAddresses;
