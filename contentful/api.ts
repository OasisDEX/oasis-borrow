import getConfig from 'next/config'

export async function fetchGraphQL<T>(query: string, preview: boolean): Promise<T> {
  const accessToken =
    getConfig()?.publicRuntimeConfig?.contentfulAccessToken || process.env.CONTENTFUL_ACCESS_TOKEN
  const previewAccessToken =
    getConfig()?.publicRuntimeConfig?.contentfulPreviewAccessToken ||
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN

  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${preview ? previewAccessToken : accessToken}`,
      },
      body: JSON.stringify({ query }),
    },
  ).then((response) => response.json())
}
