import type {
  LendingPageBannerRawResponse,
  LendingPageBenefitBoxRawResponse,
  LendingPageInfoBoxRawResponse,
  LendingPageProductBoxRawResponse,
  ProductFinderRawResponse,
} from 'contentful/queries/getEntryCollection'

type Base = {
  title: string
  subtitle: string
  description: {
    json: string
  }
}

type LandingPageBenefit = Base & {
  type: 'LandingPageBenefitBox'
  collection: LendingPageBenefitBoxRawResponse[]
}

type LendingPageInfo = Base & {
  type: 'LandingPageInfoBox'
  collection: LendingPageInfoBoxRawResponse[]
}

type LandingPageProduct = Base & {
  type: 'LandingPageProductBox'
  collection: LendingPageProductBoxRawResponse[]
}

type ProductFinder = Base & {
  type: 'ProductFinder'
  collection: ProductFinderRawResponse[]
}

type LandingPageBanner = Base & {
  type: 'LandingPageBanner'
  collection: LendingPageBannerRawResponse[]
}

type BlocksCollection =
  | LandingPageBenefit
  | LendingPageInfo
  | LandingPageProduct
  | ProductFinder
  | LandingPageBanner

export const mapContentCollection = (blocksCollection: BlocksCollection[]) => {
  return blocksCollection
    .flatMap((blockItem) => {
      switch (blockItem.type) {
        case 'LandingPageBenefitBox': {
          return {
            type: 'benefit-box',
            title: blockItem.title,
            subtitle: blockItem.title,
            content: blockItem.collection.map((item) => ({
              title: item.title,
              // description: item.description,
              description: 'zelipapo',
              icon: item.icon.url,
            })),
          }
        }
        case 'LandingPageInfoBox': {
          return {
            type: 'info-box',
            title: blockItem.title,
            // description: blockItem.description, // TODO
            description: 'zelipapo',
            content: blockItem.collection.map((item) => ({
              title: item.title,
              // description: item.description,
              description: 'zelipapo', // TODO
              image: item.image.url,
              tokens: item.tokens,
            })),
          }
        }
        case 'LandingPageProductBox': {
          return {
            type: 'product-box',
            title: blockItem.title,
            content: blockItem.collection.map((item) => ({
              title: item.title,
              link: item.link,
              // description: item.description.json,
              description: 'zelipapo', // TODO
              composition: item.composition,
              actionsList: item.actionsListCollection.items.map((actionItem) => ({
                icon: actionItem.icon.url,
                label: actionItem.label,
                ...(actionItem.description ? { description: actionItem.description } : {}),
              })),
              ...(item.image ? { image: item.image.url } : {}),
            })),
          }
        }
        case 'LandingPageBanner': {
          return {
            type: 'banner',
            content: blockItem.collection.map((item) => ({
              title: item.title,
              cta: item.cta,
            })),
          }
        }
        case 'ProductFinder': {
          return {
            type: 'product-finder',
            content: blockItem.collection.map((item) => ({
              product: item.product.slug,
              initialProtocol: item.initialProtocolCollection.items.map(
                (protocolItem) => protocolItem.slug,
              ),
              promoCards: item.promoCardsCollection.items.map((promoCard) => ({
                network: promoCard.network.slug,
                primaryToken: promoCard.primaryToken,
                secondaryToken: promoCard.secondaryToken,
                product: promoCard.product.slug,
                protocol: promoCard.protocol.slug,
              })),
            })),
          }
        }
        default:
          return null
      }
    })
    .filter((item) => item)
}
