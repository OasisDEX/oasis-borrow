import { getAutomationBoost } from 'features/rays/getAutomationBoost'
import { getProtocolBoost } from 'features/rays/getProtocolBoost'
import { getTimeOpenBoost } from 'features/rays/getTimeOpenBoost'
import type { PositionRaysMultipliersData } from 'features/rays/types'

export const getPositionPortfolioRaysWithBoosts = ({
  rawRaysPerYear,
  positionRaysMultipliersData,
}: {
  rawRaysPerYear: number
  positionRaysMultipliersData: PositionRaysMultipliersData
}) => {
  const protocolBoost = getProtocolBoost(positionRaysMultipliersData)
  const automationBoost = getAutomationBoost(positionRaysMultipliersData)
  const timeOpenBoost = getTimeOpenBoost(positionRaysMultipliersData)

  return rawRaysPerYear * protocolBoost * automationBoost * timeOpenBoost
}
