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
// https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
export function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  const distinctId = mixpanel.get_distinct_id()
  const currentUrl = window.location.href
  const referrer = document.referrer
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
      currentUrl,
      referrer,
    }),
  })
}

export const trackingEvents = {
  pageView: (location: string) => {
    const eventName = 'Pageview'
    const eventBody = {
      product,
      id: location,
    }

    mixpanelInternalAPI(eventName, eventBody)
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

    mixpanelInternalAPI(eventName, eventBody)
  },

  searchToken: (
    page: Pages.LandingPage | Pages.OpenVaultOverview | Pages.VaultsOverview,
    query: string,
  ) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'SearchToken',
      product,
      page,
      query,
      section: 'SelectCollateral',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  openVault: (page: Pages.LandingPage | Pages.OpenVaultOverview, ilk: string) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'OpenVault',
      product,
      ilk,
      page,
      section: 'SelectCollateral',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'Deposit',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createVaultGenerate: (firstCDP: boolean | undefined, amount: string) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'Generate',
      product,
      firstCDP,
      amount,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createVaultSetupProxy: (
    firstCDP: boolean | undefined,
    depositAmount: string,
    generateAmount: string,
  ) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'SetupProxy',
      product,
      firstCDP,
      depositAmount,
      generateAmount,
      page: Pages.VaultCreate,
      section: 'Configure',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createProxy: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'CreateProxy',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ProxyDeploy',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'PickAllowance',
      product,
      firstCDP,
      type,
      amount,
      page: Pages.VaultCreate,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  setTokenAllowance: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'SetAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Configure',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'CreateVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
  ) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
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

    mixpanelInternalAPI(eventName, eventBody)
  },

  confirmVaultEdit: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'EditVault',
      product,
      firstCDP,
      page: Pages.VaultCreate,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  overviewManage: (vaultId: string, ilk: string) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Manage',
      product,
      vaultId,
      ilk,
      page: Pages.VaultsOverview,
      section: 'Table',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  createNewVault: (firstCDP: boolean | undefined) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'createNewVault',
      product,
      firstCDP,
      section: 'NavBar',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  yourVaults: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'YourVaults',
      product,
      section: 'NavBar',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'SwitchToDai',
      product,
      ControllerIsConnected,
      page: Pages.ManageCollateral,
      section: 'Dai',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  switchToCollateral: (ControllerIsConnected: boolean) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'SwitchToCollateral',
      product,
      ControllerIsConnected,
      page: Pages.ManageDai,
      section: 'Collateral',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageVaultDepositAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'DepositAmount',
      product,
      page,
      amount,
      setMax,
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageVaultGenerateAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'GenerateAmount',
      product,
      page,
      amount,
      setMax,
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageVaultWithdrawAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'WithdrawAmount',
      product,
      page,
      amount,
      setMax,
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageVaultPaybackAmount: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'PaybackAmount',
      product,
      page,
      amount,
      setMax,
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageVaultConfirmVaultEdit: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'EditVault',
      product,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  // Can we distinguish if went through collateral/daiEditing?
  manageVaultConfirm: (
    page: Pages.ManageCollateral | Pages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
  ) => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      ilk,
      collateralAmount,
      daiAmount,
      page,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(eventName, eventBody)
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

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageCollateralPickAllowance: (type: string, amount: string) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'PickAllowance',
      product,
      type,
      amount,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageCollateralApproveAllowance: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageCollateral,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageDaiPickAllowance: (type: string, amount: string) => {
    const eventName = 'input-change'
    const eventBody = {
      id: 'PickAllowance',
      product,
      type,
      amount,
      page: Pages.ManageDai,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  manageDaiApproveAllowance: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'ApproveAllowance',
      product,
      page: Pages.ManageDai,
      section: 'Allowance',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Deposit',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageCollateral,
      section: 'Withdraw',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Generate',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'Confirm',
      product,
      page: Pages.ManageDai,
      section: 'Payback',
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  newsletterSubscribe: (section: 'Footer' | 'Homepage') => {
    const eventName = 'btn-click'
    const eventBody = {
      id: 'NewsletterSubscribe',
      product,
      section,
    }

    mixpanelInternalAPI(eventName, eventBody)
  },

  multiply: {
    confirmOpenMultiplyConfirm: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
    ) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        page: Pages.OpenMultiply,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(eventName, eventBody)
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

      mixpanelInternalAPI(eventName, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        multiply,
        page: Pages.AdjustPosition,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(eventName, eventBody)
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

      mixpanelInternalAPI(eventName, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        collateralAmount,
        daiAmount,
        page: Pages.OtherActions,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(eventName, eventBody)
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

      mixpanelInternalAPI(eventName, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      const eventName = 'btn-click'
      const eventBody = {
        id: 'Confirm',
        product,
        ilk,
        debt,
        closeTo,
        page: Pages.CloseVault,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(eventName, eventBody)
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

      mixpanelInternalAPI(eventName, eventBody)
    },
  },
}

export type Tracker = typeof trackingEvents
