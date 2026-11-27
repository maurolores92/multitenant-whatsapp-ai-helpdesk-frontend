// ** React Imports
import { useState, useEffect, FormEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Components
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API & Subcomponents
import api from 'src/configs/api'
import { TenantItem, AiRuleItem, AiKnowledgeItem, AiExampleItem, AiRuleCategory } from './types'
import { AI_RULE_CATEGORIES, AiRuleDialog, AiKnowledgeDialog, AiExampleDialog } from './TenantAiModals'

interface Props {
  tenant: TenantItem
}

const TenantAiTrainingTab = ({ tenant }: Props) => {
  const [subTab, setSubTab] = useState(0)
  const [aiConfig, setAiConfig] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    aiTemperature: 0.2,
    aiSystemPrompt: '',
    aiEnabled: true,
    hasCustomApiKey: false,
    maskedApiKey: ''
  })
  const [showKey, setShowKey] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  const [rules, setRules] = useState<AiRuleItem[]>([])
  const [knowledge, setKnowledge] = useState<AiKnowledgeItem[]>([])
  const [examples, setExamples] = useState<AiExampleItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [openRuleDialog, setOpenRuleDialog] = useState(false)
  const [ruleForm, setRuleForm] = useState<{
    id?: string
    title: string
    instruction: string
    category: AiRuleCategory
    priority: number
  }>({ title: '', instruction: '', category: 'BUSINESS', priority: 1 })
  const [isSavingRule, setIsSavingRule] = useState(false)

  const [openKnowledgeDialog, setOpenKnowledgeDialog] = useState(false)
  const [knowledgeForm, setKnowledgeForm] = useState<{ id?: string; question: string; answer: string; tags: string }>({
    question: '',
    answer: '',
    tags: ''
  })
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false)

  const [openExampleDialog, setOpenExampleDialog] = useState(false)
  const [exampleForm, setExampleForm] = useState({ topic: '', customerInput: '', idealResponse: '' })
  const [isSavingExample, setIsSavingExample] = useState(false)

  const [simInput, setSimInput] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simHistory, setSimHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; meta?: any }>>([])

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [configRes, rulesRes, kbRes, examplesRes] = await Promise.all([
          api.get(`/tenants/${tenant.id}/ai-training/config`),
          api.get(`/tenants/${tenant.id}/ai-training/rules`),
          api.get(`/tenants/${tenant.id}/ai-training/knowledge`),
          api.get(`/tenants/${tenant.id}/ai-training/examples`)
        ])
        setAiConfig({
          geminiApiKey: '',
          geminiModel: configRes.data.geminiModel || 'gemini-3.8-flash',
          aiTemperature: configRes.data.aiTemperature ?? 0.2,
          aiSystemPrompt: configRes.data.aiSystemPrompt || '',
          aiEnabled: configRes.data.aiEnabled ?? true,
          hasCustomApiKey: Boolean(configRes.data.hasCustomApiKey),
          maskedApiKey: configRes.data.maskedApiKey || ''
        })
        setRules(Array.isArray(rulesRes.data) ? rulesRes.data : [])
        setKnowledge(Array.isArray(kbRes.data) ? kbRes.data : [])
        setExamples(Array.isArray(examplesRes.data) ? examplesRes.data : [])
      } catch {
        toast.error('No se pudo cargar el entrenamiento de IA')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [tenant.id])

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      const body: any = {
        geminiModel: aiConfig.geminiModel,
        aiTemperature: aiConfig.aiTemperature,
        aiSystemPrompt: aiConfig.aiSystemPrompt,
        aiEnabled: aiConfig.aiEnabled
      }
      if (aiConfig.geminiApiKey.trim()) body.geminiApiKey = aiConfig.geminiApiKey.trim()

      const res = await api.patch(`/tenants/${tenant.id}/ai-training/config`, body)
      setAiConfig(prev => ({
        ...prev,
        geminiApiKey: '',
        hasCustomApiKey: Boolean(res.data.hasCustomApiKey),
        maskedApiKey: res.data.maskedApiKey || ''
      }))
      toast.success('Configuración de IA actualizada')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar configuración de IA')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSaveRule = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingRule(true)
    try {
      const payload = {
        title: ruleForm.title,
        instruction: ruleForm.instruction,
        category: ruleForm.category,
        priority: Number(ruleForm.priority)
      }
      if (ruleForm.id) {
        const res = await api.patch(`/tenants/${tenant.id}/ai-training/rules/${ruleForm.id}`, payload)
        setRules(prev => prev.map(r => (r.id === res.data.id ? res.data : r)))
        toast.success('Regla actualizada')
      } else {
        const res = await api.post(`/tenants/${tenant.id}/ai-training/rules`, payload)
        setRules(prev => [...prev, res.data])
        toast.success('Regla creada')
      }
      setOpenRuleDialog(false)
      setRuleForm({ title: '', instruction: '', category: 'BUSINESS', priority: 1 })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar regla')
    } finally {
      setIsSavingRule(false)
    }
  }

  const handleSaveKnowledge = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingKnowledge(true)
    try {
      const payload = {
        question: knowledgeForm.question,
        answer: knowledgeForm.answer,
        tags: knowledgeForm.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      }
      if (knowledgeForm.id) {
        const res = await api.patch(`/tenants/${tenant.id}/ai-training/knowledge/${knowledgeForm.id}`, payload)
        setKnowledge(prev => prev.map(k => (k.id === res.data.id ? res.data : k)))
        toast.success('Conocimiento actualizado')
      } else {
        const res = await api.post(`/tenants/${tenant.id}/ai-training/knowledge`, payload)
        setKnowledge(prev => [res.data, ...prev])
        toast.success('Conocimiento agregado')
      }
      setOpenKnowledgeDialog(false)
      setKnowledgeForm({ question: '', answer: '', tags: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar conocimiento')
    } finally {
      setIsSavingKnowledge(false)
    }
  }

  const handleSaveExample = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingExample(true)
    try {
      const res = await api.post(`/tenants/${tenant.id}/ai-training/examples`, exampleForm)
      setExamples(prev => [res.data, ...prev])
      toast.success('Ejemplo de respuesta guardado')
      setOpenExampleDialog(false)
      setExampleForm({ topic: '', customerInput: '', idealResponse: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar ejemplo')
    } finally {
      setIsSavingExample(false)
    }
  }

  const handleRunSimulation = async (e: FormEvent) => {
    e.preventDefault()
    if (!simInput.trim()) return
    const msg = simInput.trim()
    setSimInput('')
    setIsSimulating(true)
    setSimHistory(prev => [...prev, { sender: 'user', text: msg }])
    try {
      const res = await api.post(`/tenants/${tenant.id}/ai-training/simulate`, { message: msg })
      setSimHistory(prev => [...prev, { sender: 'bot', text: res.data.response, meta: res.data }])
    } catch (err: any) {
      setSimHistory(prev => [...prev, { sender: 'bot', text: `[Error]: ${err?.response?.data?.message || err.message}` }])
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Tabs value={subTab} onChange={(_, val) => setSubTab(val)} variant='scrollable' scrollButtons='auto'>
        <Tab label='Identidad & Modelo' />
        <Tab label={`Reglas (${rules.length})`} />
        <Tab label={`Conocimientos (${knowledge.length})`} />
        <Tab label={`Ejemplos (${examples.length})`} />
        <Tab label='Simulador en Vivo' />
      </Tabs>

      {/* SUBTAB 0: IDENTIDAD & CREDENCIALES */}
      {subTab === 0 && (
        <Box component='form' onSubmit={handleSaveConfig} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity='info'>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              Paso 1: Define quién es la empresa y el comportamiento general del bot
            </Typography>
            <Typography variant='caption'>
              Aquí configuras el rol principal de <strong>{tenant.name}</strong> (a qué se dedica, horarios y qué objetivo tiene). Luego afinarás su conducta con Reglas y Conocimientos.
            </Typography>
          </Alert>

          <FormControlLabel
            control={
              <Switch
                checked={aiConfig.aiEnabled}
                onChange={e => setAiConfig({ ...aiConfig, aiEnabled: e.target.checked })}
                color='primary'
              />
            }
            label='Asistente de IA Activo para responder automáticamente por WhatsApp'
          />

          <CustomTextField
            fullWidth
            multiline
            rows={4}
            label='Identidad de la Empresa (Prompt Base)'
            placeholder={`Ej: Eres el asistente virtual oficial de ${tenant.name}. Nos dedicamos a la venta, alquiler y servicio técnico de impresoras y fotocopiadoras. Nuestro horario de atención es de lunes a viernes de 9 a 18 hs. Tu objetivo es resolver dudas simples y recopilar los datos necesarios si requiere soporte técnico.`}
            value={aiConfig.aiSystemPrompt}
            onChange={e => setAiConfig({ ...aiConfig, aiSystemPrompt: e.target.value })}
            helperText='Describe brevemente el rubro de la empresa, horarios de atención y el objetivo principal de la IA.'
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <CustomTextField
              select
              fullWidth
              label='Modelo de IA (Google Gemini)'
              value={aiConfig.geminiModel}
              onChange={e => setAiConfig({ ...aiConfig, geminiModel: e.target.value })}
              helperText='Gemini 3.8 Flash ofrece la mejor velocidad y soporte actual para WhatsApp'
            >
              <MenuItem value='gemini-3.8-flash'>Google Gemini 3.8 Flash (Recomendado)</MenuItem>
            </CustomTextField>

            <Box sx={{ px: 2 }}>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                Temperatura / Creatividad: {aiConfig.aiTemperature}
              </Typography>
              <Slider
                value={aiConfig.aiTemperature}
                min={0.0}
                max={1.0}
                step={0.1}
                marks={[
                  { value: 0.1, label: '0.1 Preciso' },
                  { value: 0.5, label: '0.5 Balanceado' },
                  { value: 0.9, label: '0.9 Creativo' }
                ]}
                onChange={(_, val) => setAiConfig({ ...aiConfig, aiTemperature: val as number })}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                Para soporte técnico se recomienda <strong>0.1 a 0.3</strong> (respuestas exactas sin improvisar).
              </Typography>
            </Box>
          </Box>

          <CustomTextField
            fullWidth
            label='Google Gemini API Key (Opcional - Exclusiva del cliente)'
            type={showKey ? 'text' : 'password'}
            placeholder={aiConfig.hasCustomApiKey ? '•••••••••••••••• (dejar en blanco para conservar)' : 'AIzaSy... (opcional)'}
            value={aiConfig.geminiApiKey}
            onChange={e => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
            helperText={
              aiConfig.hasCustomApiKey
                ? `Clave propia activa (${aiConfig.maskedApiKey})`
                : 'Sin clave propia: utiliza la API Key general del sistema.'
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setShowKey(!showKey)} edge='end'>
                    <Icon icon={showKey ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.125rem' />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='submit' variant='contained' disabled={isSavingConfig}>
              {isSavingConfig ? <CircularProgress size={20} color='inherit' /> : 'Guardar Identidad y Modelo'}
            </Button>
          </Box>
        </Box>
      )}

      {/* SUBTAB 1: REGLAS EN ESPAÑOL CON GUÍA POR CATEGORÍA */}
      {subTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                Paso 2: Reglas y Directivas de Comportamiento
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Guía paso a paso de cómo categorizar cada regla para obtener respuestas precisas.
              </Typography>
            </Box>
            <Button
              size='small'
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => {
                setRuleForm({ title: '', instruction: '', category: 'BUSINESS', priority: 1 })
                setOpenRuleDialog(true)
              }}
            >
              Nueva Regla
            </Button>
          </Box>

          {/* Tarjetas explicativas de las 4 categorías */}
          <Grid container spacing={2}>
            {(Object.keys(AI_RULE_CATEGORIES) as AiRuleCategory[]).map(cat => {
              const meta = AI_RULE_CATEGORIES[cat]

              return (
                <Grid item xs={12} sm={6} key={cat}>
                  <Paper variant='outlined' sx={{ p: 2, height: '100%' }}>
                    <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.75 }}>
                      <CustomChip
                        rounded
                        skin='light'
                        size='small'
                        color={meta.color}
                        icon={<Icon icon={meta.icon} fontSize='0.9rem' />}
                        label={meta.label}
                      />
                    </Stack>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                      {meta.description}
                    </Typography>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>

          {isLoading ? (
            <CircularProgress size={24} />
          ) : rules.length === 0 ? (
            <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Aún no hay reglas configuradas para {tenant.name}.
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Crea al menos una regla de &quot;Restricción&quot; y una de &quot;Criterio de Derivación&quot; para controlar cuándo crear tickets.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {rules.map(r => {
                const meta = AI_RULE_CATEGORIES[r.category] || AI_RULE_CATEGORIES.BUSINESS

                return (
                  <Paper
                    key={r.id}
                    variant='outlined'
                    sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, opacity: r.isActive ? 1 : 0.6 }}
                  >
                    <Box>
                      <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 0.75, flexWrap: 'wrap' }}>
                        <CustomChip rounded skin='light' size='small' color={meta.color} label={meta.label} />
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {r.title}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                          (Prioridad {r.priority})
                        </Typography>
                      </Stack>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {r.instruction}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title={r.isActive ? 'Pausar regla' : 'Activar regla'}>
                        <Switch
                          size='small'
                          checked={r.isActive}
                          onChange={async () => {
                            const res = await api.patch(`/tenants/${tenant.id}/ai-training/rules/${r.id}`, {
                              isActive: !r.isActive
                            })
                            setRules(prev => prev.map(item => (item.id === res.data.id ? res.data : item)))
                          }}
                        />
                      </Tooltip>
                      <Tooltip title='Editar'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setRuleForm({
                              id: r.id,
                              title: r.title,
                              instruction: r.instruction,
                              category: r.category,
                              priority: r.priority
                            })
                            setOpenRuleDialog(true)
                          }}
                        >
                          <Icon icon='tabler:edit' fontSize='1.125rem' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Eliminar'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={async () => {
                            await api.delete(`/tenants/${tenant.id}/ai-training/rules/${r.id}`)
                            setRules(prev => prev.filter(item => item.id !== r.id))
                            toast.success('Regla eliminada')
                          }}
                        >
                          <Icon icon='tabler:trash' fontSize='1.125rem' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* SUBTAB 2: BASE DE CONOCIMIENTOS */}
      {subTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                Paso 3: Base de Conocimientos (Preguntas Frecuentes y Soluciones Técnicas)
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Información oficial que la IA consulta para responder dudas sin necesidad de molestar a un técnico.
              </Typography>
            </Box>
            <Button
              size='small'
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => {
                setKnowledgeForm({ question: '', answer: '', tags: '' })
                setOpenKnowledgeDialog(true)
              }}
            >
              Nuevo Conocimiento
            </Button>
          </Box>

          <Alert severity='info'>
            <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
              ¿Qué información debes cargar aquí?
            </Typography>
            <Typography variant='caption' component='div'>
              • <strong>Datos generales del negocio:</strong> dirección del local, horarios, teléfono de guardia, zonas de visita técnica, medios de pago.
              <br />• <strong>Fallas comunes y soluciones remotas:</strong> atascos de papel, reinicios de equipos, configuración de red/escáner, códigos de error frecuentes.
              <br />• <strong>Servicios y productos:</strong> marcas que reparan, cómo solicitar insumos (tóner/cartuchos) o pedir una cotización.
            </Typography>
          </Alert>

          <Stack spacing={2}>
            {knowledge.length === 0 ? (
              <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  No hay ítems en la base de conocimientos. Agrega las preguntas y fallas más frecuentes de este cliente.
                </Typography>
              </Paper>
            ) : (
              knowledge.map(k => (
                <Paper
                  key={k.id}
                  variant='outlined'
                  sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, opacity: k.isActive ? 1 : 0.6 }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                      {k.question}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', mb: 1 }}>
                      {k.answer}
                    </Typography>
                    {k.tags && k.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {k.tags.map(tag => (
                          <CustomChip key={tag} rounded skin='light' size='small' label={tag} />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      size='small'
                      checked={k.isActive}
                      onChange={async () => {
                        const res = await api.patch(`/tenants/${tenant.id}/ai-training/knowledge/${k.id}`, {
                          isActive: !k.isActive
                        })
                        setKnowledge(prev => prev.map(item => (item.id === res.data.id ? res.data : item)))
                      }}
                    />
                    <IconButton
                      size='small'
                      onClick={() => {
                        setKnowledgeForm({
                          id: k.id,
                          question: k.question,
                          answer: k.answer,
                          tags: (k.tags || []).join(', ')
                        })
                        setOpenKnowledgeDialog(true)
                      }}
                    >
                      <Icon icon='tabler:edit' fontSize='1.125rem' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={async () => {
                        await api.delete(`/tenants/${tenant.id}/ai-training/knowledge/${k.id}`)
                        setKnowledge(prev => prev.filter(item => item.id !== k.id))
                        toast.success('Conocimiento eliminado')
                      }}
                    >
                      <Icon icon='tabler:trash' fontSize='1.125rem' />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        </Box>
      )}

      {/* SUBTAB 3: EJEMPLOS DE RESPUESTA (FEW-SHOT) */}
      {subTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                Paso 4: Ejemplos Reales de Conversación (Aprendizaje por Imitación)
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Muéstrale a la IA casos reales de mensajes de clientes y la respuesta exacta que esperas.
              </Typography>
            </Box>
            <Button
              size='small'
              variant='contained'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => {
                setExampleForm({ topic: '', customerInput: '', idealResponse: '' })
                setOpenExampleDialog(true)
              }}
            >
              Nuevo Ejemplo
            </Button>
          </Box>

          <Stack spacing={2}>
            {examples.length === 0 ? (
              <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Sin ejemplos cargados. Agrega 2 o 3 ejemplos de chats reales para que la IA imite el estilo de tu equipo.
                </Typography>
              </Paper>
            ) : (
              examples.map(ex => (
                <Paper key={ex.id} variant='outlined' sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    {ex.topic && (
                      <CustomChip rounded skin='light' size='small' color='secondary' label={ex.topic} sx={{ mb: 1 }} />
                    )}
                    <Typography variant='body2' sx={{ mb: 0.5 }}>
                      <strong>Cliente:</strong> &quot;{ex.customerInput}&quot;
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'success.main' }}>
                      <strong>Respuesta Ideal IA:</strong> &quot;{ex.idealResponse}&quot;
                    </Typography>
                  </Box>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={async () => {
                      await api.delete(`/tenants/${tenant.id}/ai-training/examples/${ex.id}`)
                      setExamples(prev => prev.filter(item => item.id !== ex.id))
                      toast.success('Ejemplo eliminado')
                    }}
                  >
                    <Icon icon='tabler:trash' fontSize='1.125rem' />
                  </IconButton>
                </Paper>
              ))
            )}
          </Stack>
        </Box>
      )}

      {/* SUBTAB 4: SIMULADOR */}
      {subTab === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Alert severity='info'>
            Prueba en tiempo real cómo responde la IA de <strong>{tenant.name}</strong> combinando{' '}
            <strong>{rules.filter(r => r.isActive).length} reglas</strong>,{' '}
            <strong>{knowledge.filter(k => k.isActive).length} conocimientos</strong> y{' '}
            <strong>{examples.length} ejemplos</strong>.
          </Alert>
          <Paper variant='outlined' sx={{ height: 280, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {simHistory.length === 0 ? (
              <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant='body2'>
                  Escribe una consulta simulando ser un cliente de WhatsApp para probar el entrenamiento.
                </Typography>
              </Box>
            ) : (
              simHistory.map((msg, i) => (
                <Box key={i} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'action.hover',
                      color: msg.sender === 'user' ? 'common.white' : 'text.primary'
                    }}
                  >
                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </Typography>
                  </Paper>
                  {msg.meta && (
                    <Typography variant='caption' sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                      {msg.meta.isLiveAi ? 'Gemini Live' : 'Fallback'} • {msg.meta.modelUsed} • {msg.meta.executionTimeMs}ms
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Paper>
          <Box component='form' onSubmit={handleRunSimulation} sx={{ display: 'flex', gap: 2 }}>
            <CustomTextField
              fullWidth
              placeholder='Ej: Hola, mi fotocopiadora tira error E-402 y huele a quemado...'
              value={simInput}
              onChange={e => setSimInput(e.target.value)}
              disabled={isSimulating}
            />
            <Button type='submit' variant='contained' disabled={isSimulating || !simInput.trim()}>
              {isSimulating ? <CircularProgress size={20} color='inherit' /> : 'Probar IA'}
            </Button>
          </Box>
        </Box>
      )}

      <AiRuleDialog
        open={openRuleDialog}
        tenantName={tenant.name}
        ruleForm={ruleForm}
        isSaving={isSavingRule}
        onClose={() => setOpenRuleDialog(false)}
        onChange={setRuleForm}
        onSubmit={handleSaveRule}
      />

      <AiKnowledgeDialog
        open={openKnowledgeDialog}
        knowledgeForm={knowledgeForm}
        isSaving={isSavingKnowledge}
        onClose={() => setOpenKnowledgeDialog(false)}
        onChange={setKnowledgeForm}
        onSubmit={handleSaveKnowledge}
      />

      <AiExampleDialog
        open={openExampleDialog}
        exampleForm={exampleForm}
        isSaving={isSavingExample}
        onClose={() => setOpenExampleDialog(false)}
        onChange={setExampleForm}
        onSubmit={handleSaveExample}
      />
    </Box>
  )
}

export default TenantAiTrainingTab
