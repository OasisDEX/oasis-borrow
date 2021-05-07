import * as mixpanelBrowser from 'mixpanel-browser'

type MixpanelType = { track: (eventType: string, payload: any) => void } | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

if (process.env.NODE_ENV !== 'production') {
  mixpanel = {
    track: function (eventType: string, payload: any) {
      console.info('Mixpanel Event: ', eventType, payload)
    },
  }
}

const product = 'borrow'
export const INPUT_DEBOUNCE_TIME = 800

export enum Pages {
  VaultCreate = 'VaultCreate',
  IlksList = 'IlksList',
  LandingPage = 'LandingPage',
  OpenVaultOverview = 'OpenVaultOverview',
  VaultsOverview = 'VaultsOverview',
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

  searchToken: (
    page: Pages.LandingPage | Pages.OpenVaultOverview | Pages.VaultsOverview,
    query: string,
  ) => {
    mixpanel.track('input-change', {
      id: 'SearchToken',
      product,
      page,
      query,
      section: 'SelectCollateral',
    })
  },

  openVault: (ilk: string) => {
    mixpanel.track('btn-click', {
      id: 'OpenVault',
      product,
      ilk,
      page: Pages.VaultCreate,
      section: 'SelectCollateral',
    })
  },

  createVaultDeposit: (amount: string) => {
    mixpanel.track('input-change', {
      id: 'Deposit',
      product,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  createVaultGenerate: (amount: string) => {
    mixpanel.track('input-change', {
      id: 'Generate',
      product,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  createVaultSetupProxy: () => {
    mixpanel.track('btn-click', {
      id: 'SetupProxy',
      product,
      page: Pages.VaultCreate,
      section: 'Configure',
    })
  },

  createProxy: () => {
    mixpanel.track('btn-click', {
      id: 'CreateProxy',
      product,
      page: Pages.VaultCreate,
      section: 'ProxyDeploy',
    })
  },

  pickAllowance: (type: string, amount: string) => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      type,
      amount,
      page: Pages.VaultCreate,
      section: 'Allowance',
    })
  },

  setTokenAllowance: () => {
    mixpanel.track('btn-click', {
      id: 'SetAllowance',
      product,
      page: Pages.VaultCreate,
      section: 'Configure',
    })
  },

  approveAllowance: () => {
    mixpanel.track('btn-click', {
      id: 'ApproveAllowance',
      product,
      page: Pages.VaultCreate,
      section: 'Allowance',
    })
  },

  createVaultConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  confirmVaultConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    })
  },

  confirmVaultEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    })
  },

  overviewManage: (vaultId: string, ilk: string) => {
    mixpanel.track('btn-click', {
      id: 'Manage',
      product,
      vaultId,
      ilk,
      page: Pages.VaultsOverview,
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

  manageVaultDepositAmount: (page: Pages.ManageCollateral | Pages.ManageDai, amount: string) => {
    mixpanel.track('input-change', {
      id: 'DepositAmount',
      product,
      page,
      amount,
    })
  },

  manageVaultGenerateAmount: (page: Pages.ManageCollateral | Pages.ManageDai, amount: string) => {
    mixpanel.track('input-change', {
      id: 'GenerateAmount',
      product,
      page,
      amount,
    })
  },

  manageVaultWithdrawAmount: (page: Pages.ManageCollateral | Pages.ManageDai, amount: string) => {
    mixpanel.track('input-change', {
      id: 'WithdrawAmount',
      product,
      page,
      amount,
    })
  },

  manageVaultPaybackAmount: (page: Pages.ManageCollateral | Pages.ManageDai, amount: string) => {
    mixpanel.track('input-change', {
      id: 'PaybackAmount',
      product,
      page,
      amount,
    })
  },

  manageVaultConfirmVaultEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      section: 'ConfirmVault',
    })
  },

  manageCollateralPickAllowance: (type: string, amount: string) => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      type,
      amount,
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

  manageDaiPickAllowance: (type: string, amount: string) => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      type,
      amount,
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

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    })
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    })
  },

  // Second Confirm when the user is on Collateral and typed into Deposit or Withdraw
  manageCollateralConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'ConfirmVault',
    })
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    })
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    })
  },

  // Second Confirm when the user is on Dai and typed into Generate or Payback
  manageDaiConfirm: () => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'ConfirmVault',
    })
  },
}

export type Tracker = typeof trackingEvents
