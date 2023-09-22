import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import type { TranslatableProps } from './Translatable.types'

export const Translatable: FC<TranslatableProps> = ({ text }) => {
  const { t } = useTranslation()

  return <>{typeof text === 'object' ? t(text.key, text.props) : text}</>
}
