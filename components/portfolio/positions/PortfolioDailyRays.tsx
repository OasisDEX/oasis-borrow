import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import dayjs from 'dayjs'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import { useObservable } from 'helpers/observableHook'
import React, { useState } from 'react'
import { rays } from 'theme/icons'
import { Box, Button, Flex, Text } from 'theme-ui'

// a quick, crude POC for the rays animation
const explodeRays = () => {
  const iconsCount = 30
  const raysContainer = document.getElementById('claim-rays')
  if (raysContainer) {
    for (let i = 0; i < iconsCount; i++) {
      // eslint-disable-next-line sonarjs/no-identical-expressions
      const translateX = Math.random() * 200 - Math.random() * 200
      // eslint-disable-next-line sonarjs/no-identical-expressions
      const translateY = Math.random() * 200 - Math.random() * 200
      const raysIcon = document.createElement('div')
      raysIcon.style.position = 'absolute'
      raysIcon.style.zIndex = `${1000 + iconsCount}`
      raysIcon.style.pointerEvents = 'none'
      raysIcon.style.width = `${Math.random() * 20 + 10}px`
      raysIcon.style.height = `${Math.random() * 20 + 10}px`
      raysIcon.style.backgroundImage =
        "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAABBdJREFUSEudlv1rW1UYx7/n9d4kA+2qzNEWO2ZXwl4Yzvk+eyOlFpnUgbXOl+0HQfQHZdjBulWX3EHH/Bf8RQuiCP40AqX4Q1MrVhCdULcWN6tuma107TbXJM3bPXJOcrP0JQq5EC45yX0+z3m+3+c8l2DjiwCgABQAb6O/qGtTjl4nLbsTNWKYZR1oo4tPH2x+OhxPfg8gtxGkcHlSEcpdtn1/rB6AvHKoNcsYd7d9deXcWkj2wkgMlEcp567YGakPMPvS9lHGmMMZd5s+v/QRgAKAYmriy9OE8ShhDISxhP3IC5G6dnC1r32UagDnoIyBMeamul/joWBokEsJShkI54lNzxyuD5A8HB5lnDuM6+AclHOotj0gXCDbsgNccL0DND7/tlVjB9ocxVoiy7kje04xRqOV4EJCcQHoe8P9IPdsBrhAMbM8rAr5P5QUHRA2mLRBpO0wS0Yaek9O1AT8/c5TH7PcylGmM+cSSojyR4MkIAQ8IQ1ECQkiLR24DLDcxr6Txhxk4YMXHXDueISCUNrhMYaCB8f6Zwn89pJ52M880H0EuaszyCV/XbUOaYFKG7QEqQTX9iYLA90OIXxMUQpQBn3PKwI7fQckk1oVqPHseeT/vISbX5yrrPuZ+4DGV04FAWT93qmUaPF4V0xRFi0SgpwCQtkMlP61vINA1xsIOi8bPVOT57H8wwgg7mZOLV17y2041D8EIO8Lv0qDxWPPxvIKUaGU6XFdGt6+D8HOVyG27VpnltRPXyPzy4Qpj0ovY2l+fmjH4Cenqzt/rch09s1Hz9wbsgeVfohLBLpeRzDSty54fm4W6alxFG/OgQob3q0byMxfg+Dc3XLi00p3rwWIxfecQSVE1C+NEVkIhDp6EXqyp1Qik/k3INqWlg1kV7B88UcIKUwDKsrcLYOfGUg1QJ+e1mJ/V1oH1ADP9722KJdo6O2HbGrDjeEPoWteEtaGuj6L1G8zELr5qsxCGIv4AB1cLr7fOaCEjBrPV7x/16ZW605YLe3IXPyuDNAiB6B+n0Z65mdYQiQ8QkAYH/cMiCb8c78qeFXHmuYqffezLbnFz77kIty5Pbyp5923yqfuKr00gC0c7zxAmBhTXCZMeUx3WuPFlZVWb/nWUX0Osfu2gj3QUmkonbnuAVMqYbuBx3rO1gIYSHmCrXPLdM+DWV1XDwSb9+4HYQKBfQdMYC1y2f8Je2/3c7UA/3WcY/pg8xihxAHRMgEZD0MPHYsVqAxEK6USVkLuitQLaBoDYOYvoNxw/K8z5R3z7IWREyWQleBtT9QLaI4BKgoQNxxPVo9H47z85ckBKqwoa31YzwU9v9eJ/H8lcgA1Fo5f3+hoNxA1N/U42br72/JYrQcAhOPJWq8nGqLheoLp15xV179XQl0rXqQ6IgAAAABJRU5ErkJggg==')"
      raysIcon.style.backgroundSize = 'contain'
      raysIcon.style.backgroundRepeat = 'no-repeat'
      raysIcon.style.backgroundPosition = 'center'
      raysIcon.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out'
      raysContainer.appendChild(raysIcon)
      setTimeout(() => {
        setTimeout(() => {
          raysIcon.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${Math.random() * 400}deg)`
        }, 1)
        setTimeout(() => {
          raysIcon.style.opacity = '0'
        }, Math.random() * 150)
        setTimeout(() => {
          raysIcon.remove()
        }, 1000)
      }, Math.random() * 150)
    }
  }
}

const getClaimingMessage = () => `Claiming 100 Rays for day: ${dayjs().format('YYYY-MM-DD')}`

export const PortfolioDailyRays = () => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const { wallet } = useWalletManagement()
  const [isExploding, setIsExploding] = useState(false)
  const [userError, setUserError] = useState(false)
  const flashButton = () =>
    new Promise((resolve) => {
      explodeRays()
      setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
        return resolve(null)
      }, 400)
    })
  const explodeRaysHandler = (_ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setUserError(false)
    void flashButton().then(() => {
      if (context?.web3.eth.personal && wallet?.address && context?.web3.eth.personal.sign) {
        void context?.web3.eth.personal
          .sign(getClaimingMessage(), wallet?.address, '')
          .then((signedMessage) => {
            console.log('signedMessage', signedMessage)
            setUserError(false)
            void flashButton()
          })
          .catch(() => setUserError(true))
      }
    })
  }
  return (
    <>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Flex sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="boldParagraph2">Rays Daily Challenge</Text>
        </Flex>
      </Flex>
      <Box sx={{ mt: 3, mb: 4 }}>
        <Text as="p" variant="paragraph3">
          Every day you can claim your Rays. Claim Rays for 7 days in a row and get a special 500
          Rays bonus.
        </Text>
        {userError && (
          <Text as="p" variant="paragraph3" color="warning100" sx={{ mt: 3 }}>
            Something went wrong. Please try again.
          </Text>
        )}
        <div
          id="claim-rays"
          style={{ position: 'relative', zIndex: 10, left: '50%', top: '40px' }}
        />
        <Box
          sx={{
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 100,
            margin: '0 auto',
            width: 'fit-content',
            borderRadius: 'round',
          }}
        >
          <Button
            variant="outline"
            sx={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 auto',
              mt: 4,
              transition: 'box-shadow 0.5s cubic-bezier(0,1.81,.41,1.37)',
              boxShadow: isExploding
                ? '-10px -6px 14px -8px #007da3,14px -8px 15px -8px #e7a77f,-11px 14px 15px -14px #e97047'
                : '0px',
              ...getGradientColor(summerBrandGradient),
            }}
            onClick={explodeRaysHandler}
          >
            <Icon icon={rays} color="primary60" sx={{ mr: 3 }} />
            Claim 100 Rays now
          </Button>
        </Box>
      </Box>
    </>
  )
}
