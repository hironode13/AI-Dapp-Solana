import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';

const connectButton = document.getElementById("connectButton");
const getValueButton = document.getElementById("getValueButton");
const setValueButton = document.getElementById("setValueButton");
const statusElement = document.getElementById("status");
const addressElement = document.getElementById("address");
const valueElement = document.getElementById("value");
const newValueElement = document.getElementById("newValue");
const transactionIdElement = document.getElementById("transactionId");

let connection;
const contractAddress = new PublicKey('PUT_YOUR_SMART_CONTRACT_ADDRESS_HERE');
let walletPublicKey;

// Connect to the Solana blockchain
async function connectWallet() {
    try {
        const wallet = await window.solana.connect();
        walletPublicKey = wallet.publicKey;
        statusElement.innerText = "Connected";
        addressElement.innerText = walletPublicKey.toBase58();
    } catch (error) {
        console.log(error);
    }
}

// Retrieve the current value stored in the smart contract
async function getValue() {
    try {
        const programAccount = await connection.getProgramAccount(
            contractAddress,
            'singleGossip',
        );
        const data = programAccount.account.data;
        const value = data.readUInt32BE();
        valueElement.innerText = value.toString();
    } catch (error) {
        console.log(error);
    }
}

// Set a new value in the smart contract
async function setValue() {
    try {
        const newValue = parseInt(newValueElement.value);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: contractAddress,
                lamports: 0, // You can set a lamport amount here to send with the transaction
            }),
        );
        const instructionData = Buffer.alloc(4);
        instructionData.writeUInt32BE(newValue);
        transaction.add({
            keys: [{ pubkey: contractAddress, isWritable: true }],
            programId: contractAddress,
            data: instructionData,
        });
        const signature = await window.solana.signAndSendTransaction(transaction);
        transactionIdElement.innerText = signature;
    } catch (error) {
        console.log(error);
    }
}

// Add event listeners to buttons
connectButton.addEventListener("click", connectWallet);
getValueButton.addEventListener("click", getValue);
setValueButton.addEventListener("click", setValue);

// Initialize Solana web3.js library
window.addEventListener('load', async () => {
    try {
        // Establish connection to the Solana network
        connection = new Connection('https://api.mainnet-beta.solana.com');
        statusElement.innerText = "Connected to Solana network";
    } catch (error) {
        console.log(error);
    }
});
