import { Button, Flex, Spinner, Text } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

export interface RetryableLoadingButtonProps {
  onClick: (finishLoader: (succed: boolean) => void) => void
  translationKey: string
  isRetry: boolean
  isLoading: boolean
  disabled: boolean
  isStopLossEnabled: boolean
  error?: boolean
  isEditing?: boolean
}

export function RetryableLoadingButton(props: RetryableLoadingButtonProps) {
  const { t } = useTranslation()
  const [isLoading, setLoading] = useState(false)
  const [isRetry, setRetry] = useState(false)

  function buttonClickHandler() {
    if (!isLoading) {
      setLoading(true)
      props.onClick((succeded: boolean) => {
        setLoading(false)
        setRetry(!succeded)
      })
    }
  }

  useEffect(() => {
    setLoading(props.isLoading)
    setRetry(props.isRetry)
  }, [])

  return (
    <Button
      sx={{ width: '100%', justifySelf: 'center' }}
      variant="primary"
      onClick={buttonClickHandler}
      disabled={props.disabled}
    >
      {isLoading ? (
        <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text sx={{ position: 'relative' }} pl={2}>
            <Spinner
              size={25}
              color="neutral10"
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translate(-105%, -50%)',
              }}
            />
            {t(isRetry || props.error ? 'retry' : props.translationKey)}
          </Text>
        </Flex>
      ) : (
        <Text>{t(isRetry || props.error ? 'retry' : props.translationKey)}</Text>
      )}
    </Button>
  )
}
