import { ConnectionKind } from '@oasisdex/web3-context'
import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'

type MixpanelType = { track: (eventType: string, payload: any) => void } | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

if (env !== 'production' && env !== 'staging') {
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

  openVault: (page: Pages.LandingPage | Pages.OpenVaultOverview, ilk: string) => {
    mixpanel.track('btn-click', {
      id: 'OpenVault',
      product,
      ilk,
      page,
      section: 'SelectCollateral',
    })
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    mixpanel.track('input-change', {
      id: 'Deposit',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  createVaultGenerate: (firstCDP: boolean | undefined, amount: string) => {
    mixpanel.track('input-change', {
      id: 'Generate',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  createVaultSetupProxy: (
    firstCDP: boolean | undefined,
    depositAmount: string,
    generateAmount: string,
  ) => {
    mixpanel.track('btn-click', {
      id: 'SetupProxy',
      product,
      firstCDP,
      depositAmount,
      generateAmount,
      page: Pages.VaultCreate,
      section: 'Configure',
    })
  },

  createProxy: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'CreateProxy',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ProxyDeploy',
    })
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    mixpanel.track('input-change', {
      id: 'PickAllowance',
      product,
      firstCDP,
      type,
      amount,
      page: Pages.VaultCreate,
      section: 'Allowance',
    })
  },

  setTokenAllowance: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'SetAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Configure',
    })
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'ApproveAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Allowance',
    })
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    })
  },

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
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
    firstCDP: boolean | undefined,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    mixpanel.track('btn-click', {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      txHash,
      network,
      walletType,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    })
  },

  confirmVaultEdit: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'EditVault',
      product,
      firstCDP,
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

  createNewVault: (firstCDP: boolean | undefined) => {
    mixpanel.track('btn-click', {
      id: 'createNewVault',
      product,
      firstCDP,
      section: 'NavBar',
    })
  },

  yourVaults: () => {
    mixpanel.track('btn-click', {
      id: 'YourVaults',
      product,
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
      section: 'ConfirmVault',
    })
  },

  // Can we distinguish if went through collateral/daiEditing?
  manageVaultConfirm: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
  ) => {
    mixpanel.track('btn-click', {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      page,
      section: 'ConfirmVault',
    })
  },

  manageVaultConfirmTransaction: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    mixpanel.track('btn-click', {
      id: 'ConfirmTransaction',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      txHash,
      network,
      walletType,
      page,
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
