import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import type { TranslateStringType } from 'helpers/translateStringType'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren, ReactNode } from 'react'
import React, { useState } from 'react'
import { question_o } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Flex, Grid, Text } from 'theme-ui'

import { Icon } from './Icon'
import { AppLink } from './Links'
import type { CollRatioColor } from './vault/VaultDetails'
import { VaultDetailsCardModal } from './vault/VaultDetails'
import { WithArrow } from './WithArrow'

export type ChangeVariantType = 'positive' | 'negative'

interface DetailsSectionContentCardTooltipProps {
  value: ReactNode
}

export interface DetailsSectionContentCardChangePillProps {
  isLoading?: boolean
  tooltip?: ReactNode
  value?: string | string[]
  variant?: ChangeVariantType
  withAfter?: boolean
}

interface DetailsSectionContentCardLinkProps {
  label: string
  url?: string
  action?: () => void
}

export interface ContentCardProps {
  asFooter?: boolean
  change?: DetailsSectionContentCardChangePillProps
  customBackground?: string
  customUnitStyle?: ThemeUIStyleObject
  customValueColor?: string
  extra?: ReactNode
  footnote?: string | string[]
  footnoteTooltip?: ReactNode
  link?: DetailsSectionContentCardLinkProps
  modal?: ReactNode
  modalAsTooltip?: boolean
  title: string
  unit?: TranslateStringType
  value?: ReactNode
  valueTooltip?: ReactNode
}

export function getChangeVariant(collRatioColor: CollRatioColor): ChangeVariantType {
  return collRatioColor === 'primary100' || collRatioColor === 'success100'
    ? 'positive'
    : 'negative'
}

function DetailsSectionContentCardTooltip({
  children,
  value,
}: PropsWithChildren<DetailsSectionContentCardTooltipProps>) {
  return (
    <StatefulTooltip
      inline
      tooltip={value}
      containerSx={{ display: 'inline', borderBottom: '1px dotted', borderColor: 'inherit' }}
      tooltipSx={{
        fontSize: 1,
        fontWeight: 'regular',
        fontFamily: 'body',
        lineHeight: 'body',
        whiteSpace: 'pre',
        border: 'none',
        borderRadius: 'medium',
        boxShadow: 'buttonMenu',
      }}
    >
      {children}
    </StatefulTooltip>
  )
}

export function DetailsSectionContentCardChangePill({
  isLoading,
  tooltip,
  value,
  variant = 'positive',
  withAfter,
}: DetailsSectionContentCardChangePillProps) {
  const { t } = useTranslation()

  const valueArray = Array.isArray(value) ? value : [value]

  return (
    <>
      {(value || isLoading) && (
        <>
          <Skeleton
            {...(!value && { width: '128px' })}
            height="28px"
            sx={{ mb: '-28px', borderRadius: 'mediumLarge' }}
          />
          <Text
            as="p"
            variant="paragraph4"
            sx={{
              position: 'relative',
              px: 3,
              py: 1,
              height: '28px',
              ...(variant === 'positive' && {
                color: 'success100',
                backgroundColor: 'success10',
              }),
              ...(variant === 'negative' && {
                color: 'critical100',
                backgroundColor: 'critical10',
              }),
              borderRadius: 'mediumLarge',
              opacity: isLoading ? 0 : 1,
            }}
          >
            {tooltip ? (
              <>
                {valueArray.length > 1 && `${valueArray[0]} `}
                <DetailsSectionContentCardTooltip value={tooltip}>
                  {valueArray.length > 1 ? valueArray[1] : valueArray[0]}
                </DetailsSectionContentCardTooltip>{' '}
                {valueArray.slice(2, valueArray.length).join(' ')}
              </>
            ) : (
              <>{valueArray.join(' ')}</>
            )}
            {withAfter && ` ${t('omni-kit.content-card.after')}`}
          </Text>
        </>
      )}
    </>
  )
}
function DetailsSectionContentCardLink({ label, url, action }: DetailsSectionContentCardLinkProps) {
  return (
    <>
      {url && (
        <AppLink href={url} sx={{ mt: 2 }}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'interactive100' }}>
            {label}
          </WithArrow>
        </AppLink>
      )}
      {action && (
        <Text as="span" sx={{ mt: 2, cursor: 'pointer' }} onClick={action}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'interactive100' }}>
            {label}
          </WithArrow>
        </Text>
      )}
    </>
  )
}
function DetailsSectionContentCardModal({
  close,
  children,
}: ModalProps<{ children: string | JSX.Element }>) {
  return <VaultDetailsCardModal close={close}>{children}</VaultDetailsCardModal>
}

