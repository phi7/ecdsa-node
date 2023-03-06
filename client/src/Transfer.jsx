import { useState, useEffect } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex ,utf8ToBytes } from "ethereum-cryptography/utils";
import {sign} from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const PRIVATE_KEY = "ea7fe116423bd6a784fd972fd80475df33c5b5aacd3007cf3d2b4fbe673c15fe";
  // const [signature, setSignature] = useState("");
  const [hash, setHash] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function signMessage(msg) {
    return sign(hashMessage(msg), PRIVATE_KEY, { recovered: true });
    
  }

  function hashMessage(message) {
    const bytes = utf8ToBytes(message);
    return toHex(keccak256(bytes))
  }

  async function transfer(evt) {
    evt.preventDefault();
    
    const [signature, recoveryBit ]= await signMessage(recipient);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        // hash,
        recoveryBit: recoveryBit,
        // hash: hashMessage("hoge")
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  useEffect(() =>{
    const message = `Send ${sendAmount} to ${recipient}`;
    const bytes = utf8ToBytes(message);
    const hash = toHex(keccak256(bytes)); 
    setHash(hash)
  },[sendAmount, recipient])

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      {/* <div>
        Message Hash <span>Make sure to generate your digital signature with this hash as the message.</span>
      </div>
      <div className="hash">
        {hash}
      </div>
      <label>
        Signature
        <input
          placeholder="Type your digital signature for this transaction"
          value={signature}
          onChange={setValue(setSignature)}
        ></input>
      </label> */}

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
