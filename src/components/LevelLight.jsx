import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import { levelColor } from '../constants/levels.js'

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.15); opacity: 1; }
`

function LevelLight({ level, size = 52 }) {
  const color = levelColor(level)

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 14px 2px ${color}`,
        animation: `${pulse} 2s ease-in-out infinite`,
        flexShrink: 0,
      }}
    />
  )
}

export default LevelLight
