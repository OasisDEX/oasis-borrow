import { EmptyState } from 'components/EmptyState'
import type { ReactNode } from 'react'
import React from 'react'

interface AssetsTableNoResultsProps {
  header: string
  content: ReactNode
}

export function AssetsTableNoResults({ header, content }: AssetsTableNoResultsProps) {
  return <EmptyState header={header}>{content}</EmptyState>
}
