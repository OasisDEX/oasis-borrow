import { BaseAaveContext } from 'features/aave/types/base-aave-context'
import { SLIPPAGE_DEFAULT } from 'features/userSettings/userSettings'

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
