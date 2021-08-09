import BigNumber from 'bignumber.js'
import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'
import { NEVER } from 'rxjs'

import { OpenMultiplyVaultView } from '../components/OpenMultiplyVaultView'

export const WaitingForIlksToBeFetched = openMultiplyVaultStory({
  title:
    'We must first validate and verify that the ilks will be fetched before we can render anything.',
  _ilks$: NEVER,
})()

export const InvalidIlk = openMultiplyVaultStory({
  title: 'Here, the user would be using a url /vault/open/WBTC-Z, should 404',
  ilk: 'ETH-Z',
})()

export const EditingStage = openMultiplyVaultStory({
  proxyAddress: '0xProxyAddress',
  balanceInfo: { collateralBalance: new BigNumber('100') },
})({
  depositAmount: new BigNumber('50'),
})

export const ProxyWaitingForConfirmation = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
})

export const ProxyWaitingForApproval = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('50'),
})

export const ProxyFailure = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('50'),
})

export const ProxyInProgress = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('50'),
})

export const ProxySuccess = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxySuccess',
  depositAmount: new BigNumber('50'),
})

// FOR NOW WE ONLY PROVIDE MULTIPLY FOR ETH COLLATERAL, STEPS BELOW WILL NOT OCCUR

// export const AllowanceWaitingForConfirmation = openMultiplyVaultStory({
//   balanceInfo: { collateralBalance: new BigNumber('100') },
//   ilk: 'WBTC-A',
// })({
//   stage: 'allowanceWaitingForConfirmation',
//   depositAmount: new BigNumber('50'),
// })
//
// export const AllowanceWaitingForApproval = openMultiplyVaultStory({
//   balanceInfo: { collateralBalance: new BigNumber('100') },
//   ilk: 'WBTC-A',
// })({
//   stage: 'allowanceWaitingForApproval',
//   depositAmount: new BigNumber('50'),
// })

// export const AllowanceFailure = openMultiplyVaultStory({
//   balanceInfo: { collateralBalance: new BigNumber('100') },
//   ilk: 'WBTC-A',
// })({
//   stage: 'allowanceFailure',
//   depositAmount: new BigNumber('50'),
// })

// export const AllowanceInProgress = openMultiplyVaultStory({
//   ilk: 'WBTC-A',
// })({
//   stage: 'allowanceInProgress',
//   depositAmount: new BigNumber('50'),
// })

// export const AllowanceSuccess = openMultiplyVaultStory({
//   balanceInfo: { collateralBalance: new BigNumber('100') },
//   ilk: 'WBTC-A',
// })({
//   stage: 'allowanceSuccess',
//   depositAmount: new BigNumber('50'),
// })

export const OpenWaitingForConfirmation = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
})

export const OpenWaitingForApproval = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openWaitingForApproval',
  depositAmount: new BigNumber('50'),
})

export const OpenFailure = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openFailure',
  depositAmount: new BigNumber('50'),
})

export const OpenInProgress = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openInProgress',
  depositAmount: new BigNumber('50'),
})

export const OpenSuccess = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  id: new BigNumber('122345'),
  stage: 'openSuccess',
  depositAmount: new BigNumber('50'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenMultiplyVault/Stages',
  component: OpenMultiplyVaultView,
}
