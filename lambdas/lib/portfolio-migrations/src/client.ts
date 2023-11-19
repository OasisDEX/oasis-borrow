import { PublicClient, createPublicClient, http } from 'viem'
import { sepolia, mainnet, optimism, arbitrum, base } from 'viem/chains'
import { getContract } from 'viem'
import { aavePoolContract } from './abi/aavePoolContract'
import { decodeBitmapToAssetsAddresses } from './decodeBitmapToAssetsAddresses'
import { aavePoolDataProviderContract } from './abi/aavePoolDataProviderContract'
import { aaveOracleContract } from './abi/aaveOracleContract'
import { USD_DECIMALS } from 'shared/constants'
import { ProtocolMigrationAssets } from './types'
import { Address, Network, PortfolioMigrationAsset } from 'shared/domain-types'
import { createtokenService } from 'tokenService'

const supportedChainsIds = ['sepolia']
const supportedProtocolsIds = ['aave']

export function createClient(rpcUrl: string) {
  const transport = http(rpcUrl, {
    batch: false,
    fetchOptions: {
      method: 'POST',
    },
  })
  const chain = sepolia
  const publicClient = createPublicClient({
    chain,
    transport,
  })

  const getProtocolAssetsToMigrate = async (
    address: Address,
  ): Promise<ProtocolMigrationAssets[]> => {
    // for each supported chain
    let promises: Promise<ProtocolMigrationAssets>[] = []
    supportedChainsIds.forEach((chainId) => {
      supportedProtocolsIds.forEach((protocolId) => {
        const promise = async () => {
          const { collAssets, debtAssets } = await getAssets(publicClient, address)
          return {
            debtAssets,
            collAssets,
            chainId,
            protocolId,
          } as ProtocolMigrationAssets
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

const client = createClient('https://sepolia.infura.io/v3/58e739d6a76846c8ae547eee8e1becb8')
client.getProtocolAssetsToMigrate('0x275f568287595D30E216b618da37897f4bbaB1B6')
// console.log('assets', assets)

async function getAssets(
  publicClient: PublicClient,
  user: Address,
): Promise<{ debtAssets: PortfolioMigrationAsset[]; collAssets: PortfolioMigrationAsset[] }> {
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

  // read getUserReserveData from aavePoolDataProvider, and coll assets prices from aaveOracle
  const [userReserveData, collAssetsPrices] = await Promise.all([
    Promise.all(
      collAssetsAddresses.map((address) =>
        aavePoolDataProvider.read.getUserReserveData([address, user]),
      ),
    ),
    aaveOracle.read.getAssetsPrices([collAssetsAddresses]),
  ])

  // coll assets tokens meta
  const collAssetsTokens = collAssetsAddresses.map((address, index) => {
    const token = tokenService.getTokenByAddress(address)
    return token
  })

  const calculateUsdValue = ({
    balance,
    balanceDecimals,
    price,
    priceDecimals,
  }: {
    balance: bigint
    balanceDecimals: bigint
    price: bigint
    priceDecimals: bigint
  }) => {
    const value = (balance * price) / 10n ** (balanceDecimals + priceDecimals)
    return value
  }

  console.log('collAssetsAddresses', collAssetsAddresses)
  console.log('collAssetsPrices', collAssetsPrices)
  console.log('collAssetsValues', collAssetsTokens)

  const createPortfolioMigrationAsset = (
    address: Address,
    index: number,
  ): PortfolioMigrationAsset => {
    const symbol = collAssetsTokens[index].symbol
    const balance = userReserveData[index][0]
    const balanceDecimals = collAssetsTokens[index].decimals
    const price = collAssetsPrices[index]
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
  const debtAssets: PortfolioMigrationAsset[] = debtAssetsAddresses.map(
    createPortfolioMigrationAsset,
  )
  const collAssets: PortfolioMigrationAsset[] = collAssetsAddresses.map(
    createPortfolioMigrationAsset,
  )

  return {
    debtAssets,
    collAssets,
  }
}
