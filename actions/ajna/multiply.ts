import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPosition,
  RiskRatio,
  strategies,
} from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

export const ajnaOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
}) => {
  const { depositAmount, loanToValue } = state

  return strategies.ajna.multiply.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount!,
      // TODO mocked riskRatio because slider doesn't work as expected
      riskRatio: new RiskRatio(new BigNumber('0.06'), RiskRatio.TYPE.LTV),
      slippage: new BigNumber(0.01),
      collateralTokenSymbol: 'ETH',
      quoteTokenSymbol: 'USDC',
      user: '0xB3F1A66472b9cF9291258185D1c7Ac4a8dd6ae3e',
    },
    {
      ...dependencies,
      // getSwapData: getOneInchCall(getNetworkContracts(1).swapAddress),
      getSwapData: getOneInchCall('0x06a25ee7e0e969935136D4b37003905DB195B6F3'),
      // getSwapData: getOneInchCall('0x81D149d74C3E78F03614e8b5946913C546fd62E4'),
      operationExecutor: '0xa898315E79b71B9f3Be7c2Bb356164Db4EfC7a36',
      addresses: {
        DAI: '0x0',
        ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        WSTETH: '0x0',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        WBTC: '0x0',
      },
    },
  )
}

export const ajnaAdjustMultiply = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { loanToValue, depositAmount, withdrawAmount } = state

  return strategies.ajna.multiply.adjust(
    {
      ...commonPayload,
      collateralAmount: depositAmount || withdrawAmount || zero,
      riskRatio: new RiskRatio(
        loanToValue || (position as AjnaPosition).riskRatio.loanToValue,
        RiskRatio.TYPE.LTV,
      ),
      position: position as AjnaPosition,
    },
    dependencies,
  )
}

export const ajnaCloseMultiply = ({
  commonPayload,
  dependencies,
  position,
}: {
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  return strategies.ajna.multiply.close(
    {
      ...commonPayload,
      collateralAmount: zero,
      position: position as AjnaPosition,
      riskRatio: new RiskRatio(zero, RiskRatio.TYPE.LTV),
    },
    dependencies,
  )
}
