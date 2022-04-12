import React from 'react'

import { SurveyButtons } from './SurveyButtons'
import surveysConfig from './surveysConfig.json'

export function Survey({ for: page }: { for: keyof typeof surveysConfig }) {
  const config = surveysConfig[page]

  return config.id ? <SurveyButtons {...config} /> : null
}
