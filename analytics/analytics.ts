import type { Route } from '@lifi/sdk'
import type { RouteExecutionUpdate } from '@lifi/widget'
import { ProductType } from 'analytics/common'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import browserDetect from 'browser-detect'
import { getDiscoverMixpanelPage } from 'features/discover/helpers/getDiscoverMixpanelPage'
import { DiscoverPages } from 'features/discover/types'
import { CloseVaultTo } from 'features/multiply/manage/pipes/types'
import { ConnectionKind } from 'features/web3Context'
import { formatPrecision } from 'helpers/formatters/format'
import { camelCase, upperFirst } from 'lodash'
import * as mixpanelBrowser from 'mixpanel-browser'
import getConfig from 'next/config'
import { match, P } from 'ts-pattern'

import {
  MixpanelAutomationEventIds,
  MixpanelAutomationEventsAdditionalParams,
  MixpanelCommonAnalyticsSections,
  MixpanelDevelopmentType,
  MixpanelEventTypes,
  MixpanelNotificationsEventAdditionalParams,
  MixpanelNotificationsEventIds,
  MixpanelPages,
  MixpanelPropertyNameType,
  MixpanelSwapWidgetEvents,
  MixpanelTopBannerEvents,
  MixpanelType,
} from './types'

export function enableMixpanelDevelopmentMode<T>(mixpanel: T): T | MixpanelDevelopmentType {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    return {
      track: function (eventType: string, payload: any) {
        console.info('\n✨ Mixpanel Event: ', eventType, payload, '\n')
      },
      get_distinct_id: () => 'test_id',
      has_opted_out_tracking: () => false,
      get_property: (propertyName: MixpanelPropertyNameType) => {
        switch (propertyName) {
          case '$initial_referrer':
            return '$direct'
          case '$user_id':
            return 'test_user_id'
          default:
            return null
        }
      },
    }
  }

  return mixpanel
}

export function logMixpanelEventInDevelopmentMode(eventType: string, payload: any) {
  const env = getConfig()?.publicRuntimeConfig.mixpanelEnv || process.env.MIXPANEL_ENV

  if (env !== 'production' && env !== 'staging') {
    console.info('Mixpanel Event: ', eventType, payload)
  }
}

let mixpanel: MixpanelType = mixpanelBrowser

mixpanel = enableMixpanelDevelopmentMode<MixpanelType>(mixpanel)

export const INPUT_DEBOUNCE_TIME = 800

// https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel
export function mixpanelInternalAPI(eventName: string, eventBody: { [key: string]: any }) {
  let win: Window

  if (typeof window === 'undefined') {
    var loc = { hostname: '' }

    win = {
      navigator: { userAgent: '' },
      document: { location: loc, referrer: '' },
      screen: { width: 0, height: 0 },
      location: loc,
    } as Window
  } else {
    win = window
  }

  logMixpanelEventInDevelopmentMode(eventName, eventBody)

  const { name, mobile, os, versionNumber } = browserDetect()
  const initialReferrer = mixpanel.get_property('$initial_referrer')
  const initialReferringDomain = initialReferrer
    ? initialReferrer === '$direct'
      ? '$direct'
      : new URL(initialReferrer).hostname
    : ''
  void fetch(`/api/t`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventBody,
      eventName,
      distinctId: mixpanel.get_distinct_id(),
      currentUrl: win.location.href,
      ...(!mixpanel.has_opted_out_tracking() && {
        browser: upperFirst(name),
        browserVersion: versionNumber,
        initialReferrer,
        initialReferringDomain,
        mobile,
        os,
        screenHeight: win.innerHeight,
        screenWidth: win.innerWidth,
        userId: mixpanel.get_property('$user_id'),
      }),
    }),
  })
}

export interface MixpanelUserContext {
  walletAddres: string
  walletType: string
  browserLanguage: string
}
export function getMixpanelUserContext(language: string, context?: Context): MixpanelUserContext {
  return {
    walletAddres: context?.status === 'connected' ? context.account : 'not-connected',
    walletType: context?.status === 'connected' ? context.connectionKind : 'not-connected',
    browserLanguage: language,
  }
}

