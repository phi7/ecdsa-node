//ethereum-cryptography/secp256k1ライブラリを使って，秘密鍵を発行する
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

console.log("Private Key: ", toHex(privateKey));

//公開鍵を発行する
const publicKey = secp.getPublicKey(privateKey);

console.log("Public Key: ", toHex(publicKey));