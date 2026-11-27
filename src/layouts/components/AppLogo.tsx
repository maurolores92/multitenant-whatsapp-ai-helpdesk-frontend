// ** MUI Imports
import { useTheme } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

interface AppLogoProps {
  size?: number
  sx?: BoxProps['sx']
}

const AppLogo = ({ size = 36, sx }: AppLogoProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size >= 44 ? 2 : 1.5,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.common.white,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...sx
      }}
    >
      <svg
        width={Math.round(size * 0.64)}
        height={Math.round(size * 0.64)}
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.75'
        >
          <path d='M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3l-1-1v-3l1-1V9a2 2 0 0 1 2-2zm3 9h4' />
          <circle cx='8.5' cy='11.5' r='.75' fill='currentColor' />
          <circle cx='15.5' cy='11.5' r='.75' fill='currentColor' />
          <path d='M9 7L8 3m7 4l1-4' />
        </g>
      </svg>
    </Box>
  )
}

export default AppLogo
