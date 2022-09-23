// @ts-ignore
import { ethers } from "../lib/ethers-5.6.esm.min.js"

import { MetaMaskInpageProvider } from "@metamask/providers"
import { alertModal } from "./dom.js"
import { ABI, ADDRESS } from "./constants.js"

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

const ETHAmount = document.querySelector("#ETHAmount") as HTMLInputElement
const closeAlertModal = document.querySelector("#closeAlertModal") as HTMLElement
const connectAccountBtn = document.querySelector("#connectAccount") as HTMLElement
const fund = document.querySelector("#fund") as HTMLElement
const getBalance = document.querySelector("#getBalance") as HTMLElement
const withdraw = document.querySelector("#withdraw") as HTMLElement

async function connect(): Promise<void> {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectAccountBtn.innerHTML = "Connected"
  } else {
    alertModal.show()
  }
}

async function getAccountBalance(): Promise<void> {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(ADDRESS)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdrawFunds(): Promise<void> {
  if (window.ethereum) {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(ADDRESS, ABI, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenTransactionMine(transactionResponse, provider)
    } catch (err) {
      console.log(err)
    }
  }
}

async function fundMe(ethAmount: string) {
  console.log(`Funding with ${ethAmount}`)
  if (typeof ethAmount !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(ADDRESS, ABI, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenTransactionMine(transactionResponse, provider)
    } catch (err) {
      console.log(err)
    }
  }
}

async function listenTransactionMine(
  transactionResponse: { hash: string },
  provider: { once: any }
) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise<void>((resolve, reject) => {
    provider.once(
      transactionResponse.hash,
      (transactionReceipt: { confirmations: number }) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
        resolve()
      }
    )
  })
}

closeAlertModal.addEventListener("click", () => {
  alertModal.hide()
})

connectAccountBtn.addEventListener("click", () => {
  connect()
})

fund.addEventListener("click", () => {
  fundMe(ETHAmount.value)
})

getBalance.addEventListener("click", () => {
  getAccountBalance()
})

withdraw.addEventListener("click", () => {
  withdrawFunds()
})
