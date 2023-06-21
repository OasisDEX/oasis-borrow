import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

export interface TranslatableProps {
  key: string
  props?: { [key: string]: string }
}

export const Translatable: FC<{ text: string | TranslatableProps }> = ({ text }) => {
  const { t } = useTranslation()

  return <>{typeof text === 'object' ? t(text.key, text.props) : text}</>
}
