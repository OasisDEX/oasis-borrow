import type { CookieName } from 'analytics/common'

export type SelectedCookies = Record<CookieName, boolean>

export type SavedSettings = { accepted: boolean; enabledCookies: SelectedCookies; version: string }
export interface CookieBannerProps {
  value: SavedSettings
  setValue: (data: SavedSettings) => void
}
