import React from 'react'

const BlurCircle = ({ top, right, left, bottom }) => {
    return (
        <div
            className="absolute rounded-full bg-primary/40 blur-[100px] -z-10"
            style={{
                top: top,
                right: right,
                left: left,
                bottom: bottom,
                width: '300px',
                height: '300px'
            }}
        />
    )
}

export default BlurCircle





