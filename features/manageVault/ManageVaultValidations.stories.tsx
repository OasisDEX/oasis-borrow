import { BigNumber } from 'bignumber.js'
import { protoContextConnected } from 'blockchain/network'
import { one } from 'helpers/zero'
import { ManageVaultStory } from './ManageVaultBuilder'
import { ManageVaultView } from './ManageVaultView'

export const DepositAndWithdrawAmountsEmpty = ManageVaultStory({
  title:
    'If both the deposit and withdraw input fields are empty when editing "Collateral" then we flag the error and block the flow propagating as no vault change would occur',
  ilk: 'WBTC-A',

  collateral: one,
  debt: new BigNumber('3000'),
})

export const PaybackAndWithdrawAmountsEmpty = ManageVaultStory({
  title:
    'If both the generate and payback input fields are empty when editing "Dai" then we flag the error and block the flow propagating as no vault change would occur',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
})

export const DepositEmpty = ManageVaultStory({
  title:
    'Similar to DepositAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Collateral" editing stage they would only be able deposit so we block the flow if no deposit amount is set',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  context: { ...protoContextConnected, account: '0x0' },
  controller: '0x1',
})

export const PaybackEmpty = ManageVaultStory({
  title:
    'Similar to PaybackAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Daiu" editing stage they would only be able payback so we block the flow if no payback amount is set',
  ilk: 'WBTC-A',
  collateral: one,
  debt: new BigNumber('3000'),
  stage: 'daiEditing',
  context: { ...protoContextConnected, account: '0x0' },
  controller: '0x1',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Validations',
  component: ManageVaultView,
}
