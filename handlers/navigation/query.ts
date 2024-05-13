const NAVIGATION_ID = '5u6VVriDSkPjUGRWRZ5oD9'

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

export const navigationQuery = `
{
  navigation(id: "${NAVIGATION_ID}") {
    listOfPanelsCollection(limit: 5) {
      items {
        label
        listsOfLinksCollection(limit: 5) {
          items {
            title
            displayTitle
            linksListCollection(limit: 10) {
              items {
                __typename
                ... on NavigationLink {
                  ${navigationLinkQuery}
                  nestedLinks {
                    title
                    displayTitle
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
              }
            }
            link {
              label
              url
            }
          }
        }
      }
    }
  }
}
`
