import React from 'react'

export function interpolate(
  str: string,
  Components: Record<string, React.ComponentType>,
): React.ReactNode {
  const splitRegex = /(?<before>.+?)?<(?<comp>\d+)>(?<content>.+?)<\/\k<comp>>/g
  const matches = [...str.matchAll(splitRegex)]

  if (matches.length === 0) {
    return str
  }

  const latMatch = matches[matches.length - 1]
  const endString = latMatch.input?.replace(splitRegex, '')

  return (
    <>
      {matches.map((match, idx) => {
        const Comp =
          match.groups?.comp && Components[match.groups?.comp]
            ? Components[match.groups?.comp]
            : 'span'
        return (
          <React.Fragment key={idx}>
            {match.groups?.before}
            <Comp>{match.groups?.content}</Comp>
            {match.groups?.after}
          </React.Fragment>
        )
      })}
      {endString}
    </>
  )
}
