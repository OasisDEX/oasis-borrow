import { Button, Flex, Spinner, Text } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

export interface AddTriggerProps {
  onClick: (cancelLoader:()=>void) => void
  translationKey: string,
  isRetry:boolean,
  isLoading:boolean
}

export function AddTriggerLayout(props: AddTriggerProps) {
  const { t } = useTranslation()
  const  caption = t(props.isRetry?'retry':props.translationKey)
  const [isLoading,setLoading] = useState(false);

  function buttonClickHandler(){
    setLoading(true);
    props.onClick(()=>{
      setLoading(false);
    });
  }

  useEffect(()=>{
    setLoading(props.isLoading);
  },[])

  return (
    <Button sx={{ width: '100%', justifySelf: 'center' }} variant="primary" onClick={buttonClickHandler}>
      {isLoading ? (
          <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text sx={{ position: 'relative' }} pl={2}>
              <Spinner
                size={25}
                color="surface"
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translate(-105%, -50%)',
                }}
              />
              {caption}
            </Text>
          </Flex>
        ) : (
          <Text>{caption}</Text>
        )}
    </Button>
  )
}
