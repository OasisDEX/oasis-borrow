import type { Vault } from '@prisma/client'
import type BigNumber from 'bignumber.js'
import type { RaysUserMultipliersResponse } from 'features/rays/getRaysUserMultipliers'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type { HistoryResponse } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import type { LendingProtocol } from 'lendingProtocols'

export type AaveLikeOraclePriceData = (
  | {
      protocol: LendingProtocol.SparkV3 | LendingProtocol.AaveV2 | LendingProtocol.AaveV3
      price: BigNumber
      tokenSymbol: string
      tokenAddress: string
    }
  | undefined
)[]

export type GetAaveLikePositionHandlerType = ({
  dpm,
  prices,
  allPositionsHistory,
  allPositionsAutomations,
  allOraclePrices,
  apiVaults,
  debug,
}: {
  dpm: DpmSubgraphData
  prices: TokensPricesList
  allPositionsHistory: HistoryResponse
  allPositionsAutomations: AutomationResponse
  allOraclePrices: AaveLikeOraclePriceData
  apiVaults?: Vault[]
  debug?: boolean
  raysUserMultipliers: RaysUserMultipliersResponse
}) => Promise<PortfolioPosition>
