import { views } from '@oasisdex/dma-library'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import { getAjnaCumulatives } from 'features/ajna/positions/common/helpers/getAjnaCumulatives'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'

export const ajnaPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  dpmList,
  tickers,
}) => {
  const networkId = 1
  const positions = [] as PortfolioPosition[]

  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Ajna', 'getAjnaDpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Ajna']['getAjnaDpmPositions']

  console.log(dpmProxyAddress)
  console.log(subgraphPositions.response.accounts)

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
