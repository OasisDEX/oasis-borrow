import * as mixpanel from 'mixpanel-browser'

export enum Pages {
  dashboard = 'Dashboard',
  onramp = 'OnRamp',
  dsr = 'Dsr',
  tokenOverview = 'TokenOverview',
}

const product = 'oacas'

export const trackingEvents = {
  pageView: (location: string) => {
    mixpanel.track('Pageview', {
      product,
      id: location,
    })
  },
  buyDai: () => {
    mixpanel.track('btn-click', {
      id: 'buy-dai',
      product,
      page: Pages.dashboard,
    })
  },
  dsrDeposit: () => {
    mixpanel.track('btn-click', {
      id: 'dsr-deposit',
      product,
      page: Pages.dsr,
      section: 'dsr-overview',
    })
  },
  dsrWithdraw: () => {
    mixpanel.track('btn-click', {
      id: 'dsr-withdraw',
      product,
      page: Pages.dsr,
      section: 'dsr-overview',
    })
  },
  tokenSend: () => {
    mixpanel.track('btn-click', {
      id: 'token-send',
      product,
      page: Pages.tokenOverview,
      section: 'token-overview',
    })
  },
  tokenReceive: () => {
    mixpanel.track('btn-click', {
      id: 'token-receive',
      product,
      page: Pages.tokenOverview,
      section: 'token-overview',
    })
  },
  tokenSendProceed: () => {
    mixpanel.track('btn-click', {
      id: 'token-send-submit',
      product,
      page: Pages.tokenOverview,
      section: 'token-send-modal',
    })
  },
  dsrDepositProceed: () => {
    mixpanel.track('btn-click', {
      id: 'dsr-deposit-submit',
      product,
      page: Pages.dsr,
      section: 'deposit-modal',
    })
  },
  dsrWithdrawProceed: () => {
    mixpanel.track('btn-click', {
      id: 'dsr-withdraw-submit',
      product,
      page: Pages.dsr,
      section: 'withdraw-modal',
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
}
