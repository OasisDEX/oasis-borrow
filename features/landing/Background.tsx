import React from "react"
import { Box } from "theme-ui";

import { keyframes } from '@emotion/react'
const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })

const pulse = keyframes({
    '0%': {
        opacity: 0.03,
        transform: 'scaleY(0.5)',
    },
    '50%': {
        opacity: 0.08,
        transform: 'scaleY(1)',
    },
    '100%': {
        opacity: 0.03,
        transform: 'scaleY(0.5)',
    }
})

const topLayer = keyframes({
    '0%': {
        transform: 'rotate(0deg) translate(-40px) rotate(0deg) scale(1, 1)',
        opacity: 0.5
    },
    '50%': {
        transform: 'rotate(-180deg) translate(-40px) rotate(-180deg) scale(1, 1.3)',
        opacity: 0.8,
    },
    '100%': {
        transform: 'rotate(-360deg) translate(-40px) rotate(-360deg) scale(1, 1)',
        opacity: 0.5,
    }
})

const bottomLayer = keyframes({
    '0%': {
        transform: 'rotate(0deg) translate(-40px) rotate(0deg) scale(1, 1)',
        opacity: 0.8
    },
    '50%': {
        transform: 'rotate(-180deg) translate(-40px) rotate(-180deg) scale(0.8, 1.3)',
        opacity: 0.5,
    },
    '100%': {
        transform: 'rotate(-360deg) translate(-40px) rotate(-360deg) scale(1, 1)',
        opacity: 0.8,
    }
})

export function Background() {
    return (
        <Box sx={{ pointerEvents: 'none' }}>
            <Box className="overlay">
                <Box sx={{
                    background: 'url(/static/img/background/layer-top.svg) no-repeat center',
                    position: 'absolute',
                    width: '1699px',
                    height: '734px',
                    left: '-217.56px',
                    top: '-149.78px',
                    opacity: 0.03,
                    mixBlendMode: 'overlay',
                    animation: `${pulse} 7s ease-in-out infinite`,
                    animationDelay: '0.5s',
                    zIndex: 1,
                }}
                />
                <Box sx={{
                    background: "url(/static/img/background/layer-middle.svg) no-repeat center",
                    position: "absolute",
                    width: "1587px",
                    height: "652px",
                    left: "-164px",
                    top: "-30px",
                    opacity: 0.03,
                    mixBlendMode: "overlay",
                    animation: `${pulse} 7s ease-in-out infinite`,
                    animationDelay: "2s",
                    zIndex: 1
                }}></Box>
                <Box sx={{
                    background: "url(/static/img/background/layer-bottom.svg) no-repeat center",
                    position: "absolute",
                    width: "1746px",
                    height: "830.74px",
                    left: "-82px",
                    top: "-19.22px",
                    opacity: 0.03,
                    mixBlendMode: "overlay",
                    animation: `${pulse} 7s ease-in-out infinite`,
                    animationDelay: "3s",
                    zIndex: 1
                }} />
            </Box>
            <Box sx={{
                background: `radial-gradient(
                    50% 50% at 50% 50%,
                    #fff8e0 50%,
                    rgba(211, 239, 255, 0) 100%,
                    rgba(211, 239, 255, 0) 100%
                  )`,
                position: 'absolute',
                width: '758px',
                height: '758px',
                left: '382px',
                top: '75px',
                zIndex: -1,
            }} />
            <Box sx={{
                position: "absolute",
                background: "radial-gradient(50% 50% at 50% 50%,rgba(254, 255, 199, 1) 46.35%,rgba(254, 255, 199, 0) 100%)",
                borderRadius: "100%",
                width: "640px",
                height: "640px",
                left: "1090px",
                top: "91px",
                zIndex: -1,
                opacity: 0.5,
                animation: `${topLayer} 15s linear infinite`,
                animationDelay: "2s"
            }} />
            <Box sx={{
                position: "absolute",
                background:
                    "radial-gradient(\n    50% 50% at 50% 50%,\n    rgba(191, 255, 240, 1) 0%,\n    rgba(191, 255, 240, 0) 100%\n  )",
                borderRadius: "100%",
                width: "640px",
                height: "640px",
                left: "790px",
                top: "91px",
                zIndex: -1,
                opacity: 0.8,
                animation: `${bottomLayer} 15s linear infinite`,
                animationDelay: "2s"
            }}></Box>
            <Box sx={{
                background:
                    "radial-gradient(50% 50% at 50% 50%,rgba(234, 226, 255, 1) 0%,rgba(218, 203, 255, 0) 100%)",
                borderRadius: "100%",
                position: "absolute",
                width: "758px",
                height: "758px",
                left: "-64px",
                top: "89px",
                zIndex: -1,
                animation: `${topLayer} 15s linear infinite`,
                animationDelay: "1s",
                opacity: 0.5
            }}></Box>
            <Box sx={{
                background:
                    "radial-gradient(50% 50% at 50% 50%,rgba(255, 200, 206, 1) 46.35%,rgba(255, 200, 206, 0) 100%)",
                position: "absolute",
                width: "758px",
                height: "758px",
                left: "-64px",
                top: "89px",
                zIndex: -1,
                animation: `${bottomLayer} 15s linear infinite`,
                animationDelay: "1s",
                opacity: 0.8
            }}></Box>
            <Box sx={{
                background:
                    "radial-gradient(50% 50% at 50% 50%,rgba(255, 200, 206, 1) 46.35%,rgba(255, 200, 206, 0) 100%)",
                position: "absolute",
                width: "758px",
                height: "758px",
                left: "428px",
                top: "-81px",
                zIndex: -1,
                animation: `${topLayer} 15s linear 5s infinite`,
                opacity: 0.5
            }}></Box>
            <Box sx={{
                background:
                    "radial-gradient(50% 50% at 50% 50%,rgba(234, 226, 255, 1) 0%,rgba(234, 226, 255, 0) 100%)",
                position: "absolute",
                width: "758px",
                height: "758px",
                left: "428px",
                top: "-81px",
                zIndex: -1,
                animation: `${bottomLayer} 15s linear 5s infinite`,
                opacity: 0.8
            }} className="circle-middle-bottom"></Box>
        </Box >
    )
}