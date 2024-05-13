const NAVIGATION_ID = '5u6VVriDSkPjUGRWRZ5oD9'

const navigationLinkQuery = `
  label
  description
  protocol {
    name
    slug
  }
  token
  link
  featureFlag
  star
`
const navigationFeaturedPosition = `
  network {
    name
    slug
  }
  protocol {
    name
    slug
  }
  product {
    name
    slug
  }
  primaryToken
  secondaryToken
  label
  detailedFilters
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
                          ${navigationFeaturedPosition}
                        }
                      }
                    }
                  }
                }
                ... on FeaturedProduct {
                  ${navigationFeaturedPosition}
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
