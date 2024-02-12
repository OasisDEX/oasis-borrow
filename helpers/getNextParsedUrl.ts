export function getNextParsedUrl(url: string) {
  if (url.startsWith('/')) {
    const { pathname, searchParams } = new URL(url, document.location.origin)

    return {
      href: pathname,
      query: Object.fromEntries(searchParams),
    }
  } else
    return {
      href: url,
    }
}
