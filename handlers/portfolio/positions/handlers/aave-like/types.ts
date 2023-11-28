import type { Vault } from '@prisma/client'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type { HistoryResponse } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPosition } from 'handlers/portfolio/types'

export type GetAaveLikePositionHandlerType = (
  dpm: DpmList[number],
  prices: TokensPricesList,
  allPositionsHistory: HistoryResponse,
  allPositionsAutomation: AutomationResponse,
  apiVaults?: Vault[],
) => Promise<PortfolioPosition>
