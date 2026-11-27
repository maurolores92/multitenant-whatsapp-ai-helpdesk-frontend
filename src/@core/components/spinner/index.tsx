// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// ** Logo Import
import AppLogo from 'src/layouts/components/AppLogo'

const FallbackSpinner = ({ sx }: { sx?: BoxProps['sx'] }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      <AppLogo size={64} />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  )
}

export default FallbackSpinner
