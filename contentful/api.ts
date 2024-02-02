import getConfig from 'next/config'

export async function fetchGraphQL<T>(query: (preview: boolean) => string): Promise<T> {
  const accessToken =
    getConfig()?.publicRuntimeConfig?.contentfulAccessToken || process.env.CONTENTFUL_ACCESS_TOKEN
  const previewAccessToken =
    getConfig()?.publicRuntimeConfig?.contentfulPreviewAccessToken ||
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
  const preview = process.env.NODE_ENV !== 'production'

  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${preview ? previewAccessToken : accessToken}`,
      },
      body: JSON.stringify({ query: query(preview) }),
    },
  ).then((response) => response.json())
}
