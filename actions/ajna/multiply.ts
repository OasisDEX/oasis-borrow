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
      riskRatio: new RiskRatio(loanToValue || new BigNumber('0.20'), RiskRatio.TYPE.LTV),
      slippage: new BigNumber(0.01),
      collateralTokenSymbol: '',
      quoteTokenSymbol: '',
      user: '0x0',
    },
    {
      ...dependencies,
      getSwapData: getOneInchCall(getNetworkContracts(1).swapAddress),
      operationExecutor: '',
      addresses: {
        DAI: '0x0',
        ETH: '0x0',
        WSTETH: '0x0',
        USDC: '0x0',
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
