import BigNumber from 'bignumber.js'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { pick } from 'ramda'

export interface GetPrimaryButtonLabelParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
  id?: BigNumber
  proxyAddress?: string
  insufficientAllowance?: boolean
}

export function extractSidebarButtonLabelParams(state: GetPrimaryButtonLabelParams) {
  return pick(['flow', 'stage', 'token', 'id', 'proxyAddress', 'insufficientAllowance'], state)
}
