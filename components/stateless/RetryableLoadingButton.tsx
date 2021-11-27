import { Button, Flex, Spinner, Text } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

export interface RetryableLoadingButtonProps {
  onClick: (finishLoader:(succed : boolean)=>void) => void
  translationKey: string,
  isRetry:boolean,
  isLoading:boolean
}

export function RetryableLoadingButton(props: RetryableLoadingButtonProps) {
  const { t } = useTranslation()
  const [isLoading,setLoading] = useState(false);
  const [isRetry,setRetry] = useState(false);

  function buttonClickHandler(){
    if(!isLoading){
      console.log("Handling click");
      setLoading(true);
      props.onClick((succeded : boolean)=>{
        setLoading(false);
        setRetry(!succeded);
      });
    }
  }

  useEffect(()=>{
    setLoading(props.isLoading);
    setRetry(props.isRetry);
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
              { t(isRetry?'retry':props.translationKey) }
            </Text>
          </Flex>
        ) : (
          <Text>{ t(isRetry?'retry':props.translationKey) }</Text>
        )}
    </Button>
  )
}
