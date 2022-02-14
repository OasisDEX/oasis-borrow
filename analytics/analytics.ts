import { ConnectionKind } from '@oasisdex/web3-context'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'

export type MixpanelDevelopmentType = {
  track: (eventType: string, payload: any) => void
  get_distinct_id: () => string
}

export function enableMixpanelDevelopmentMode<T>(mixpanel: T): T | MixpanelDevelopmentType {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    return {
      track: function (eventType: string, payload: any) {
        console.info('Mixpanel Event: ', eventType, payload)
      },
      get_distinct_id: () => 'test_id',
    }
  }

  return mixpanel
}

type MixpanelType = MixpanelDevelopmentType | typeof mixpanelBrowser
let mixpanel: MixpanelType = mixpanelBrowser

mixpanel = enableMixpanelDevelopmentMode<MixpanelType>(mixpanel)

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
  OpenMultiply = 'OpenMultiply',
  AdjustPosition = 'AdjustPosition',
  OtherActions = 'OtherActions',
  CloseVault = 'CloseVault',
}

function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  const distinctId = mixpanel.get_distinct_id()

  // eslint-disable-next-line
  fetch('/api/t', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName,
      eventBody,
      distinctId,
    }),
  })
}

export const trackingEvents = {
  pageView: (location: string) => {
    mixpanel.track('Pageview', {
      product,
      id: location,
    })
  },

  accountChange: (account: string, network: string, walletType: string) => {
    const eventName = 'account-change'
    const eventBody = {
      id: 'AccountChange',
      account,
      network,
      product,
      walletType,
    }

    mixpanel.track(eventName, eventBody)
    mixpanelInternalAPI(eventName, eventBody)
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
    const eventName = 'btn-click'
    const eventBody = {
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
    }

    mixpanel.track(eventName, eventBody)
    mixpanelInternalAPI(eventName, eventBody)
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
    const eventName = 'btn-click'
    const eventBody = {
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
    }

    mixpanel.track(eventName, eventBody)
    mixpanelInternalAPI(eventName, eventBody)
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

  newsletterSubscribe: (section: 'Footer' | 'Homepage') => {
    mixpanel.track('btn-click', {
      id: 'NewsletterSubscribe',
      product,
      section,
    })
  },

  multiply: {
    confirmOpenMultiplyConfirm: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
    ) => {
      mixpanel.track('btn-click', {
        id: 'Confirm',
        product,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        page: Pages.OpenMultiply,
        section: 'ConfirmVault',
      })
    },

    confirmOpenMultiplyConfirmTransaction: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        txHash,
        network,
        walletType,
        page: Pages.OpenMultiply,
        section: 'ConfirmVault',
      }

      mixpanel.track(eventName, eventBody)
      mixpanelInternalAPI(eventName, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      mixpanel.track('btn-click', {
        id: 'Confirm',
        product,
        ilk,
        multiply,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      })
    },

    adjustPositionConfirmTransaction: (
      ilk: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        multiply,
        txHash,
        network,
        walletType,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      }

      mixpanel.track(eventName, eventBody)
      mixpanelInternalAPI(eventName, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      mixpanel.track('btn-click', {
        id: 'Confirm',
        product,
        ilk,
        collateralAmount,
        daiAmount,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      })
    },

    otherActionsConfirmTransaction: (
      ilk: string,
      collateralAmount: string,
      daiAmount: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        collateralAmount,
        daiAmount,
        txHash,
        network,
        walletType,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      }

      mixpanel.track(eventName, eventBody)
      mixpanelInternalAPI(eventName, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      mixpanel.track('btn-click', {
        id: 'Confirm',
        product,
        ilk,
        debt,
        closeTo,
        page: Pages.CloseVault,
        section: 'ConfirmVault',
      })
    },

    closeVaultConfirmTransaction: (
      ilk: string,
      debt: string,
      closeTo: CloseVaultTo,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
    ) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'ConfirmTransaction',
        product,
        ilk,
        debt,
        closeTo,
        txHash,
        network,
        walletType,
        page: Pages.CloseVault,
        section: 'ConfirmVault',
      }

      mixpanel.track(eventName, eventBody)
      mixpanelInternalAPI(eventName, eventBody)
    },
  },
}

export type Tracker = typeof trackingEvents
