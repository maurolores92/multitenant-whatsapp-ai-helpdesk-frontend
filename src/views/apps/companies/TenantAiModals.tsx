// ** React Imports
import { FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { AiRuleCategory } from './types'

export const AI_RULE_CATEGORIES: Record<
  AiRuleCategory,
  {
    label: string
    color: 'info' | 'error' | 'success' | 'warning'
    icon: string
    description: string
    exampleTitle: string
    exampleInstruction: string
  }
> = {
  TONE: {
    label: 'Tono y Estilo',
    color: 'info',
    icon: 'tabler:message-heart',
    description:
      'Define la personalidad de la IA, el trato al cliente (vos/usted), cordialidad, uso de emojis y extensión recomendada para WhatsApp.',
    exampleTitle: 'Trato cordial y respuestas breves',
    exampleInstruction:
      'Saluda siempre con amabilidad usando el nombre del cliente si está disponible. Responde en máximo 3 o 4 líneas con lenguaje claro y sin tecnicismos complejos.'
  },
  RESTRICTION: {
    label: 'Restricción / Límite',
    color: 'error',
    icon: 'tabler:shield-exclamation',
    description:
      'Establece prohibiciones estrictas para evitar errores graves: no dar precios sin presupuesto, no prometer horarios de visita ni inventar datos.',
    exampleTitle: 'No cotizar repuestos ni mano de obra',
    exampleInstruction:
      'Nunca informes precios de repuestos, abonos ni visitas técnicas. Si el cliente pregunta costos, indica que un asesor comercial enviará el presupuesto.'
  },
  BUSINESS: {
    label: 'Regla de Negocio',
    color: 'success',
    icon: 'tabler:briefcase',
    description:
      'Indica procedimientos operativos de la empresa: qué datos pedir antes de escalar, horarios de atención, zonas de cobertura o políticas de garantía.',
    exampleTitle: 'Solicitar datos mínimos del equipo',
    exampleInstruction:
      'Antes de generar un reclamo técnico, solicita siempre: 1) Razón Social o cliente, 2) Modelo o N° de serie del equipo, 3) Código de error o síntoma exacto.'
  },
  ESCALATION: {
    label: 'Criterio de Derivación',
    color: 'warning',
    icon: 'tabler:urgent',
    description:
      'Define exactamente cuándo la IA debe dejar de responder sola y crear un Ticket o derivar a un técnico humano (urgencias, fallas físicas o reclamos críticos).',
    exampleTitle: 'Derivación inmediata por riesgo eléctrico',
    exampleInstruction:
      'Si el cliente menciona olor a quemado, humo, chispas, derrame de tóner/tinta o que el equipo no enciende tras revisar el enchufe, deriva de inmediato a Visita Presencial con prioridad ALTA.'
  }
}

interface RuleDialogProps {
  open: boolean
  tenantName: string
  ruleForm: {
    id?: string
    title: string
    instruction: string
    category: AiRuleCategory
    priority: number
  }
  isSaving: boolean
  onClose: () => void
  onChange: (form: any) => void
  onSubmit: (e: FormEvent) => void
}

export const AiRuleDialog = ({ open, tenantName, ruleForm, isSaving, onClose, onChange, onSubmit }: RuleDialogProps) => {
  const categoryMeta = AI_RULE_CATEGORIES[ruleForm.category] || AI_RULE_CATEGORIES.BUSINESS

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{ruleForm.id ? 'Editar Regla de Entrenamiento' : `Nueva Regla para ${tenantName}`}</span>
          <IconButton size='small' onClick={onClose}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 3 }}>
            <CustomTextField
              select
              fullWidth
              label='Categoría de Entrenamiento'
              value={ruleForm.category}
              onChange={e => onChange({ ...ruleForm, category: e.target.value })}
            >
              {(Object.keys(AI_RULE_CATEGORIES) as AiRuleCategory[]).map(cat => (
                <MenuItem key={cat} value={cat}>
                  {AI_RULE_CATEGORIES[cat].label}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              type='number'
              fullWidth
              label='Prioridad (1 = Máxima)'
              value={ruleForm.priority}
              onChange={e => onChange({ ...ruleForm, priority: Number(e.target.value) })}
              inputProps={{ min: 1, max: 100 }}
              helperText='Orden de lectura para la IA'
            />
          </Box>

          <Alert severity={categoryMeta.color === 'error' ? 'warning' : categoryMeta.color} icon={<Icon icon={categoryMeta.icon} />}>
            <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
              ¿Para qué sirve &quot;{categoryMeta.label}&quot;?
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              {categoryMeta.description}
            </Typography>
          </Alert>

          <CustomTextField
            fullWidth
            required
            label='Título Corto de la Regla'
            placeholder={`Ej: ${categoryMeta.exampleTitle}`}
            value={ruleForm.title}
            onChange={e => onChange({ ...ruleForm, title: e.target.value })}
          />

          <CustomTextField
            fullWidth
            required
            multiline
            rows={4}
            label='Instrucción Exacta para la IA'
            placeholder={`Ej: ${categoryMeta.exampleInstruction}`}
            value={ruleForm.instruction}
            onChange={e => onChange({ ...ruleForm, instruction: e.target.value })}
            helperText='Escríbela como una orden clara y directa hacia el asistente.'
          />
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={onClose} color='secondary' variant='tonal'>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} color='inherit' /> : 'Guardar Regla'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

interface KnowledgeDialogProps {
  open: boolean
  knowledgeForm: { id?: string; question: string; answer: string; tags: string }
  isSaving: boolean
  onClose: () => void
  onChange: (form: any) => void
  onSubmit: (e: FormEvent) => void
}

export const AiKnowledgeDialog = ({
  open,
  knowledgeForm,
  isSaving,
  onClose,
  onChange,
  onSubmit
}: KnowledgeDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
    <form onSubmit={onSubmit}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{knowledgeForm.id ? 'Editar Ítem de Conocimiento' : 'Nuevo Conocimiento / Pregunta Frecuente'}</span>
        <IconButton size='small' onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
        <Alert severity='info'>
          <Typography variant='caption'>
            <strong>¿Qué conviene cargar aquí?</strong> Datos reales del negocio (horarios, dirección, cobertura), procedimientos de primer auxilio técnico (ej: destrabe de papel, reinicio de equipo, códigos de error comunes) y preguntas frecuentes de los clientes.
          </Typography>
        </Alert>

        <CustomTextField
          fullWidth
          required
          label='Pregunta, Situación o Código de Error'
          placeholder='Ej: ¿Qué hacer si la impresora marca atasco de papel o código SC-542?'
          value={knowledgeForm.question}
          onChange={e => onChange({ ...knowledgeForm, question: e.target.value })}
        />
        <CustomTextField
          fullWidth
          required
          multiline
          rows={4}
          label='Respuesta Oficial / Guía Paso a Paso'
          placeholder='Ej: 1) Abrir la compuerta lateral derecha. 2) Retirar el papel suavemente sin tironear. 3) Si el código SC-542 persiste, solicitar número de serie del equipo y derivar a servicio técnico.'
          value={knowledgeForm.answer}
          onChange={e => onChange({ ...knowledgeForm, answer: e.target.value })}
        />
        <CustomTextField
          fullWidth
          label='Etiquetas / Palabras Clave (separadas por coma)'
          placeholder='atasco, error sc-542, ricoh, reinicio, mantenimiento'
          value={knowledgeForm.tags}
          onChange={e => onChange({ ...knowledgeForm, tags: e.target.value })}
          helperText='Ayuda a organizar los temas por equipo, marca o tipo de consulta.'
        />
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={onClose} color='secondary' variant='tonal'>
          Cancelar
        </Button>
        <Button type='submit' variant='contained' disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} color='inherit' /> : 'Guardar Conocimiento'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
)

interface ExampleDialogProps {
  open: boolean
  exampleForm: { topic: string; customerInput: string; idealResponse: string }
  isSaving: boolean
  onClose: () => void
  onChange: (form: any) => void
  onSubmit: (e: FormEvent) => void
}

export const AiExampleDialog = ({
  open,
  exampleForm,
  isSaving,
  onClose,
  onChange,
  onSubmit
}: ExampleDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
    <form onSubmit={onSubmit}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Nuevo Ejemplo de Conversación</span>
        <IconButton size='small' onClick={onClose}>
          <Icon icon='tabler:x' />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '8px !important' }}>
        <Alert severity='info'>
          <Typography variant='caption'>
            <strong>Entrenamiento por imitación:</strong> La IA aprende exactamente tu forma de redactar y tu criterio mirando ejemplos reales de &quot;qué dice el cliente&quot; y &quot;cómo respondemos nosotros&quot;.
          </Typography>
        </Alert>

        <CustomTextField
          fullWidth
          label='Tema / Categoría (Opcional)'
          placeholder='Ej: Solicitud de tóner, Error de impresión, Horarios'
          value={exampleForm.topic}
          onChange={e => onChange({ ...exampleForm, topic: e.target.value })}
        />
        <CustomTextField
          fullWidth
          required
          multiline
          rows={2}
          label='Mensaje de Ejemplo del Cliente'
          placeholder='Ej: Hola, me quedé sin tóner negro en la Ricoh MP 301, necesito uno urgente'
          value={exampleForm.customerInput}
          onChange={e => onChange({ ...exampleForm, customerInput: e.target.value })}
        />
        <CustomTextField
          fullWidth
          required
          multiline
          rows={4}
          label='Respuesta Ideal que Debe Dar la IA'
          placeholder='Ej: ¡Hola! Con gusto gestionamos tu pedido de tóner para la Ricoh MP 301. Por favor confírmame la Razón Social de tu empresa y la dirección de entrega para coordinar el envío.'
          value={exampleForm.idealResponse}
          onChange={e => onChange({ ...exampleForm, idealResponse: e.target.value })}
        />
      </DialogContent>
      <DialogActions sx={{ p: 4 }}>
        <Button onClick={onClose} color='secondary' variant='tonal'>
          Cancelar
        </Button>
        <Button type='submit' variant='contained' disabled={isSaving}>
          {isSaving ? <CircularProgress size={20} color='inherit' /> : 'Guardar Ejemplo'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
)
