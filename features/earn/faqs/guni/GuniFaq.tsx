import React from 'react'
import { LangResolver } from 'helpers/LangResolver'
import en from './en.mdx'
import { Card } from 'theme-ui'

export function GuniFaq() {
  return <Card>
      <LangResolver content={{ en }} />
    </Card>
}