import { aaveTokenPairsAllowedAutomation } from 'features/automation/common/consts'

export function isSupportedAaveAutomationTokenPair(collateralToken: string, debtToken: string) {
  const joined = [collateralToken, debtToken].join('-')
  return aaveTokenPairsAllowedAutomation.map((pair) => pair.join('-')).includes(joined)
}
