import * as React from 'react'

interface GateProps {
  children: React.ReactElement<any>
  isOpen: boolean
  closed?: React.ReactElement<any>
}

export function Gate({ isOpen, closed, children }: GateProps) {
  if (!isOpen) {
    return closed || <p>ooops!</p>
  }
  return children
}
