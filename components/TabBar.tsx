import { reactSelectCustomComponents } from 'components/reactSelectCustomComponents'
import { useHash } from 'helpers/useHash'
import React, { useEffect, useMemo } from 'react'
import ReactSelect from 'react-select'
import { Box, Flex, Grid } from 'theme-ui'

import { Tab, TabVariant } from './Tab'

export type TabSection = {
  value: string
  label: JSX.Element | string
  tag?: {
    include: boolean
    active: boolean
  }
  topContent?: JSX.Element | string
  content: JSX.Element
}

interface TabBarProps {
  sections: TabSection[]
  useDropdownOnMobile?: boolean
  variant: TabVariant
}

export function TabBar({ sections, variant, useDropdownOnMobile }: TabBarProps) {
  const [hash, setHash] = useHash<string>()

  useEffect(() => setHash(sections[0].value), [])
  const selectComponents = useMemo(() => reactSelectCustomComponents<any>(), [])

  function isSelected(section: TabSection) {
    return `#${section.value}` === hash
  }

  const selectedSection = sections.find(isSelected)
  const handleClick = (section: TabSection) => () => setHash(section.value)

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      {selectedSection?.topContent && <Box>{selectedSection?.topContent}</Box>}
      {useDropdownOnMobile ? (
        <Box sx={{ display: ['block', 'none'] }}>
          <ReactSelect<TabSection>
            options={sections}
            onChange={(option) => setHash((option as TabSection).value)}
            components={selectComponents}
            value={selectedSection}
            isOptionSelected={isSelected}
            isSearchable={false}
          />
        </Box>
      ) : null}
      <Box
        sx={{
          display: [useDropdownOnMobile ? 'none' : 'flex', 'flex'],
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {variant === 'underline' && (
          <UnderlineTabBarWrapper
            sections={sections}
            variant={variant}
            isSelected={isSelected}
            onClick={handleClick}
          />
        )}
        {variant !== 'underline' && (
          <TabBarWrapper
            sections={sections}
            variant={variant}
            isSelected={isSelected}
            onClick={handleClick}
          />
        )}
      </Box>
      <Box sx={{ zIndex: 1 }}>{selectedSection?.content}</Box>
    </Grid>
  )
}

interface TabsWrapperProps {
  sections: TabSection[]
  variant: TabVariant
  isSelected: (section: TabSection) => boolean
  onClick: (section: TabSection) => () => void
}

function UnderlineTabBarWrapper({ sections, variant, isSelected, onClick }: TabsWrapperProps) {
  return (
    <Flex
      sx={{
        borderBottom: '3px solid',
        borderColor: 'rgba(37, 39, 61, 0.1)',
        width: '100%',
        mb: 4,
      }}
    >
      {sections.map((section) => (
        <Tab
          key={section.value}
          value={section.value}
          label={section.label}
          selected={isSelected(section)}
          tag={section.tag}
          variant={variant}
          onClick={onClick(section)}
        />
      ))}
    </Flex>
  )
}

function TabBarWrapper({ sections, variant, isSelected, onClick }: TabsWrapperProps) {
  return (
    <Flex
      sx={{
        display: 'inline-flex',
        borderRadius: '58px',
        bg: 'backgroundAlt',
      }}
    >
      {sections.map((section) => (
        <Tab
          key={section.value}
          value={section.value}
          label={section.label}
          selected={isSelected(section)}
          tag={section.tag}
          variant={variant}
          onClick={onClick(section)}
        />
      ))}
    </Flex>
  )
}
