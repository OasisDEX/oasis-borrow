import type { ProductType } from 'features/aave/types'
import {AjnaProduct} from 'features/ajna/common/types'
import {OmniProductType} from 'features/omni-kit/types'
import { getApiVaults } from 'features/shared/vaultApi'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const ajnaPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  dpmList,
  // tickers,
}) => {
  const networkId = 1
  const positions = [] as PortfolioPosition[]

  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Ajna', 'getAjnaDpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Ajna']['getAjnaDpmPositions']
  const positionsArray = subgraphPositions.response.accounts.flatMap(
    ({ address: dpmAddress, borrowPositions, earnPositions, vaultId }) => [
      ...borrowPositions.map((position) => ({ ...position, dpmAddress, isEarn: false, vaultId })),
      ...earnPositions.map((position) => ({ ...position, dpmAddress, isEarn: true, vaultId })),
    ],
  )

  const a = await Promise.all(
    positionsArray.map(async ({ isEarn, vaultId }): Promise<any> => {
      const apiVaults = await getApiVaults({
        chainId: networkId,
        protocol: LendingProtocol.Ajna,
        vaultIds: [Number(vaultId)],
      })
      const type = (isEarn ? 'earn' : apiVaults[0]?.type ?? 'borrow') as OmniProductType

      return type
    }),
  )

  console.log(a)

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
