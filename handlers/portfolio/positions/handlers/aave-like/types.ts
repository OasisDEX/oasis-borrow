import type { Tickers } from 'blockchain/prices.types'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { AutomationResponse } from 'handlers/portfolio/positions/helpers/getAutomationData'
import type { HistoryResponse } from 'handlers/portfolio/positions/helpers/getHistoryData'
import type { PortfolioPosition } from 'handlers/portfolio/types'

export type GetAaveLikePositionHandlerType = (
  dpm: DpmList[number],
  tickers: Tickers,
  allPositionsHistory: HistoryResponse,
  allPositionsAutomation: AutomationResponse,
) => Promise<PortfolioPosition>
