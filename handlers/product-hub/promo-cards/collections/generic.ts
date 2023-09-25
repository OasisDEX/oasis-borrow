import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { promoCardStar, selectBorrow, selectEarn, selectMultiply } from 'theme/icons'

export const promoCardEarnOnYourAssets = {
  icon: selectEarn,
  title: { key: 'product-hub.promo-cards.earn-on-your-assets' },
  description: { key: 'product-hub.promo-cards.lend-and-stake-to-earn' },
  link: { href: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY, label: { key: 'Learn more' } },
}

export const promoCardFullySelfCustodial = {
  icon: promoCardStar,
  title: { key: 'product-hub.promo-cards.earn-fully-self-custodial' },
  description: { key: 'product-hub.promo-cards.you-always-stay-in-control' },
  link: {
    href: INTERNAL_LINKS.security,
    label: { key: 'product-hub.promo-cards.check-out-our-security' },
  },
}

export const promoCardHowToUseBorrowOnAjna = {
  image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  title: { key: 'product-hub.promo-cards.how-to-use-borrow-on-ajna' },
  description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
  link: { href: EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_BORROW, label: { key: 'Learn more' } },
}

export const promoCardLearnAboutBorrow = {
  icon: selectBorrow,
  title: { key: 'product-hub.promo-cards.get-liquidity-from-your-assets' },
  description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
  link: { href: EXTERNAL_LINKS.KB.WHAT_IS_BORROW, label: { key: 'Learn more' } },
}

export const promoCardLearnAboutMultiply = {
  icon: selectMultiply,
  title: { key: 'product-hub.promo-cards.what-is-multiply' },
  description: {
    key: 'product-hub.promo-cards.increase-or-decrease-the-exposure-to-your-collateral-asset-in-one-transaction',
  },
  link: { href: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY, label: { key: 'Learn more' } },
}

export const promoCardsWhatAreAjnaRewards = {
  image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  title: { key: 'product-hub.promo-cards.what-are-ajna-rewards' },
  description: { key: 'product-hub.promo-cards.ajna-pools-accumulate-rewards' },
  link: { href: EXTERNAL_LINKS.DOCS.AJNA.TOKEN_REWARDS, label: { key: 'Learn more' } },
}

export const promoCardWhatIsEarnOnAjna = {
  image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  title: { key: 'product-hub.promo-cards.what-is-earn-on-ajna' },
  description: { key: 'product-hub.promo-cards.learn-how-can-you-earn-by-lending-your-assets' },
  link: { href: EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_EARN, label: { key: 'Learn more' } },
}
