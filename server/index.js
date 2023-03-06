const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "048d97d5428ea0b0a109f03a4729b84ef17dc3539047e724a128121723d12f74a9bc9196c63b3644f4c4c0bb4bba8205b752a6209d42f11c606c206d82c0ad9618": 100,
  "0475cb30e8023a772842239e5e6dcabe2517e1a2871507c52eab6c00594547424062b8930a3960a7f660b8a2f41ab7cd4209a8a0e2a54519e43a9c2c0914fb1c4c": 50,
  "044c76930933a41ea4f8c072037d3ebbe545b998ec72cc3306e81166ccf7697bb1e7fa7daa59a1fae4c95cacfa5b49c62659c4e5f6e4373f5fe4f5f18d0a05997c": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

// function hashMessage(message) {
//   const bytes = utf8ToBytes(message);
//   return keccak256(bytes);
// }

app.post("/send", (req, res) => {
  //todo: get a signature from the client side application
  //recover the public address from the signature
  // console.log(req.body);
  const { sender, recipient, amount, signature, recoveryBit } = req.body;
  console.log("sender: ", sender);
  console.log("signature: ", signature);
  const formattedSignature = Uint8Array.from(Object.values(signature));
  console.log("formattedSignature", formattedSignature);
  // console.log("recoveryBit: ", recoveryBit);
  // console.log("hash: ", hash);
  // const isSigned = secp.verify(signature, hash, sender);
  const msgToBytes = utf8ToBytes(recipient);
  const msgHash = toHex(keccak256(msgToBytes));
  const publicKey = secp.recoverPublicKey(
    msgHash,
    formattedSignature,
    recoveryBit
  );
  console.log("publicKey: ", Buffer.from(publicKey).toString("hex"));
  // console.log("publicKey: ", publicKey);
  console.log("sender: ", sender);

  setInitialBalance(sender);
  setInitialBalance(recipient);
  if (sender.toString() != Buffer.from(publicKey).toString("hex").toString()) {
    // console.log("sender: ", sender.toString());
    // console.log("publicKey: ", publicKey.toString());
    res.status(400).send({ message: "Invalid signature!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
