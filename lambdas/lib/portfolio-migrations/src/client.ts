import { createPublicClient, http } from 'viem'
import { sepolia, mainnet, optimism, arbitrum, base } from 'viem/chains'
import { getContract } from 'viem'
import { aavePoolContract } from './abi/aavePoolContract'
import { decodeBitmapToAssetsAddresses } from './decodeBitmapToAssetsAddresses'
import { aavePoolDataProviderContract } from './abi/aavePoolDataProviderContract'
import { aaveOracleContract } from './abi/aaveOracleContract'
import { USD_DECIMALS } from 'shared/constants'
import { ProtocolMigrationAssets } from './types'
import { Address } from 'shared/domain-types'

const chains = [sepolia]

export function createClient(rpcUrl: string) {
  const transport = http(rpcUrl, {
    batch: false,
    fetchOptions: {
      method: 'POST',
    },
  })
  const chain = sepolia

  const getProtocolAssetsToMigrate = async (
    address: Address,
  ): Promise<ProtocolMigrationAssets[]> => {
    const assets = await getAssets(chain, transport, address)
    return [
      {
        debtAssets: [],
        collAssets: [],
        chainId: sepolia.id,
        protocolId: 'aave',
      },
    ]
  }

  return {
    getProtocolAssetsToMigrate: getProtocolAssetsToMigrate,
  }
}

const client = createClient('https://sepolia.infura.io/v3/58e739d6a76846c8ae547eee8e1becb8')
client.getProtocolAssetsToMigrate('0x275f568287595D30E216b618da37897f4bbaB1B6')
// console.log('assets', assets)

async function getAssets(chain: any, transport: any, user: Address) {
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
  const fetchToken = await import('@wagmi/core').then((m) => {
    console.log('m', m)
    return m.fetchToken
  })
  console.log('fetchToken', fetchToken)

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
    const assetPrice = collAssetsPrices[index] / 10n ** USD_DECIMALS
    const value = balance * assetPrice
    return value
  })

  console.log('collAssetsAddresses', collAssetsAddresses)
  console.log('collAssetsPrices', collAssetsPrices)
  console.log('collAssetsValues', collAssetsValues)
}
