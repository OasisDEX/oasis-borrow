import { views } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getNetworkById, getRpcProvider } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { getAjnaCumulatives } from 'features/ajna/positions/common/helpers/getAjnaCumulatives'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import type { OmniProductType } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { getAjnaPositionDetails } from 'handlers/portfolio/positions/handlers/ajna/helpers'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { prisma } from 'server/prisma'

export const ajnaPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  dpmList,
  tickers,
}) => {
  const networkId = 1

  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Ajna', 'getAjnaDpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Ajna']['getAjnaDpmPositions']
  const positionsArray = subgraphPositions.response.accounts.flatMap(
    ({ address: proxyAddress, borrowPositions, earnPositions, vaultId: positionId }) => [
      ...borrowPositions.map((position) => ({
        ...position,
        proxyAddress,
        isEarn: false,
        positionId,
      })),
      ...earnPositions.map((position) => ({ ...position, proxyAddress, isEarn: true, positionId })),
    ],
  )

  const positions = await Promise.all(
    positionsArray.map(
      async ({
        isEarn,
        pool: { address: poolAddress, collateralToken, interestRate, lup, quoteToken },
        positionId,
        proxyAddress,
      }): Promise<any> => {
        const { ajnaPoolInfo } = getNetworkContracts(networkId)
        const apiVaults = await prisma.vault.findMany({
          where: {
            vault_id: { equals: Number(positionId) },
            chain_id: { equals: networkId },
            protocol: { equals: LendingProtocol.Ajna },
          },
        })
        const primaryToken = collateralToken.symbol.toUpperCase()
        const secondaryToken = quoteToken.symbol.toUpperCase()
        const network = getNetworkById(networkId).name
        const type = (isEarn ? 'earn' : apiVaults[0]?.type ?? 'borrow') as OmniProductType
        const isOracless = isPoolOracless({
          chainId: networkId,
          collateralToken: primaryToken,
          quoteToken: secondaryToken,
        })
        const collateralPrice = isOracless ? one : getTokenPrice(primaryToken, tickers)
        const quotePrice = isOracless ? one : getTokenPrice(secondaryToken, tickers)
        const lowestUtilizedPrice = new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION)
        const fee = new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION)

        const commonPayload = { collateralPrice, quotePrice, proxyAddress, poolAddress }
        const commonDependency = {
          poolInfoAddress: ajnaPoolInfo.address,
          provider: getRpcProvider(networkId),
          getPoolData: getAjnaPoolData(networkId),
          getCumulatives: getAjnaCumulatives(networkId),
        }

        const position = isEarn
          ? await views.ajna.getEarnPosition(commonPayload, {
              ...commonDependency,
              getEarnData: getAjnaEarnData(networkId),
            })
          : await views.ajna.getPosition(commonPayload, commonDependency)

        return {
          availableToMigrate: false,
          automations: {},
          details: getAjnaPositionDetails({
            collateralPrice,
            fee,
            isOracless,
            lowestUtilizedPrice,
            position,
            primaryToken,
            quotePrice,
            secondaryToken,
            type,
          }),
          ...(isEarn && { lendingType: 'active' }),
          network,
          // netValue,
          // openDate,
          positionId,
          primaryToken,
          protocol: LendingProtocol.Ajna,
          secondaryToken,
          // strategyType,
          type,
          url: `${network}/ajna/${type}/${primaryToken}-${secondaryToken}/${positionId}`,
        }
      },
    ),
  )

  // const { ajnaPoolPairs, ajnaPoolInfo } = getNetworkContracts(NetworkIds.MAINNET)

  // const commonPayload = {
  //   collateralPrice: getTokenPrice('SDAI', tickers),
  //   quotePrice: getTokenPrice('USDC', tickers),
  //   proxyAddress: '0x07aab97fbaf2a8fc7d209e342fb161f3cb7e7a7b',
  //   poolAddress: ajnaPoolPairs['SDAI-USDC' as keyof typeof ajnaPoolPairs].address,
  // }

  // const commonDependency = {
  //   poolInfoAddress: ajnaPoolInfo.address,
  //   provider: getRpcProvider(NetworkIds.MAINNET),
  //   getPoolData: getAjnaPoolData(NetworkIds.MAINNET),
  //   getCumulatives: getAjnaCumulatives(NetworkIds.MAINNET),
  // }

  // const position = await views.ajna.getPosition(commonPayload, commonDependency)

  // console.log(position.collateralAmount.toString())
  // console.log(position.debtAmount.toString())

  return {
    positions,
    address,
  }
}
