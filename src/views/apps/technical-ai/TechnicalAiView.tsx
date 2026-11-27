// ** MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Custom Components & Hooks
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { useAuth } from 'src/hooks/useAuth'
import TenantAiTrainingTab from 'src/views/apps/companies/TenantAiTrainingTab'

const TechnicalAiView = () => {
  const { user } = useAuth()
  const tenantId = user?.tenantId || user?.tenant?.id
  const tenantName = user?.tenant?.name || 'HelpCopies SRL'

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 44, height: 44 }}>
                <Icon icon='tabler:robot' fontSize='1.5rem' />
              </CustomAvatar>
            }
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  Agente IA — Servicio Técnico
                </Typography>
                <CustomChip rounded skin='light' size='small' color='warning' label='Área Técnica' />
              </Box>
            }
            subheader={`Configuración, reglas, base de conocimiento y simulador del agente de WhatsApp técnico (${tenantName})`}
          />
          <CardContent>
            {tenantId ? (
              <TenantAiTrainingTab tenant={{ id: tenantId, name: tenantName }} agentArea='TECHNICAL_SERVICE' />
            ) : (
              <Alert severity='warning'>
                No se encontró una empresa activa asociada a tu sesión para cargar el agente de IA.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TechnicalAiView
