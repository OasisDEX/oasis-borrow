import React from 'react'
import { LangResolver } from 'helpers/LangResolver'
import en from './en.mdx'

export function GuniFaq() {
  return <LangResolver content={{ en }} />
}