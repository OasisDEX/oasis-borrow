import React from 'react'
import { SurveyButtons } from 'features/survey/SurveyButtons'
import surveysConfig from 'features/survey/surveysConfig.json'

export function Survey({ for: page }: { for: keyof typeof surveysConfig }) {
  const config = surveysConfig[page]

  return config?.id ? <SurveyButtons {...config} /> : null
}
