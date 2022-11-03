import { InfoSection } from 'components/infoSection/InfoSection'
import { MessageCard } from 'components/MessageCard'
import { AppSpinner } from 'helpers/AppSpinner'
import { useToggle } from 'helpers/useToggle'
import React, { useState } from 'react'
import { Box, Button, Card, Flex, Heading, Input, Text } from 'theme-ui'

// export interface NFTDomainFormProps {}

const steps = ['Domain verification', 'Transaction', 'Order confirmation']

export function NFTDomainForm() {
  const [step, setStep] = useState<number>(1)
  const [domain, setDomain] = useState<string>('')
  const [isLoading, , setIsLoading] = useToggle(false)
  const [errors, setErrors] = useState<string[]>([])

  // TODO: for debugging
  const [isDomainTaken, toggleIsDomainTaken] = useToggle(false)
  const [shouldTransactionFail, toggleShouldTransactionFail] = useToggle(false)

  const isPrimaryDisabled = (step === 1 && domain === '') || isLoading || step === 3
  const isSecondaryHidden = step === 1 || step === 3

  function verifyDomain() {
    setIsLoading(true)

    // TODO: verify if domain is available and valid?
    setTimeout(() => {
      setIsLoading(false)
      if (isDomainTaken) setErrors(['Selected domain is taken, please try something different'])
      else {
        setErrors([])
        setStep(2)
      }
    }, 1000)
  }
  function buyDomain() {
    setIsLoading(true)

    // TODO: run transaction
    setTimeout(() => {
      setIsLoading(false)
      if (shouldTransactionFail)
        setErrors(['Unable to process transaction, please try again later'])
      else {
        setErrors([])
        setStep(3)
      }
    }, 1000)
  }
  function back() {
    setStep(step - 1)
  }

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
            position: 'relative',
            px: '24px',
          }}
        >
          {isLoading && (
            <AppSpinner
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                m: 'auto',
                zIndex: 2,
              }}
              variant="extraLarge"
            />
          )}
          <Box
            sx={{
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 200ms',
              maxWidth: ['100%', '100%', '60%'],
            }}
          >
            {step === 1 && (
              <>
                <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
                  Enter your name to see if domain is available to grab.
                </Text>
                <Box sx={{ mt: 3, position: 'relative' }}>
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
              </>
            )}
            {step === 2 && (
              <>
                <Text as="p" variant="paragraph3" sx={{ mb: 3, color: 'neutral80' }}>
                  Your selected domain{' '}
                  <Text as="strong" sx={{ color: 'primary100' }}>
                    {domain}.oasis
                  </Text>{' '}
                  is available!
                </Text>
                <InfoSection
                  title="Order information"
                  items={[
                    {
                      label: 'Domain price',
                      value: '0.001 ETH',
                    },
                  ]}
                />
              </>
            )}
            {step === 3 && (
              <>
                <Text as="p" variant="paragraph3" sx={{ mb: 3, color: 'neutral80' }}>
                  Congratulations!{' '}
                  <Text as="strong" sx={{ color: 'primary100' }}>
                    {domain}.oasis
                  </Text>{' '}
                  domain is now yours forever.
                </Text>
              </>
            )}
            {errors.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <MessageCard messages={errors} type="error" withBullet={errors.length > 1} />
              </Box>
            )}
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
            Step {step} of 3: {steps[step - 1]}
          </Text>
          <Box>
            {!isSecondaryHidden && (
              <Button variant="action" sx={{ mr: 2 }} onClick={back}>
                Back
              </Button>
            )}
            <Button
              variant="tertiary"
              disabled={isPrimaryDisabled}
              onClick={() => {
                if (step === 1) verifyDomain()
                if (step === 2) buyDomain()
              }}
            >
              Continue
            </Button>
          </Box>
        </Flex>
      </Card>
      <Box sx={{ mt: 4 }}>
        <Text>Debug:</Text>
        <Text>Step: {step}</Text>
        <Text>Domain: "{domain}"</Text>
        <Text>Is domain taken: {String(isDomainTaken)}</Text>
        <Text>Should transaction fail: {String(shouldTransactionFail)}</Text>
        <Button variant="tertiary" onClick={toggleIsDomainTaken}>
          Toggle is domain taken
        </Button>
        <Button variant="tertiary" onClick={toggleShouldTransactionFail}>
          Toggle should transaction fail
        </Button>
      </Box>
    </>
  )
}
