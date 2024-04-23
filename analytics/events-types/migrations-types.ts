import type { MixpanelCommonAnalyticsSections, MixpanelPages } from 'analytics/types'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

export enum MixpanelMigrationsEventIds {
  PromptDisplayed = 'PromptDisplayed',
  PromptClosed = 'PromptClosed',
  Migrate = 'Migrate',
  Retry = 'Retry',
  Back = 'Back',
  GoToPosition = 'GoToPosition',
}

export type MixpanelMigrationsButtonClickParams =
  | {
      id: MixpanelMigrationsEventIds.Migrate
      page: MixpanelPages.Migrations
      section: MixpanelCommonAnalyticsSections.Form
      params: {
        positionId: string
        alreadyHadDpm: boolean
        protocol: LendingProtocol
        positionType: OmniProductType.Borrow | OmniProductType.Earn
        tokenOrPair: string
        stopLoss?: {
          level: string
          closeTo: string
        }
      }
    }
  | {
      id: MixpanelMigrationsEventIds.Retry
      page: MixpanelPages.Migrations
      section: MixpanelCommonAnalyticsSections.Form
    }
  | {
      id: MixpanelMigrationsEventIds.Back
      page: MixpanelPages.Migrations
      section: MixpanelCommonAnalyticsSections.Form
    }
  | {
      id: MixpanelMigrationsEventIds.GoToPosition
      page: MixpanelPages.Migrations
      section: MixpanelCommonAnalyticsSections.Form
    }
  | {
      id: MixpanelMigrationsEventIds.PromptDisplayed
      page: MixpanelPages.Portfolio | MixpanelPages.ProductHub
      section: MixpanelCommonAnalyticsSections.Banner
    }
  | {
      id: MixpanelMigrationsEventIds.PromptClosed
      page: MixpanelPages.Portfolio | MixpanelPages.ProductHub
      section: MixpanelCommonAnalyticsSections.Banner
    }
