import { useHash } from 'helpers/useHash'
import React, { useEffect, useMemo } from 'react'
import ReactSelect from 'react-select'
import { Box, Card, Flex, Grid } from 'theme-ui'

import { ChevronUpDown } from './ChevronUpDown'
import { Tab, TabVariant } from './Tab'
import { VaultTabTag } from './vault/VaultTabTag'
import { SelectComponents } from 'react-select/src/components'
import { reactSelectCustomComponents } from './reactSelectCustomComponents'

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
  switchEvent?: { value: string }
}

export function TabBar({ sections, variant, useDropdownOnMobile, switchEvent }: TabBarProps) {
  const [hash, setHash] = useHash<string>()

  useEffect(() => setHash(sections[0]?.value), [])
  useEffect(() => switchEvent && setHash(switchEvent.value), [switchEvent])
  // const selectComponents = useMemo(() => selectCustomComponents(), [])

  function isSelected(section: TabSection) {
    return `#${section.value}` === hash
  }

  const selectedSection = sections.find(isSelected)

  if (sections.length <= 1) {
    return (
      <Grid gap={0} sx={{ width: '100%' }}>
        <Box sx={{ zIndex: 1 }}>{selectedSection?.content}</Box>
      </Grid>
    )
  }

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      {selectedSection?.topContent && <Box>{selectedSection?.topContent}</Box>}
      {useDropdownOnMobile ? (
        <Box sx={{ display: ['block', 'none'], mb: 3 }}>
          <ReactSelect<TabSection>
            options={sections}
            onChange={(option) => setHash((option as TabSection).value)}
            components={{
              ...reactSelectCustomComponents,
              SingleValue: ({ data }) => {
                return (
                  <Flex sx={{ alignItems: 'center' }}>
                    {data.label}
                    {data.tag && <VaultTabTag isEnabled={data.tag.active} />}
                  </Flex>
                )
              },
              Option: ({ innerProps, isSelected, data }) => {
                return (
                  <Box
                    {...innerProps}
                    sx={{
                      py: 2,
                      px: 3,
                      bg: isSelected ? 'selected' : undefined,
                      cursor: 'pointer',
                      '&:hover': {
                        bg: 'secondaryAlt',
                      },
                    }}
                  >
                    <Flex
                      sx={{ fontWeight: isSelected ? 'semiBold' : 'body', alignItems: 'center' }}
                    >
                      {data.label}
                      {data.tag && <VaultTabTag isEnabled={data.tag.active} />}
                    </Flex>
                  </Box>
                )
              },
            }}
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
        <Flex
          sx={{
            ...(variant === 'underline'
              ? {
                  borderBottom: '3px solid',
                  borderColor: 'rgba(37, 39, 61, 0.1)',
                  width: '100%',
                  mb: 4,
                }
              : {}),
            ...(variant !== 'underline'
              ? {
                  display: 'inline-flex',
                  borderRadius: '58px',
                  bg: 'backgroundAlt',
                }
              : {}),
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
              onClick={() => setHash(section.value)}
            />
          ))}
        </Flex>
      </Box>
      <Box sx={{ zIndex: 1 }}>{selectedSection?.content}</Box>
    </Grid>
  )
}
