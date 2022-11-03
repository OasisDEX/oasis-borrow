import React, { useState } from 'react'
import { Box, Button, Card, Flex, Heading, Input, Text } from 'theme-ui'

// export interface NFTDomainFormProps {}

const steps = ['Verification', 'Transaction', 'Confirmation']

export function NFTDomainForm() {
  const [step, setStep] = useState<number>(1)
  const [domain, setDomain] = useState<string>('')

  return (
    <>
      <Card
        sx={{
          p: 0,
          border: 'lightMuted',
        }}
      >
        <Heading
          variant="boldParagraph2"
          sx={{
            mb: '24px',
            mx: '24px',
            py: '24px',
            borderBottom: 'lightMuted',
          }}
        >
          Mint your domain
        </Heading>
        <Box
          sx={{
            px: '24px',
          }}
        >
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            Enter your name to see if domain is available to grab.
          </Text>
          <Box sx={{ mt: 3, display: 'inline-block', position: 'relative', maxWidth: '60%' }}>
            <Input
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value)
              }}
              sx={{
                pr: '74px',
                borderColor: 'neutral20',
                transition: 'border-color 200ms',
                '&:hover': {
                  borderColor: 'neutral60',
                },
                '&:focus, &:focus:hover': {
                  borderColor: 'neutral80',
                },
              }}
            />
            <Text
              sx={{
                position: 'absolute',
                height: '20px',
                top: 0,
                right: 3,
                lineHeight: '55px',
                fontSize: 5,
              }}
            >
              .oasis
            </Text>
          </Box>
        </Box>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: '24px',
            p: '24px',
            borderTop: 'lightMuted',
          }}
        >
          <Text as="p" variant="paragraph3">
            Step {step} of 3: {steps[step]}
          </Text>
          <Box>
            <Button variant="action" sx={{ mr: 2 }}>
              Back
            </Button>
            <Button variant="tertiary">Continue</Button>
          </Box>
        </Flex>
      </Card>
      <Box sx={{ mt: 4 }}>
        <Text>Debug:</Text>
        <Text>Step: {step}</Text>
        <Text>Step: "{domain}"</Text>
      </Box>
    </>
  )
}
