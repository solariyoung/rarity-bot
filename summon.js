import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

const conf = {
  wssNode: 'wss://wsapi.fantom.network',
  rarityContractAddress: '0xce761d788df608bd21bdd59d6f4b54b2e27f25bb',
  privateKey: process.env.WALLET_PRIVATE_KEY,
  summonCountPerClass: process.env.SUMMON_COUNT,
}

const provider = new ethers.providers.WebSocketProvider(conf.wssNode)
const wallet = new ethers.Wallet(conf.privateKey, provider)
const account = wallet.connect(provider)

const abi = ['function summon(uint256)']
const rarity = new ethers.Contract(conf.rarityContractAddress, abi, account)

const classes = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
const summonCountPerClass = parseInt(conf.summonCountPerClass, 10)

const gasPrice = ethers.utils.parseUnits('70', 'gwei')

const summon = async () => {
  const tokenIds = []

  for (let i = 0; i < summonCountPerClass; i++) {
    for (const c of classes) {
      console.log(`Summoning class ${c} for the ${i + 1} times...`)

      const tx = await rarity.summon(c, {
        gasPrice,
        gasLimit: 200000,
        nonce: null,
      })
      const receipt = await tx.wait()
     

      console.log(
        `Transaction receipt : https://ftmscan.com/tx/${receipt.logs[1].transactionHash}`
      )

      const tokenId = parseInt(receipt.logs[0].topics[3], 16)
      tokenIds.push(tokenId)

      console.log(`Hero #${tokenId} is summoned!`)

      console.log('==============================')
      console.log('Summoned Token IDs:')
      console.log(tokenIds.join(','))
      
      const tx2 = await rarity.adventure(tokenId,{
        gasPrice,
        gasLimit: 200000,
        nonce: null,
      })
      const receipt2 = await tx2.wait()
      
      console.log(
        `Transaction receipt : https://ftmscan.com/tx/${receipt2.logs[1].transactionHash}`
      )
      console.log(`Hero #${tokenId} is adventured!`)
      
    }
  }

  return tokenIds
}

const run = async () => {
  const tokenIds = await summon()
}

await run()
