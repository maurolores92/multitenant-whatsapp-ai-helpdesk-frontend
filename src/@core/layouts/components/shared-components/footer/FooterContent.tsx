// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

const StyledCompanyName = styled(Link)(({ theme }) => ({
  fontWeight: 500,
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const FooterContent = () => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', color: 'text.secondary' }}>
        {`© ${new Date().getFullYear()}, Todos los derechos reservados. Hecho por: `}
        <Typography
          sx={{ ml: 1 }}
          target='_blank'
          rel='noopener noreferrer'
          href='https://helpcopies.com.ar/'
          component={StyledCompanyName}
        >
          HELP COPIES SRL
        </Typography>
      </Typography>
    </Box>
  )
}

export default FooterContent
