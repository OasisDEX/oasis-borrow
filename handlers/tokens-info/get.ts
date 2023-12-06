import type { Tokens } from '@prisma/client'
import { ethers } from 'ethers'
import {
  readTokensFromApi,
  readTokensFromBlockchain,
  readTokensFromDb,
  saveTokensToDb,
} from 'handlers/tokens-info/tokens'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const paramsSchema = z.object({
  addresses: z.array(z.string()),
  chainId: z.number(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const { addresses, chainId } = paramsSchema.parse(req.body)

  console.log('---')
  console.log('---')
  console.log('---')
  console.log('---')
  console.log('---')
  console.log({ addresses, chainId })
  console.log('---')
  console.log('---')
  console.log('---')
  console.log('---')
  console.log('---')

  const lowerCasedAddresses = addresses
    .filter((address) => ethers.utils.isAddress(address))
    .map((address) => address.toLowerCase())

  // Load tokens from db if possible
  let tokensFromDb: Tokens[] = []
  try {
    tokensFromDb = await readTokensFromDb(lowerCasedAddresses, chainId)

    if (tokensFromDb.length === lowerCasedAddresses.length) {
      return res.status(200).json(tokensFromDb)
    }
  } catch (e) {
    console.error(`Error while loading tokens from db: ${e}`)
  }

  // Load tokens from api
  let tokensFromApi: Tokens[] = []
  const addressesFromDb = tokensFromDb.map((token) => token.address)
  try {
    tokensFromApi = await readTokensFromApi(
      lowerCasedAddresses.filter((address) => !addressesFromDb.includes(address)),
    )

    await saveTokensToDb(tokensFromApi)

    if ([...tokensFromApi, ...tokensFromDb].length === lowerCasedAddresses.length) {
      return res.status(200).json([...tokensFromApi, ...tokensFromDb])
    }
  } catch (e) {
    console.error(`Error while loading tokens from api: ${e}`)
  }

  // Load tokens from blockchain
  let tokensFromBlockchain: Tokens[] = []
  const addressesFromApi = tokensFromApi.map((token) => token.address)
  try {
    tokensFromBlockchain = await readTokensFromBlockchain({
      addresses: lowerCasedAddresses.filter(
        (address) => ![...addressesFromDb, ...addressesFromApi].includes(address),
      ),
      chainId,
    })

    await saveTokensToDb(tokensFromBlockchain)

    return res.status(200).json([...tokensFromDb, ...tokensFromApi, ...tokensFromBlockchain])
  } catch (e) {
    console.error(`Error while loading tokens from blockchain: ${e}`)
    return res.status(200).json([...tokensFromDb, ...tokensFromApi, ...tokensFromBlockchain])
  }
}
