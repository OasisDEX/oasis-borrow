import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'

type MixpanelType = { track: (eventType: string, payload: any) => void } | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

if (env !== 'production') {
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
  ManageVault = 'ManageVault',
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

  openVault: (page: Pages.LandingPage | Pages.OpenVaultOverview, ilk: string) => {
    mixpanel.track('btn-click', {
      id: 'OpenVault',
      product,
      ilk,
      page,
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

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean,
  ) => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    })
  },

  confirmVaultConfirmTransaction: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean,
    txHash: string,
  ) => {
    mixpanel.track('btn-click', {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      txHash,
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

  manageVaultDepositAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    mixpanel.track('input-change', {
      id: 'DepositAmount',
      product,
      page,
      amount,
      setMax,
    })
  },

  manageVaultGenerateAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    mixpanel.track('input-change', {
      id: 'GenerateAmount',
      product,
      page,
      amount,
      setMax,
    })
  },

  manageVaultWithdrawAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    mixpanel.track('input-change', {
      id: 'WithdrawAmount',
      product,
      page,
      amount,
      setMax,
    })
  },

  manageVaultPaybackAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    mixpanel.track('input-change', {
      id: 'PaybackAmount',
      product,
      page,
      amount,
      setMax,
    })
  },

  manageVaultConfirmVaultEdit: () => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      page: Pages.ManageVault,
      section: 'ConfirmVault',
    })
  },

  manageVaultConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      page: Pages.ManageVault,
      section: 'ConfirmVault',
    })
  },

  manageVaultConfirmTransaction: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    txHash: string,
  ) => {
    mixpanel.track('btn-click', {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      txHash,
      page: Pages.ManageVault,
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
}

export type Tracker = typeof trackingEvents
