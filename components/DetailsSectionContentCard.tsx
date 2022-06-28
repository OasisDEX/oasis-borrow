import { Icon } from '@makerdao/dai-ui-icons'
import { ModalProps, useModal } from 'helpers/modalHook'
import React, { ReactNode, useState } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { AppLink } from './Links'
import { CollRatioColor, VaultDetailsCardModal } from './vault/VaultDetails'
import { WithArrow } from './WithArrow'

export type ChangeVariantType = 'positive' | 'negative'

export interface DetailsSectionContentCardChangePillProps {
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
  unit?: string
  change?: DetailsSectionContentCardChangePillProps
  footnote?: string
  link?: DetailsSectionContentCardLinkProps
  modal?: string | JSX.Element
}

interface ContentTableProps {
  headers: [string, string, string]
  rows: [string, string, string][]
  footnote?: string | JSX.Element
}

export function getChangeVariant(collRatioColor: CollRatioColor): ChangeVariantType {
  return collRatioColor === 'primary' || collRatioColor === 'onSuccess' ? 'positive' : 'negative'
}

export function DetailsSectionContentCardChangePill({
  value,
  variant,
}: DetailsSectionContentCardChangePillProps) {
  return (
    <Text
      as="p"
      variant="label"
      sx={{
        px: 3,
        py: 1,
        ...(variant === 'positive' && {
          color: 'onSuccess',
          backgroundColor: 'dimSuccess',
        }),
        ...(variant === 'negative' && {
          color: 'onError',
          backgroundColor: 'dimError',
        }),
        borderRadius: 'mediumLarge',
      }}
    >
      {value}
    </Text>
  )
}

function DetailsSectionContentCardLink({ label, url, action }: DetailsSectionContentCardLinkProps) {
  return (
    <>
      {url && (
        <AppLink href={url} sx={{ mt: 2 }}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'link' }}>
            {label}
          </WithArrow>
        </AppLink>
      )}
      {action && (
        <Text as="span" sx={{ mt: 2, cursor: 'pointer' }} onClick={action}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'link' }}>
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

export function DetailsSectionContentTable({ headers, rows, footnote }: ContentTableProps) {
  return (
    <Grid
      sx={{
        gridTemplateColumns: [3, '2fr 1fr 1fr'],
      }}
    >
      {headers.map((header, index) => (
        <Text
          key={`${header}-${index}`}
          as="p"
          color="text.subtitle"
          sx={{ fontWeight: 'semiBold', textAlign: index === 0 ? 'left' : 'right' }}
          variant="paragraph4"
        >
          {header}
        </Text>
      ))}
      {rows.map((row) =>
        row.map((rowItem, index) => (
          <Text
            key={`${rowItem}-${index}`}
            as="p"
            variant="paragraph3"
            sx={{ fontWeight: 'semiBold', textAlign: index === 0 ? 'left' : 'right' }}
          >
            {rowItem}
          </Text>
        )),
      )}
      {footnote && (
        <Box sx={{ gridColumn: '1/-1' }}>
          <Text variant="paragraph4" color="text.subtitle" sx={{ fontWeight: 'semiBold' }}>
            {footnote}
          </Text>
        </Box>
      )}
      {/* <Box bg="primary">Box</Box>
      <Box bg="muted">Box</Box>
      <Box bg="primary">Box</Box>
      <Box bg="muted">Box</Box> */}
    </Grid>
  )
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

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: '12px',
        borderRadius: 'medium',
        backgroundColor: modal && isHighlighted ? 'secondaryAlt' : 'surface',
        transition: 'background-color 200ms',
        wordWrap: 'break-word',
      }}
    >
      <Heading
        as="h3"
        variant="label"
        sx={{ cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && (
          <Icon
            color={isHighlighted ? 'primary' : 'text.subtitle'}
            name="question_o"
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        )}
      </Heading>
      <Text
        as="p"
        variant="header2"
        sx={{ maxWidth: '100%', lineHeight: 'loose', cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {value || '-'}
        {unit && (
          <Text as="small" sx={{ ml: 1, fontSize: 5 }}>
            {unit}
          </Text>
        )}
      </Text>
      {change && (
        <Box
          sx={{ maxWidth: '100%', pt: 2, cursor: modal ? 'pointer' : 'auto' }}
          {...hightlightableItemEvents}
        >
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
      {footnote && (
        <Text
          as="p"
          variant="label"
          sx={{ maxWidth: '100%', pt: 2, cursor: modal ? 'pointer' : 'auto' }}
          {...hightlightableItemEvents}
        >
          {footnote}
        </Text>
      )}
      {link?.label && (link?.url || link?.action) && <DetailsSectionContentCardLink {...link} />}
    </Flex>
  )
}
