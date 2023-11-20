import { Chain, HttpTransport, PublicClient, createPublicClient, extractChain, http } from 'viem'
import { sepolia, mainnet, optimism, arbitrum, base } from 'viem/chains'
import { getContract } from 'viem'
import { aavePoolContract } from './abi/aavePoolContract'
import { decodeBitmapToAssetsAddresses } from './decodeBitmapToAssetsAddresses'
import { aavePoolDataProviderContract } from './abi/aavePoolDataProviderContract'
import { aaveOracleContract } from './abi/aaveOracleContract'
import { USD_DECIMALS } from 'shared/constants'
import { ProtocolMigrationAssets } from './types'
import { Address, ChainId, Network, PortfolioMigrationAsset, Protocol } from 'shared/domain-types'
import { createtokenService } from './tokenService'

const supportedChainsIds = Object.values(ChainId) as ChainId[]
const supportedProtocolsIds = Object.values(Protocol) as Protocol[]

export function createClient(rpcUrl: string) {
  const transport = http(rpcUrl, {
    batch: false,
    fetchOptions: {
      method: 'POST',
    },
  })

  const getProtocolAssetsToMigrate = async (
    address: Address,
  ): Promise<ProtocolMigrationAssets[]> => {
    // for each supported chain
    let promises: Promise<ProtocolMigrationAssets>[] = []
    supportedChainsIds.forEach((chainId) => {
      supportedProtocolsIds.forEach((protocolId) => {
        const promise = async (): Promise<ProtocolMigrationAssets> => {
          const chain = extractChain({
            chains: [mainnet, base, optimism, arbitrum],
            id: chainId,
          })

          const { collAssets, debtAssets } = await getAssets(transport, chain, address)
          return {
            debtAssets,
            collAssets,
            chainId,
            protocolId,
          }
        }
        promises.push(promise())
      })
    })

    return Promise.all(promises)
  }

  return {
    getProtocolAssetsToMigrate: getProtocolAssetsToMigrate,
  }
}

async function getAssets(
  transport: HttpTransport,
  chain: Chain,
  user: Address,
): Promise<{ debtAssets: PortfolioMigrationAsset[]; collAssets: PortfolioMigrationAsset[] }> {
  const publicClient = createPublicClient({
    chain,
    transport,
  })
  const aavePool = getContract({
    address: aavePoolContract.address,
    abi: aavePoolContract.abi,
    publicClient,
  })
  const aavePoolDataProvider = getContract({
    address: aavePoolDataProviderContract.address,
    abi: aavePoolDataProviderContract.abi,
    publicClient,
  })
  const aaveOracle = getContract({
    address: aaveOracleContract.address,
    abi: aaveOracleContract.abi,
    publicClient,
  })

  // instantiate address service
  const tokenService = createtokenService(Network.MAINNET)

  // read getReservesList
  const reservesList = await aavePool.read.getReservesList()

  // read getUserConfiguration
  const userConfig = await aavePool.read.getUserConfiguration([user])

  // decode the userConfig across all the reserves.
  const { collAssetsAddresses, debtAssetsAddresses } = decodeBitmapToAssetsAddresses(
    userConfig.data,
    reservesList,
  )

  const assetsAddresses = [...collAssetsAddresses, ...debtAssetsAddresses]

  // read getUserReserveData from aavePoolDataProvider, and coll assets prices from aaveOracle
  const [assetsReserveData, assetsPrices] = await Promise.all([
    Promise.all(
      assetsAddresses.map((address) =>
        aavePoolDataProvider.read.getUserReserveData([address, user]),
      ),
    ),
    aaveOracle.read.getAssetsPrices([assetsAddresses]),
  ])

  // coll assets tokens meta
  const assetsTokens = assetsAddresses.map((address, index) => {
    const token = tokenService.getTokenByAddress(address)
    return token
  })

  const createPortfolioMigrationAsset =
    ({ debt }: { debt?: boolean }) =>
    (address: Address): PortfolioMigrationAsset => {
      const index = assetsAddresses.indexOf(address)
      const symbol = assetsTokens[index].symbol
      const balance = debt ? assetsReserveData[index][2] : assetsReserveData[index][0]
      const balanceDecimals = assetsTokens[index].decimals
      const price = assetsPrices[index]
      const priceDecimals = USD_DECIMALS
      const usdValue = calculateUsdValue({ balance, balanceDecimals, price, priceDecimals })

      return {
        symbol,
        balance,
        balanceDecimals,
        price,
        priceDecimals,
        usdValue,
      }
    }

  const collAssets: PortfolioMigrationAsset[] = collAssetsAddresses.map(
    createPortfolioMigrationAsset({}),
  )
  const debtAssets: PortfolioMigrationAsset[] = debtAssetsAddresses.map(
    createPortfolioMigrationAsset({ debt: true }),
  )

  return {
    collAssets,
    debtAssets,
  }
}

function calculateUsdValue({
  balance,
  balanceDecimals,
  price,
  priceDecimals,
}: {
  balance: bigint
  balanceDecimals: bigint
  price: bigint
  priceDecimals: bigint
}): number {
  const value = (balance * price) / 10n ** balanceDecimals
  return Number(value) / Number(10n ** priceDecimals)
}