export function DetailsSectionContentCardWrapper({ children }: { children: ReactNode }) {
  return (
    <Grid
      sx={{
        gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
      }}
    >
      {children}
    </Grid>
  )
}

export function DetailsSectionContentCard({
  asFooter,
  change,
  customBackground = '',
  customUnitStyle = {},
  customValueColor,
  extra,
  footnote,
  footnoteTooltip,
  link,
  modal,
  modalAsTooltip,
  title,
  unit,
  value,
  valueTooltip,
}: ContentCardProps) {
  const openModal = useModal()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const modalHandler = () => {
    if (modal && !modalAsTooltip)
      openModal(DetailsSectionContentCardModal, { children: <>{modal}</> })
  }
  const hightlightableItemEvents = {
    onMouseEnter: () => setIsHighlighted(true),
    onMouseLeave: () => setIsHighlighted(false),
    onClick: modalHandler,
  }
  let cardBackgroundColor = modal && !modalAsTooltip && isHighlighted ? 'neutral30' : 'neutral10'
  if (customBackground) {
    cardBackgroundColor = customBackground
  }
  const cursorStyle = { cursor: modal && !modalAsTooltip ? 'pointer' : 'auto' }
  const footnoteArray = Array.isArray(footnote) ? footnote : [footnote]

  return (
    <Flex
      as="li"
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        my: asFooter ? 1 : 0,
        p: '12px',
        borderRadius: 'medium',
        backgroundColor: cardBackgroundColor,
        transition: 'background-color 200ms',
        wordWrap: 'break-word',
      }}
    >
      <Text
        as="h3"
        variant="paragraph4"
        color="neutral80"
        sx={{
          ...cursorStyle,
          mb: asFooter ? 1 : 0,
        }}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && !modalAsTooltip && (
          <Icon
            color={isHighlighted ? 'primary100' : 'neutral80'}
            icon={question_o}
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        )}
        {modal && modalAsTooltip && (
          <StatefulTooltip
            tooltip={modal}
            containerSx={{ display: 'inline' }}
            inline
            tooltipSx={{ maxWidth: '350px' }}
          >
            <Icon
              color={isHighlighted ? 'primary100' : 'neutral80'}
              icon={question_o}
              size="auto"
              width="14px"
              height="14px"
              sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
            />
          </StatefulTooltip>
        )}
      </Text>
      <Text
        as="p"
        variant={asFooter ? 'boldParagraph2' : 'header3'}
        sx={{
          maxWidth: '100%',
          ...cursorStyle,
          ...(!asFooter && {
            lineHeight: 'loose',
          }),
          ...(customValueColor && {
            color: customValueColor,
          }),
        }}
        {...hightlightableItemEvents}
      >
        {valueTooltip ? (
          <DetailsSectionContentCardTooltip value={valueTooltip}>
            {value || '-'}
          </DetailsSectionContentCardTooltip>
        ) : (
          value || '-'
        )}
        {unit &&
          (asFooter ? (
            ` ${unit}`
          ) : (
            <Text as="small" sx={{ ml: 1, fontSize: 5, ...customUnitStyle }}>
              {unit}
            </Text>
          ))}
      </Text>
      {(change?.value || change?.isLoading) && (
        <Box sx={{ maxWidth: '100%', pt: 2, ...cursorStyle }} {...hightlightableItemEvents}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
      {extra && (
        <Box sx={{ ...cursorStyle }} {...hightlightableItemEvents}>
          {extra}
        </Box>
      )}
      {footnote && (
        <Text
          as="p"
          variant="paragraph4"
          sx={{ maxWidth: '100%', pt: 2, fontSize: '12px', ...cursorStyle }}
          {...hightlightableItemEvents}
        >
          {footnoteTooltip ? (
            <>
              {footnoteArray.length > 1 && `${footnoteArray[0]} `}
              <DetailsSectionContentCardTooltip value={footnoteTooltip}>
                {footnoteArray.length > 1 ? footnoteArray[1] : footnoteArray[0]}
              </DetailsSectionContentCardTooltip>{' '}
              {footnoteArray.slice(2, footnoteArray.length).join(' ')}
            </>
          ) : (
            <>{footnoteArray.join(' ')}</>
          )}
        </Text>
      )}
      {link?.label && (link?.url || link?.action) && <DetailsSectionContentCardLink {...link} />}
    </Flex>
  )
}
