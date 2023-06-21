import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

export type TranslatableType =
  | string
  | {
      key: string
      props?: { [key: string]: string }
    }

export interface TranslatableProps {
  text: TranslatableType
}

export const Translatable: FC<TranslatableProps> = ({ text }) => {
  const { t } = useTranslation()

  return <>{typeof text === 'object' ? t(text.key, text.props) : text}</>
}
