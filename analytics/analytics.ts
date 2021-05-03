import BigNumber from 'bignumber.js'
import * as mixpanel from 'mixpanel-browser'

const product = 'borrow'

export enum Pages {
  vaultCreate = 'vaultCreate',
  Overview = 'Overview',
  ManageCollateral = 'ManageCollateral',
  ManageDai = 'ManageDai',
}

export const trackingEvents = {
  pageView: (location: string) => {
    mixpanel.track('Pageview', {
      product,
      id: location,
    })
  },

  accountChange: (account: string, network: string, walletType: string) => {
    mixpanel.track('account-change', {
      account,
      network,
      product,
      walletType,
    })
  },

  searchToken: () => {
    mixpanel.track('input-change', {
      id: 'SearchToken',
      product,
      page: Pages.vaultCreate,
      section: 'SelectCollateral',
    })
  },
  openVault: () => {
    mixpanel.track('btn-click', {
      id: 'openVault',
      product,
      page: Pages.vaultCreate,
      section: 'SelectCollateral',
    })
  },
  deposit: () => {
    mixpanel.track('input-change', {
      id: 'Deposit',
      product,
      page: Pages.vaultCreate,
      section: 'Configure',
    })
  },
  generate: () => {
    mixpanel.track('btn-click', {
      id: 'Generate',
      product,
      page: Pages.vaultCreate,
      section: 'Configure',
    })
  },
  confirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.vaultCreate,
      section: 'Configure',
    })
  },
  createProxy: () => {
    mixpanel.track('btn-click', {
      id: 'CreateProxy',
      product,
      page: Pages.vaultCreate,
      section: 'ProxyDeploy',
    })
  },
  pickAllowance: () => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      page: Pages.vaultCreate,
      section: 'Allowance',
    })
  },
  approveAllowance: () => {
    mixpanel.track('btn-click', {
      id: 'ApproveAllowance',
      product,
      page: Pages.vaultCreate,
      section: 'Allowance',
    })
  },
  createVaultDeposit: () => {
    mixpanel.track('input-change', {
      id: 'Deposit',
      product,
      page: Pages.vaultCreate,
      section: 'CreateVault',
    })
  },
  createVaultGenerate: () => {
    mixpanel.track('input-change', {
      id: 'Generate',
      product,
      page: Pages.vaultCreate,
      section: 'CreateVault',
    })
  },
  createVaultConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.vaultCreate,
      section: 'CreateVault',
    })
  },
  confirmVaultConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.vaultCreate,
      section: 'ConfirmVault',
    })
  },
  confirmVaultEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      page: Pages.vaultCreate,
      section: 'ConfirmVault',
    })
  },
  overviewSearchToken: () => {
    mixpanel.track('input-change', {
      id: 'SearchToken',
      product,
      page: Pages.Overview,
      section: 'Table',
    })
  },
  overviewManage: () => {
    mixpanel.track('btn-click', {
      id: 'Manage',
      product,
      page: Pages.Overview,
      section: 'Table',
    })
  },
  createNewVault: () => {
    mixpanel.track('btn-click', {
      id: 'createNewVault',
      product,
      // page: Pages.Overview,
      section: 'NavBar',
    })
  },
  yourVaults: (numberOfVaults: number) => {
    mixpanel.track('btn-click', {
      id: 'YourVaults',
      product,
      firstCdp: numberOfVaults > 0,
      // page: Pages.Overview,
      section: 'NavBar',
    })
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    mixpanel.track('btn-click', {
      id: 'SwitchToDai',
      product,
      ControllerIsConnected,
      page: Pages.ManageCollateral,
      section: 'Dai',
    })
  },
  switchToCollateral: (ControllerIsConnected: boolean) => {
    mixpanel.track('btn-click', {
      id: 'SwitchToCollateral',
      product,
      ControllerIsConnected,
      page: Pages.ManageDai,
      section: 'Collateral',
    })
  },

  manageCollateralDepositAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'DepositAmount',
        product,
        page: Pages.ManageCollateral,
        section: 'Deposit',
        amount: amount.toNumber(),
      })
    }
  },
  manageCollateralAddGeneration: () => {
    mixpanel.track('btn-click', {
      id: 'AddGeneration',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    })
  },
  manageCollateralGenerateAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'GenerateAmount',
        product,
        page: Pages.ManageCollateral,
        section: 'Deposit',
        amount: amount.toNumber(),
      })
    }
  },
  manageCollateralRemoveGeneration: () => {
    mixpanel.track('btn-click', {
      id: 'RemoveGeneration',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    })
  },
  manageCollateralDepositConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    })
  },
  manageCollateralPickAllowance: () => {
    mixpanel.track('input-change', {
      id: 'GenerateAmount',
      product,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    })
  },
  manageCollateralApproveAllowance: () => {
    mixpanel.track('btn-click', {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    })
  },
  manageCollateralConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'ConfirmVault',
    })
  },
  manageCollateralEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      page: Pages.ManageCollateral,
      section: 'ConfirmVault',
    })
  },
  manageCollateralWithdrawAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'WithdrawAmount',
        product,
        page: Pages.ManageCollateral,
        section: 'Withdraw',
        amount: amount.toNumber(),
      })
    }
  },
  manageCollateralAddPayback: () => {
    mixpanel.track('btn-click', {
      id: 'AddPayback',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    })
  },
  manageCollateralPaybackAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'PaybackAmount',
        product,
        page: Pages.ManageCollateral,
        section: 'Withdraw',
      })
    }
  },
  manageCollateralRemovePayback: () => {
    mixpanel.track('btn-click', {
      id: 'RemovePayback',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    })
  },
  manageCollateralWithdrawConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    })
  },

  manageDaiPaybackAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'PaybackAmount',
        product,
        page: Pages.ManageDai,
        section: 'Payback',
        amount: amount.toNumber(),
      })
    }
  },

  manageDaiAddWithdraw: () => {
    mixpanel.track('btn-click', {
      id: 'AddWithdraw',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    })
  },

  manageDaiWithdrawAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'WithdrawAmount',
        product,
        page: Pages.ManageDai,
        section: 'Payback',
        amount: amount.toNumber(),
      })
    }
  },

  manageDaiRemoveWithdraw: () => {
    mixpanel.track('btn-click', {
      id: 'RemoveWithdraw',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    })
  },

  manageDaiPaybackConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    })
  },

  manageDaiPickAllowance: () => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      page: Pages.ManageDai,
      section: 'Allowance',
    })
  },
  manageDaiApproveAllowance: () => {
    mixpanel.track('btn-click', {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageDai,
      section: 'Allowance',
    })
  },

  manageDaiConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'ConfirmVault',
    })
  },
  manageDaiEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      page: Pages.ManageDai,
      section: 'ConfirmVault',
    })
  },

  manageDaiGenerateAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'GenerateAmount',
        product,
        page: Pages.ManageDai,
        section: 'Generate',
        amount: amount.toNumber(),
      })
    }
  },

  manageDaiAddDeposit: () => {
    mixpanel.track('btn-click', {
      id: 'AddDeposit',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    })
  },

  manageDaiDepositAmount: (amount?: BigNumber) => {
    if (amount && amount.gt(0)) {
      mixpanel.track('input-change', {
        id: 'DepositAmount',
        product,
        page: Pages.ManageDai,
        section: 'Generate',
        amount: amount.toNumber(),
      })
    }
  },

  manageDaiRemoveDeposit: () => {
    mixpanel.track('btn-click', {
      id: 'RemoveDeposit',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    })
  },

  manageDaiGenerateConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    })
  },
}
