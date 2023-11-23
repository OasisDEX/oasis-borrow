import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import type { TranslateStringType } from 'helpers/translateStringType'
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
  tooltip?: string
  value?: string | [string, string, string]
  variant?: ChangeVariantType
}

interface DetailsSectionContentCardLinkProps {
  label: string
  url?: string
  action?: () => void
}

export interface ContentCardProps {
  change?: DetailsSectionContentCardChangePillProps
  changeTooltip?: ReactNode
  customBackground?: string
  customUnitStyle?: ThemeUIStyleObject
  customValueColor?: string
  extra?: ReactNode
  footnote?: string | [string, string, string]
  footnoteTooltip?: string
  link?: DetailsSectionContentCardLinkProps
  modal?: TranslateStringType | JSX.Element
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
}: DetailsSectionContentCardChangePillProps) {
  const isValueArray = Array.isArray(value)

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
                {isValueArray && `${value[0]} `}
                <DetailsSectionContentCardTooltip value={tooltip}>
                  {isValueArray ? value[1] : value}
                </DetailsSectionContentCardTooltip>
                {isValueArray && ` ${value[2]}`}
              </>
            ) : (
              <>{isValueArray ? value.join(' ') : value}</>
            )}
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
  change,
  customBackground = '',
  customUnitStyle = {},
  customValueColor,
  extra,
  footnote,
  footnoteTooltip,
  link,
  modal,
  title,
  unit,
  value,
  valueTooltip,
}: ContentCardProps) {
  const openModal = useModal()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const modalHandler = () => {
    if (modal) openModal(DetailsSectionContentCardModal, { children: modal })
  }
  const hightlightableItemEvents = {
    onMouseEnter: () => setIsHighlighted(true),
    onMouseLeave: () => setIsHighlighted(false),
    onClick: modalHandler,
  }
  let cardBackgroundColor = modal && isHighlighted ? 'neutral30' : 'neutral10'
  if (customBackground) {
    cardBackgroundColor = customBackground
  }
  const cursorStyle = { cursor: modal ? 'pointer' : 'auto' }
  const isFootnoteArray = Array.isArray(footnote)

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
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
        sx={cursorStyle}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && (
          <Icon
            color={isHighlighted ? 'primary100' : 'neutral80'}
            icon={question_o}
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        )}
      </Text>
      <Text
        as="p"
        variant="header3"
        sx={{
          maxWidth: '100%',
          lineHeight: 'loose',
          ...cursorStyle,
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
        {unit && (
          <Text as="small" sx={{ ml: 1, fontSize: 5, ...customUnitStyle }}>
            {unit}
          </Text>
        )}
      </Text>
      {(change?.value || change?.isLoading) && (
        <Box sx={{ maxWidth: '100%', pt: 2, ...cursorStyle }} {...hightlightableItemEvents}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
      {extra && (
        <Box sx={{ pt: '12px', ...cursorStyle }} {...hightlightableItemEvents}>
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
              {isFootnoteArray && `${footnote[0]} `}
              <DetailsSectionContentCardTooltip value={footnoteTooltip}>
                {isFootnoteArray ? footnote[1] : footnote}
              </DetailsSectionContentCardTooltip>
              {isFootnoteArray && ` ${footnote[2]}`}
            </>
          ) : (
            <>{isFootnoteArray ? footnote.join(' ') : footnote}</>
          )}
        </Text>
      )}
      {link?.label && (link?.url || link?.action) && <DetailsSectionContentCardLink {...link} />}
    </Flex>
  )
}
