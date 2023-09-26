import { SLIPPAGE_DEFAULT } from 'features/userSettings/userSettings.constants'
import { BaseAaveContext } from './base-aave-context'

export function getSlippage(
  context: Pick<BaseAaveContext, 'getSlippageFrom' | 'userSettings' | 'strategyConfig'>,
) {
  if (context.getSlippageFrom === 'userSettings') {
    return context.userSettings?.slippage || SLIPPAGE_DEFAULT
  }

  return (
    context.strategyConfig.defaultSlippage || context.userSettings?.slippage || SLIPPAGE_DEFAULT
  )
}
