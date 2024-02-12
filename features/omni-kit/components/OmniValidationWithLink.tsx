import { AppLink } from 'components/Links'
import type { OmniValidationItem } from 'features/omni-kit/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans } from 'next-i18next'
import React, { type FC } from 'react'

interface OmniValidationWithLinkProps {
  name: string
  values?: { [key: string]: string }
}

interface MapSimulationValidationParams {
  items: {
    name: string
    data?: { [key: string]: string }
  }[]
  collateralToken: string
  quoteToken: string
  token: string
}

export const mapSimulationValidation = ({
  items,
  collateralToken,
  quoteToken,
  token,
}: MapSimulationValidationParams): OmniValidationItem[] =>
  items.map((item) => ({
    message: {
      component: (
        <OmniValidationWithLink
          name={item.name}
          values={{ ...item.data, collateralToken, quoteToken, token }}
        />
      ),
    },
  }))

export const OmniValidationWithLink: FC<OmniValidationWithLinkProps> = ({ name, values }) => {
  const translationKey = `ajna.validations.${name}`

  const linkMap: { [key: string]: string } = {
    'price-below-htp': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'price-between-htp-and-lup': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'price-above-lup': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE,
    'collateral-to-claim': EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_EARN,
    'is-being-liquidated': EXTERNAL_LINKS.DOCS.AJNA.LIQUIDATIONS,
  }

  if (values?.amount?.includes('<')) {
    values.amount = values.amount.replace(/</gi, '&lt;')
  }

  return (
    <Trans
      i18nKey={translationKey}
      values={values}
      shouldUnescape
      components={{
        1: <strong />,
        2: (
          <AppLink
            sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
            href={linkMap[name] || EXTERNAL_LINKS.DOCS.AJNA.HUB}
          />
        ),
      }}
    />
  )
}
