import { Tokens } from '@prisma/client'
import erc20 from 'blockchain/abi/erc20.json'
import { getRpcProvider } from 'blockchain/networks'
import { ethers } from 'ethers'
import getConfig from 'next/config'
import { prisma } from 'server/prisma'

const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

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
        symbol,
        precision,
        chain_id: chainId,
      }))
    }),
  )
}

export const readTokensFromApi = async (tokens: string[]): Promise<Tokens[]> => {
  const query = tokens.reduce<string>(
    (total, token, i) => `${total}${i > 0 ? '&' : ''}token=${token}`,
    '?',
  )
  const tokensFromApi = await fetch(`${basePath}/api/external-tokens-info${query}`).then((resp) =>
    resp.json(),
  )

  return Object.keys(tokensFromApi).map((address) => ({
    address: address.toLowerCase(),
    chain_id: tokensFromApi[address].chainId,
    symbol: tokensFromApi[address].symbol,
    precision: tokensFromApi[address].precision,
    name: tokensFromApi[address].name,
  }))
}
