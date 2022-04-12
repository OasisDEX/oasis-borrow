import React from 'react'
import surveysConfig from './surveysConfig.json'
import { SurveyButtons } from './SurveyButtons'

export function Survey({ for: page }: { for: keyof typeof surveysConfig}) {
  const config = surveysConfig[page]

  return config.id ? <SurveyButtons {...config} /> : null
}
