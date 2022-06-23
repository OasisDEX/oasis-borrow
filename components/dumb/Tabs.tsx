import { reactSelectCustomComponents } from 'components/reactSelectCustomComponents'
import { useHash } from 'helpers/useHash'
import React, { useEffect, useMemo } from 'react'
import ReactSelect from 'react-select'
import { Box, Button, Flex, Grid } from 'theme-ui'

type TabSection = {
  value: string
  label: JSX.Element | string
  content: JSX.Element
}

export function UnderlineTabs({
  sections,
  useDropdownOnMobile,
}: {
  sections: TabSection[]
  useDropdownOnMobile?: boolean
}) {
  const [hash, setHash] = useHash<string>()

  useEffect(() => setHash(sections[0].value), [])
  const selectComponents = useMemo(() => reactSelectCustomComponents<any>(), [])

  function isSelected(section: TabSection) {
    return `#${section.value}` === hash
  }

  const selectedSection = sections.find(isSelected)

  return (
    <Grid gap={0} sx={{ width: '100%', mt: 4 }}>
      {useDropdownOnMobile ? (
        <Box sx={{ display: ['block', 'none'], mb: 3 }}>
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
      <Box sx={{ display: [useDropdownOnMobile ? 'none' : 'block', 'block'], zIndex: 1 }}>
        <Flex
          sx={{
            borderBottom: '3px solid',
            borderColor: 'rgba(37, 39, 61, 0.1)',
            width: '100%',
            mb: 4,
          }}
        >
          {sections.map((section) => (
            <Button
              key={section.value}
              variant={isSelected(section) ? 'vaultTabActive' : 'vaultTab'}
              onClick={() => {
                setHash(section.value)
              }}
            >
              {section.label}
            </Button>
          ))}
        </Flex>
      </Box>
      <Box sx={{ zIndex: 1 }}>{selectedSection?.content}</Box>
    </Grid>
  )
}
