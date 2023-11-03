import type { TFunction } from 'next-i18next'
import type { ParsedUrlQuery } from 'querystring'

export type WithTranslation = { t: TFunction }
export type WithQuery = { query?: ParsedUrlQuery }
export type WithReadonlyAccount = { readonlyAccount?: boolean }
