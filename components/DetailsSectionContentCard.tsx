import { Icon } from '@makerdao/dai-ui-icons'
import { SystemStyleObject } from '@styled-system/css'
import { Skeleton } from 'components/Skeleton'
import { ModalProps, useModal } from 'helpers/modalHook'
import { TranslateStringType } from 'helpers/translateStringType'
import React, { ReactNode, useState } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

import { AppLink } from './Links'
import { CollRatioColor, VaultDetailsCardModal } from './vault/VaultDetails'
import { WithArrow } from './WithArrow'

export type ChangeVariantType = 'positive' | 'negative'

export interface DetailsSectionContentCardChangePillProps {
  isLoading?: boolean
  value?: string
  variant: ChangeVariantType
}

interface DetailsSectionContentCardLinkProps {
  label: string
  url?: string
  action?: () => void
}

export interface ContentCardProps {
  title: string
  value?: string
  unit?: TranslateStringType
  change?: DetailsSectionContentCardChangePillProps
  footnote?: TranslateStringType
  link?: DetailsSectionContentCardLinkProps
  modal?: TranslateStringType | JSX.Element
  customBackground?: string
  customUnitStyle?: SystemStyleObject
}

export function getChangeVariant(collRatioColor: CollRatioColor): ChangeVariantType {
  return collRatioColor === 'primary100' || collRatioColor === 'success100'
    ? 'positive'
    : 'negative'
}

export function DetailsSectionContentCardChangePill({
  isLoading,
  value,
  variant,
}: DetailsSectionContentCardChangePillProps) {
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
              transition: '200ms opacity',
            }}
          >
            {value}
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
  title,
  value,
  unit,
  change,
  footnote,
  link,
  modal,
  customBackground = '',
  customUnitStyle = {},
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
            name="question_o"
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
        sx={{ maxWidth: '100%', lineHeight: 'loose', ...cursorStyle }}
        {...hightlightableItemEvents}
      >
        {value || '-'}
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
      {footnote && (
        <Text
          as="p"
          variant="paragraph4"
          sx={{ maxWidth: '100%', pt: 2, fontSize: '12px', ...cursorStyle }}
          {...hightlightableItemEvents}
        >
          {footnote}
        </Text>
      )}
      {link?.label && (link?.url || link?.action) && <DetailsSectionContentCardLink {...link} />}
    </Flex>
  )
}
