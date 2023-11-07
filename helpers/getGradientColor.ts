import type { ThemeUIStyleObject } from 'theme-ui'

export const summerBrandGradient = 'linear-gradient(90deg, #007DA3 0%, #E7A77F 50%, #E97047 100%)'

export function getGradientColor(gradient: string): ThemeUIStyleObject {
  return {
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
}
