import type { AjnaEarnPosition, AjnaPosition  } from '@oasisdex/dma-library'
import { views } from '@oasisdex/dma-library';
import { getNetworkContracts } from 'blockchain/contracts'
import { getNetworkById, getRpcProvider } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import { getAjnaCumulatives } from 'features/ajna/positions/common/helpers/getAjnaCumulatives'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { OmniProductType } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { PortfolioPositionsHandler, PositionDetail } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'
import { prisma } from 'server/prisma'

interface GetBorrowishPositionDetailsParams {
  position: AjnaPosition
  type: OmniProductType.Borrow | OmniProductType.Multiply
}

interface GetEarnPositionDetailsParams {
  position: AjnaEarnPosition
}

function getBorrowishPositionDetails({
  position,
  type,
}: GetBorrowishPositionDetailsParams): PositionDetail[] {
  switch (type) {
    case OmniProductType.Borrow:
      return [
        {
          type: 'collateralLocked',
          value: position.collateralAmount.toString(),
        },
        {
          type: 'totalDebt',
          value: position.debtAmount.toString(),
        },
      ]
    case OmniProductType.Multiply:
      return []
  }
}

function getEarnPositionDetails({ position }: GetEarnPositionDetailsParams): PositionDetail[] {
  console.info(position)

  return []
}

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
        pool: { address: poolAddress, collateralToken, quoteToken },
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

        const commonPayload = {
          collateralPrice: getTokenPrice(primaryToken, tickers),
          quotePrice: getTokenPrice(secondaryToken, tickers),
          proxyAddress,
          poolAddress,
        }
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
          details:
            type === OmniProductType.Earn
              ? getEarnPositionDetails({ position: position as AjnaEarnPosition })
              : getBorrowishPositionDetails({
                  position: position as AjnaPosition,
                  type,
                }),
          // lendingType,
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
