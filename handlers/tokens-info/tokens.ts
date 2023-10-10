import type { Tokens } from '@prisma/client'
import erc20 from 'blockchain/abi/erc20.json'
import { getRpcProvider } from 'blockchain/networks'
import { ethers } from 'ethers'
import { getTokensList } from 'handlers/getTokensList'
import { cacheObject } from 'helpers/api/cacheObject'
import { prisma } from 'server/prisma'

const getTokens = cacheObject(getTokensList, 60 * 60, 'tokens-list')

export const readTokensFromDb = async (addresses: string[], chainId: number) =>
  prisma.tokens.findMany({
    where: {
      address: {
        in: addresses,
      },
      chain_id: chainId,
    },
  })

export const saveTokensToDb = async (tokens: Tokens[]) =>
  await prisma.tokens.createMany({
    data: tokens,
  })

export const readTokensFromBlockchain = async ({
  addresses,
  chainId,
}: {
  addresses: string[]
  chainId: number
}) => {
  const provider = getRpcProvider(chainId)

  return Promise.all(
    addresses.map(async (address) => {
      const tokenContract = new ethers.Contract(address, erc20, provider)

      return Promise.all([
        await tokenContract.name(),
        await tokenContract.symbol(),
        await tokenContract.decimals(),
      ]).then(([name, symbol, precision]) => ({
        address: address.toLowerCase(),
        name,
        symbol: symbol.toUpperCase(),
        precision,
        chain_id: chainId,
        source: 'blockchain',
      }))
    }),
  )
}

export const readTokensFromApi = async (tokens: string[]): Promise<Tokens[]> => {
  const tokensList = await getTokens()

  return (
    tokensList?.data.tokens
      .filter(({ address }) => tokens.includes(address.toLowerCase()))
      .map(({ address, chainId, decimals, name, symbol }) => ({
        address: address.toLowerCase(),
        chain_id: chainId,
        symbol: symbol.toUpperCase(),
        precision: decimals,
        name,
        source: 'api',
      })) || []
  )
}