export const trackingEvents = {
  landingPageView: (utm: { [key: string]: string | string[] | undefined }) => {
    const eventBody = {
      product: ProductType.BORROW,
      page: MixpanelPages.LandingPage,
      utm_source: utm.utmSource ? utm.utmSource : 'direct',
      utm_medium: utm.utmMedium ? utm.utmMedium : 'none',
      utm_campaign: utm.utmCampaign ? utm.utmCampaign : 'none',
    }

    mixpanelInternalAPI(MixpanelEventTypes.Pageview, eventBody)
  },

  pageView: (location: string) => {
    const eventBody = {
      product: ProductType.BORROW,
      id: location,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.Pageview, eventBody)
  },

  accountChange: (
    account: string,
    network: string,
    walletType: string,
    connectionMethod: string,
    walletLabel: string | undefined,
  ) => {
    const eventBody = {
      id: 'AccountChange',
      account,
      network,
      product: ProductType.BORROW,
      walletType,
      connectionMethod,
      walletLabel,
    }

    mixpanelInternalAPI(MixpanelEventTypes.AccountChange, eventBody)
  },

  searchToken: (
    page:
      | MixpanelPages.LandingPage
      | MixpanelPages.OpenVaultOverview
      | MixpanelPages.VaultsOverview,
    query: string,
  ) => {
    const eventBody = {
      id: 'SearchToken',
      product: ProductType.BORROW,
      page,
      query,
      section: 'SelectCollateral',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  openVault: (page: MixpanelPages.LandingPage | MixpanelPages.OpenVaultOverview, ilk: string) => {
    const eventBody = {
      id: 'OpenVault',
      product: ProductType.BORROW,
      ilk,
      page,
      section: 'SelectCollateral',
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createVaultDeposit: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Deposit',
      product: ProductType.BORROW,
      firstCDP,
      amount,
      page: MixpanelPages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  createVaultGenerate: (firstCDP: boolean | undefined, amount: string) => {
    const eventBody = {
      id: 'Generate',
      product: ProductType.BORROW,
      firstCDP,
      amount,
      page: MixpanelPages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  createVaultSetupProxy: (
    firstCDP: boolean | undefined,
    depositAmount: string,
    generateAmount: string,
  ) => {
    const eventBody = {
      id: 'SetupProxy',
      product: ProductType.BORROW,
      firstCDP,
      depositAmount,
      generateAmount,
      page: MixpanelPages.VaultCreate,
      section: 'Configure',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createProxy: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'CreateProxy',
      product: ProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'ProxyDeploy',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  pickAllowance: (firstCDP: boolean | undefined, type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: ProductType.BORROW,
      firstCDP,
      type,
      amount,
      page: MixpanelPages.VaultCreate,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  setTokenAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'SetAllowance',
      product: ProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'Configure',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  approveAllowance: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: ProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createVaultConfirm: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'CreateVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  confirmVaultConfirm: (
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    firstCDP: boolean | undefined,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
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
    const eventBody = {
      id: 'ConfirmTransaction',
      product: ProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      firstCDP,
      txHash,
      network,
      walletType,
      page: MixpanelPages.VaultCreate,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  confirmVaultEdit: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'EditVault',
      product: ProductType.BORROW,
      firstCDP,
      page: MixpanelPages.VaultCreate,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  overviewManage: (vaultId: string, ilk: string) => {
    const eventBody = {
      id: 'Manage',
      product: ProductType.BORROW,
      vaultId,
      ilk,
      page: MixpanelPages.VaultsOverview,
      section: 'Table',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  createNewVault: (firstCDP: boolean | undefined) => {
    const eventBody = {
      id: 'createNewVault',
      product: ProductType.BORROW,
      firstCDP,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  yourVaults: () => {
    const eventBody = {
      id: 'YourVaults',
      product: ProductType.BORROW,
      section: 'NavBar',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  switchToDai: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToDai',
      product: ProductType.BORROW,
      ControllerIsConnected,
      page: MixpanelPages.ManageCollateral,
      section: 'Dai',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  switchToCollateral: (ControllerIsConnected: boolean) => {
    const eventBody = {
      id: 'SwitchToCollateral',
      product: ProductType.BORROW,
      ControllerIsConnected,
      page: MixpanelPages.ManageDai,
      section: 'Collateral',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageVaultDepositAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'DepositAmount',
      product: ProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultGenerateAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'GenerateAmount',
      product: ProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultWithdrawAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'WithdrawAmount',
      product: ProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultPaybackAmount: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    amount: string,
    setMax: boolean,
  ) => {
    const eventBody = {
      id: 'PaybackAmount',
      product: ProductType.BORROW,
      page,
      amount,
      setMax,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageVaultConfirmVaultEdit: () => {
    const eventBody = {
      id: 'EditVault',
      product: ProductType.BORROW,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Can we distinguish if went through collateral/daiEditing?
  manageVaultConfirm: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
  ) => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      page,
      section: 'ConfirmVault',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageVaultConfirmTransaction: (
    page: MixpanelPages.ManageCollateral | MixpanelPages.ManageDai,
    ilk: string,
    collateralAmount: string,
    daiAmount: string,
    txHash: string,
    network: string,
    walletType: ConnectionKind,
  ) => {
    const eventBody = {
      id: 'ConfirmTransaction',
      product: ProductType.BORROW,
      ilk,
      collateralAmount,
      daiAmount,
      txHash,
      network,
      walletType,
      page,
      section: 'ConfirmVault',
    }

    mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageCollateralPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: ProductType.BORROW,
      type,
      amount,
      page: MixpanelPages.ManageCollateral,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageCollateralApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  manageDaiPickAllowance: (type: string, amount: string) => {
    const eventBody = {
      id: 'PickAllowance',
      product: ProductType.BORROW,
      type,
      amount,
      page: MixpanelPages.ManageDai,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
  },

  manageDaiApproveAllowance: () => {
    const eventBody = {
      id: 'ApproveAllowance',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: 'Allowance',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Collateral and type into Deposit
  manageCollateralDepositConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: 'Deposit',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Collateral and type into Withdraw
  manageCollateralWithdrawConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageCollateral,
      section: 'Withdraw',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // First Confirm button when the user is on Dai and type into Generate
  manageDaiGenerateConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: 'Generate',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  // Confirm button when the user is on Dai and type into Payback
  manageDaiPaybackConfirm: () => {
    const eventBody = {
      id: 'Confirm',
      product: ProductType.BORROW,
      page: MixpanelPages.ManageDai,
      section: 'Payback',
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  newsletterSubscribe: (section: 'Footer' | 'Homepage') => {
    const eventBody = {
      id: 'NewsletterSubscribe',
      product: ProductType.BORROW,
      section,
    }

    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
  },

  multiply: {
    confirmOpenMultiplyConfirm: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
    ) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.MULTIPLY,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        page: MixpanelPages.OpenMultiply,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    confirmOpenMultiplyConfirmTransaction: (
      ilk: string,
      firstCDP: boolean | undefined,
      collAmount: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        firstCDP,
        collAmount,
        multiply,
        txHash,
        network,
        walletType,
        page: MixpanelPages.OpenMultiply,
        oasisFee,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirm: (ilk: string, multiply: string) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.MULTIPLY,
        ilk,
        multiply,
        page: MixpanelPages.AdjustPosition,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    adjustPositionConfirmTransaction: (
      ilk: string,
      multiply: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        multiply,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.AdjustPosition,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirm: (ilk: string, collateralAmount: string, daiAmount: string) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.MULTIPLY,
        ilk,
        collateralAmount,
        daiAmount,
        page: MixpanelPages.OtherActions,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    otherActionsConfirmTransaction: (
      ilk: string,
      collateralAmount: string,
      daiAmount: string,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        collateralAmount,
        daiAmount,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.OtherActions,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirm: (ilk: string, debt: string, closeTo: CloseVaultTo) => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.BORROW,
        ilk,
        debt,
        closeTo,
        page: MixpanelPages.CloseVault,
        section: 'ConfirmVault',
      }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },

    closeVaultConfirmTransaction: (
      ilk: string,
      debt: string,
      closeTo: CloseVaultTo,
      txHash: string,
      network: string,
      walletType: ConnectionKind,
      oasisFee: string,
    ) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.MULTIPLY,
        ilk,
        debt,
        closeTo,
        txHash,
        network,
        walletType,
        oasisFee,
        page: MixpanelPages.CloseVault,
        section: 'ConfirmVault',
      }

      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },
  earn: {
    stETHOpenPositionDepositAmount: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'DepositAmount',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmDeposit: (depositAmount: BigNumber) => {
      const eventBody = {
        id: 'ConfirmDeposit',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionMoveSlider: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'MoveSlider',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    stETHOpenPositionConfirmRisk: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmRisk',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHOpenPositionConfirmTransaction: (depositAmount: BigNumber, riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.EARN,
        depositAmount: depositAmount.toString(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.OpenEarnSTETH,
        section: MixpanelCommonAnalyticsSections.OpenPosition,
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    aaveAdjustRiskSliderAction: (
      action: 'ConfirmRisk' | 'MoveSlider',
      riskRatio: BigNumber,
      productType: ProductType,
    ) => {
      const eventBody = {
        id: action,
        product: productType.toLocaleLowerCase(),
        riskRatio: formatPrecision(riskRatio, 4),
        page: {
          [ProductType.MULTIPLY]: MixpanelPages.AdjustPosition,
          [ProductType.EARN]: MixpanelPages.ManageSTETH,
          [ProductType.BORROW]: '',
        }[productType.toLocaleLowerCase()],
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(
        action === 'MoveSlider' ? MixpanelEventTypes.InputChange : MixpanelEventTypes.ButtonClick,
        eventBody,
      )
    },
    stETHAdjustRiskConfirmTransaction: (riskRatio: BigNumber) => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.EARN,
        riskRatio: formatPrecision(riskRatio, 4),
        page: MixpanelPages.ManageSTETH,
        section: 'AdjustRisk',
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirm: () => {
      const eventBody = {
        id: 'Confirm',
        product: ProductType.EARN,
        page: MixpanelPages.ManageSTETH,
        section: 'ClosePosition',
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
    stETHClosePositionConfirmTransaction: () => {
      const eventBody = {
        id: 'ConfirmTransaction',
        product: ProductType.EARN,
        page: MixpanelPages.ManageSTETH,
        section: 'ClosePosition',
      }
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },

  discover: {
    selectedInNavigation: (userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, {
        product: MixpanelPages.DiscoverOasis,
        page: MixpanelPages.LandingPage,
        section: 'Header/tabs',
        id: 'Discover',
        ...userContext,
      })
    },
    selectedCategory: (kind: DiscoverPages, userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, {
        product: MixpanelPages.DiscoverOasis,
        page: MixpanelPages.DiscoverOasis,
        section: 'Categories',
        id: upperFirst(camelCase(kind)),
        ...userContext,
      })
    },
    selectedFilter: (
      kind: DiscoverPages,
      label: string,
      value: string,
      userContext: MixpanelUserContext,
    ) => {
      mixpanelInternalAPI(MixpanelEventTypes.InputChange, {
        product: MixpanelPages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Filters',
        id: `${upperFirst(camelCase(label))}Filter`,
        [label]: value,
        ...userContext,
      })
    },
    clickedTableBanner: (kind: DiscoverPages, link: string, userContext: MixpanelUserContext) => {
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, {
        product: MixpanelPages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Table',
        id: 'TableBanner',
        link,
        ...userContext,
      })
    },
    viewPosition: (kind: DiscoverPages, vaultId: string | number) => {
      mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, {
        product: MixpanelPages.DiscoverOasis,
        page: getDiscoverMixpanelPage(kind),
        section: 'Table',
        id: 'ViewPosition',
        vaultId,
      })
    },
  },
  automation: {
    inputChange: (
      id: MixpanelAutomationEventIds,
      page: string,
      section: MixpanelCommonAnalyticsSections.Form,
      additionalParams: MixpanelAutomationEventsAdditionalParams,
    ) => {
      const eventBody = { id, page, section, product: 'Automation', ...additionalParams }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.InputChange, eventBody)
    },
    buttonClick: (
      id: MixpanelAutomationEventIds,
      page: string,
      section: MixpanelCommonAnalyticsSections,
      additionalParams: MixpanelAutomationEventsAdditionalParams,
    ) => {
      const eventBody = { id, page, section, product: 'Automation', ...additionalParams }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },
  notifications: {
    scroll: (
      id: MixpanelNotificationsEventIds,
      section: MixpanelCommonAnalyticsSections.NotificationCenter,
      additionalParams: MixpanelNotificationsEventAdditionalParams,
    ) => {
      const eventBody = { id, section, product: 'Notifications', ...additionalParams }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.OnScroll, eventBody)
    },
    buttonClick: (
      id: MixpanelNotificationsEventIds,
      section:
        | MixpanelCommonAnalyticsSections.HeaderTabs
        | MixpanelCommonAnalyticsSections.NotificationCenter
        | MixpanelCommonAnalyticsSections.NotificationPreferences,
      additionalParams: MixpanelNotificationsEventAdditionalParams,
    ) => {
      const eventBody = { id, section, product: 'Notifications', ...additionalParams }

      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(MixpanelEventTypes.ButtonClick, eventBody)
    },
  },
  swapWidgetEvent: (id: MixpanelSwapWidgetEvents, eventData: Route | RouteExecutionUpdate) => {
    const eventBody = { id, section: 'SwapWidget', product: 'SwapWidget', eventData }
    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.SwapWidgetEvent, eventBody)
  },
  topBannerEvent: (id: MixpanelTopBannerEvents, topBannerName: string) => {
    const eventBody = { id, section: 'TopBanner', product: 'TopBanner', topBannerName }
    !mixpanel.has_opted_out_tracking() &&
      mixpanelInternalAPI(MixpanelEventTypes.TopBannerEvent, eventBody)
  },
  daiSavingsRate: (
    event: MixpanelEventTypes.InputChange | MixpanelEventTypes.ButtonClick,
    eventData: {
      depositAmount: number
      operation?: 'deposit' | 'withdraw' | 'convert'
      txHash?: string
      network?: string
      walletType?: string
    },
  ) => {
    const { txHash, ...eventDataRest } = eventData
    const eventCommons = {
      section: MixpanelCommonAnalyticsSections.Form,
      page: MixpanelPages.DAISavingsRate,
      product: ProductType.EARN,
      txHash,
    }
    if (event === MixpanelEventTypes.InputChange) {
      !mixpanel.has_opted_out_tracking() &&
        mixpanelInternalAPI(event, {
          ...eventCommons,
          id: {
            [MixpanelEventTypes.InputChange]: 'DepositAmount',
          },
          eventData: { txHash, ...eventDataRest },
        })
    }

    const eventId = match(eventDataRest.operation)
      .with('deposit', () => 'ConfirmDeposit')
      .with('withdraw', () => 'ConfirmWithdraw')
      .with('convert', () => 'ConfirmConvert')
      .with(P._, () => 'Undefiend')
      .run()

    if (event === MixpanelEventTypes.ButtonClick) {
      mixpanelInternalAPI(event, {
        ...eventCommons,
        id: {
          [MixpanelEventTypes.ButtonClick]: eventId,
        },
        eventData: mixpanel.has_opted_out_tracking() ? { txHash } : { txHash, ...eventDataRest },
      })
    }
  },
}

export type Tracker = typeof trackingEvents
