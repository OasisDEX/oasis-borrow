import type BigNumber from 'bignumber.js'
import type { OmniSlippageSourceSettings } from 'features/omni-kit/contexts'
import { SLIPPAGE_YIELD_LOOP } from 'features/userSettings/userSettings.constants'
import { useState } from 'react'

export const useOmniSlippage = ({
  slippage,
  strategies,
}: {
  slippage: BigNumber
  // To be extended if we will need more custom strategy slippage configs
  strategies: {
    isYieldLoop: boolean
  }
}) => {
  const isStrategyWithDefaultSlippage = Object.values(strategies).some((value) => value)
  const [slippageSource, setSlippageSource] = useState<OmniSlippageSourceSettings>(
    isStrategyWithDefaultSlippage ? 'strategyConfig' : 'userSettings',
  )

  const slippageConfigMap = {
    strategyConfig: strategies.isYieldLoop ? SLIPPAGE_YIELD_LOOP : slippage,
    userSettings: slippage,
  }

  return {
    slippage: slippageConfigMap[slippageSource],
    slippageSource,
    setSlippageSource,
    isStrategyWithDefaultSlippage,
  }
}
