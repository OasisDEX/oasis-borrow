import { createPublicClient, http } from 'viem'
import { sepolia, mainnet, optimism, arbitrum, base } from 'viem/chains'
import { getContract } from 'viem'
import { aavePoolContract } from './abi/aavePoolContract'
import { decodeBitmapToAssetsAddresses } from './decodeBitmapToAssetsAddresses'
import { aavePoolDataProviderContract } from './abi/aavePoolDataProviderContract'
import { aaveOracleContract } from './abi/aaveOracleContract'
import { MigrationAsset } from 'shared/domain-types'
import { fetchToken } from '@wagmi/core'

const AAVE_ORACLE_DECIMALS_V3 = 8n
const chains = [sepolia]

export async function createClient(rpcUrl: string) {
  const transport = http(rpcUrl, {
    batch: false,
    fetchOptions: {
      method: 'POST',
    },
  })
  const chain = sepolia
  const user = '0x275f568287595D30E216b618da37897f4bbaB1B6' as const

  const getAssetsByChain = async (): Promise<{
    debtAssets: MigrationAsset[]
    collAssets: MigrationAsset[]
    chainId: number
    protocolId: string
  }> => {
    const assets = await getAssets(chain, transport, user)
    return {
      debtAssets: [],
      collAssets: [],
      chainId: sepolia.id,
      protocolId: 'aave',
    }
  }

  return {
    getAssetsByChain,
  }
}

createClient('https://sepolia.infura.io/v3/58e739d6a76846c8ae547eee8e1becb8')

async function getAssets(chain: any, transport: any, user: `0x${string}`) {
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

  // read getReservesList
  const reservesList = await aavePool.read.getReservesList()
  const tokenRepository = await Promise.all(reservesList.map((address) => fetchToken({ address })))
  console.log('tokenRepository', tokenRepository)
  process.exit(0)

  // read getUserConfiguration
  const userConfig = await aavePool.read.getUserConfiguration([user])

  // decode the userConfig across all the reserves.
  const { collAssetsAddresses, debtAssetsAddresses } = decodeBitmapToAssetsAddresses(
    userConfig.data,
    reservesList,
  )

  // read getUserReserveData from aavePoolDataProvider, and coll assets prices from aaveOracle
  const [userReserveData, collAssetsPrices] = await Promise.all([
    Promise.all(
      collAssetsAddresses.map((address) =>
        aavePoolDataProvider.read.getUserReserveData([address, user]),
      ),
    ),
    aaveOracle.read.getAssetsPrices([collAssetsAddresses]),
  ])

  // coll assets data
  const collAssetsValues = collAssetsAddresses.map(async (address, index) => {
    const balance = userReserveData[index][0] / 10n ** BigInt(tokenRepository[index].decimals)
    const assetPrice = collAssetsPrices[index] / 10n ** AAVE_ORACLE_DECIMALS_V3
    const value = balance * assetPrice
    return value
  })

  console.log('collAssetsAddresses', collAssetsAddresses)
  console.log('collAssetsPrices', collAssetsPrices)
  console.log('collAssetsValues', collAssetsValues)
}

