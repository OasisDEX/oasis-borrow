import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const rewriteRules = () => [
  {
    source: '/api/triggers/:path*',
    destination: `${process.env.FUNCTIONS_API_URL}/api/triggers/:path*`,
  },
  {
    source: '/api/triggers',
    destination: `${process.env.FUNCTIONS_API_URL}/api/triggers`,
  },
  {
    source: '/api/apy/:path*',
    destination: `${process.env.FUNCTIONS_API_URL}/api/apy/:path*`,
  },
  {
    source: '/api/migrations',
    destination: `${process.env.FUNCTIONS_API_URL}/api/migrations`,
  },
  {
    source: '/api/morpho/:path*',
    destination: `${process.env.FUNCTIONS_API_URL}/api/morpho/:path*`,
  },
  {
    source: '/api/apy/:path*',
    destination: `${process.env.FUNCTIONS_API_URL}/api/apy/:path*`,
  },
  // ... other rules
]

function parsePattern(pattern: string) {
  const paramRegex = /:(\w+)(\*)?/g
  const names: string[] = []
  let match
  let regexPattern = pattern

  while ((match = paramRegex.exec(pattern)) !== null) {
    const [fullMatch, paramName, wildcard] = match
    names.push(paramName)
    if (wildcard === '*') {
      // Match any characters including slashes
      regexPattern = regexPattern.replace(fullMatch, '(.*)')
    } else {
      // Match any non-slash characters
      regexPattern = regexPattern.replace(fullMatch, '([^/]+)')
    }
  }

  return { regex: new RegExp('^' + regexPattern + '$'), names }
}

function constructDestination(destination: string, params: Record<string, string>) {
  return destination.replace(/:(\w+)\*/g, (_, name) => params[name] || '')
}

export function handleRewrite(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return null
  }
  const rules = rewriteRules()
  for (const rule of rules) {
    const { regex, names } = parsePattern(rule.source)
    const matches = regex.exec(request.nextUrl.pathname)

    if (matches) {
      const params = names.reduce(
        (acc, name, index) => {
          acc[name] = matches[index + 1]
          return acc
        },
        {} as Record<string, string>,
      )

      const destination = constructDestination(rule.destination, params)
      const url = request.nextUrl.clone()
      const destinationUrl = new URL(destination)
      url.protocol = destinationUrl.protocol
      url.host = destinationUrl.host
      url.port = destinationUrl.port
      url.pathname = destinationUrl.pathname
      // console.info(
      //   `rewriting ${request.nextUrl.pathname} to ${url.pathname}. With search: ${url.search}. And original search: ${request.nextUrl.search}`,
      // )
      return NextResponse.rewrite(url)
    }
  }
  return null // no rewrite
}
