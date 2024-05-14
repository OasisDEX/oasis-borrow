const NAVIGATION_ID = '5u6VVriDSkPjUGRWRZ5oD9'

const navigationListOfLinksQuery = `
  title
  displayTitle
  link {
    label
    url
  }
  tight
`

const navigationLinkQuery = `
  description
  featureFlag
  label
  link
  protocol {
    slug
  }
  star
  token
`
const navigationFeaturedProductQuery = `
  detailedFilters
  label
  network {
    slug
  }
  primaryToken
  product {
    slug
  }
  protocol {
    slug
  }
  secondaryToken
`

const navigationTopProductsQuery = `
  product {
    slug
  }
`

const navigationTopTokensQuery = `
  token
`

const NavigationSpecialModuleQuery = `
  moduleName
`

export const navigationQuery = `
{
  navigation(id: "${NAVIGATION_ID}") {
    listOfPanelsCollection(limit: 5) {
      items {
        label
        listsOfLinksCollection(limit: 3) {
          items {
            ${navigationListOfLinksQuery}
            linksListCollection(limit: 10) {
              items {
                __typename
                ... on NavigationLink {
                  ${navigationLinkQuery}
                  nestedLinks {
                    ${navigationListOfLinksQuery}
                    linksListCollection(limit: 10) {
                      items {
                        __typename
                        ... on NavigationLink {
                          ${navigationLinkQuery}
                        }
                        ... on FeaturedProduct {
                          ${navigationFeaturedProductQuery}
                        }
                        ... on NavigationTopProducts {
                          ${navigationTopProductsQuery}
                        }
                        ... on NavigationTopToken {
                          ${navigationTopTokensQuery}
                        }
                        ... on NavigationSpecialModule {
                          ${NavigationSpecialModuleQuery}
                        }
                      }
                    }
                  }
                }
                ... on FeaturedProduct {
                  ${navigationFeaturedProductQuery}
                }
                ... on NavigationTopProducts {
                  ${navigationTopProductsQuery}
                }
                ... on NavigationTopToken {
                  ${navigationTopTokensQuery}
                }
                ... on NavigationSpecialModule {
                  ${NavigationSpecialModuleQuery}
                }
              }
            }
          }
        }
      }
    }
  }
}
`
