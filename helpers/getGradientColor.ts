import type { ThemeUIStyleObject } from 'theme-ui'

export const ajnaBrandGradient = 'linear-gradient(90deg, #f154db 0%, #974eea 100%)'
export const summerBrandGradient = 'linear-gradient(90deg, #007da3 0%, #e7a77f 50%, #e97047 100%)'
export const summerFadedBrandGradient = 'linear-gradient(90deg, #b2d8e3 0%, #f8e4d8 50%, #f8d4c7 100%)'

export function getGradientColor(gradient: string): ThemeUIStyleObject {
  return {
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
}
