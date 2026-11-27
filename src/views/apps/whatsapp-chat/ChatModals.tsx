// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

interface ServiceOrderDialogProps {
  open: boolean
  onClose: () => void
  serviceOrderInput: string
  whatsappMessageInput: string
  isSendingOrder: boolean
  onOrderChange: (val: string) => void
  onMessageChange: (val: string) => void
  onSubmit: () => void
}

export const ServiceOrderDialog = (props: ServiceOrderDialogProps) => {
  const {
    open,
    onClose,
    serviceOrderInput,
    whatsappMessageInput,
    isSendingOrder,
    onOrderChange,
    onMessageChange,
    onSubmit
  } = props

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Notificar Orden de Servicio por WhatsApp</span>
        <IconButton size='small' onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
        <CustomTextField
          fullWidth
          required
          autoFocus
          label='N° Orden de Servicio (Tango ERP / Interno)'
          placeholder='Ej: OS-50824'
          value={serviceOrderInput}
          onChange={e => onOrderChange(e.target.value)}
        />
        <CustomTextField
          fullWidth
          multiline
          rows={4}
          label='Mensaje Oficial a Enviar por WhatsApp'
          value={whatsappMessageInput}
          onChange={e => onMessageChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={onClose} color='secondary' variant='tonal'>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant='contained'
          color='success'
          disabled={!serviceOrderInput.trim() || isSendingOrder}
          startIcon={<Icon icon='tabler:brand-whatsapp' />}
        >
          {isSendingOrder ? 'Enviando...' : 'Enviar a WhatsApp'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
