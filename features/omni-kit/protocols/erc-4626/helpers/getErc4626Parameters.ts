import type { SummerStrategy } from '@oasisdex/dma-library'
import {
  erc4626ActionDepositEarn,
  erc4626ActionOpenEarn,
  erc4626ActionWithdrawEarn,
} from 'features/omni-kit/protocols/erc-4626/actions'
import type { OmniFormState, OmniGenericPosition } from 'features/omni-kit/types'
import { OmniEarnFormAction } from 'features/omni-kit/types'

interface GetErc4626ParametersParams {
  isFormValid: boolean
  state: OmniFormState
  walletAddress?: string
}

export async function getErc4626Parameters({
  isFormValid,
  state,
  walletAddress,
}: GetErc4626ParametersParams): Promise<SummerStrategy<OmniGenericPosition> | undefined> {
  const defaultPromise = Promise.resolve(undefined)

  const { action } = state

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  switch (action) {
    case OmniEarnFormAction.OpenEarn: {
      return erc4626ActionOpenEarn()
    }
    case OmniEarnFormAction.DepositEarn: {
      return erc4626ActionDepositEarn()
    }
    case OmniEarnFormAction.WithdrawEarn: {
      return erc4626ActionWithdrawEarn()
    }
    default:
      return defaultPromise
  }
}
