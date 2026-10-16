import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LevelLight from '../components/LevelLight.jsx'
import PageHeader from '../components/PageHeader.jsx'
import client from '../api/client.js'
import { levelColor, LEVEL_LABELS } from '../constants/levels.js'

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function LiveMonitoring() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const { data } = await client.get('/monitoring/live')
        if (active) {
          setItems(data)
          setError('')
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os monitoramentos')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    const timer = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  return (
    <Box>
      <PageHeader
        title="Monitoramento ao vivo"
        description="MoniSom — monitoramento de ruído em salas de aula em tempo real. Projeto de Conclusão de Curso de Ciência da Computação."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">Nenhum monitoramento em andamento no momento.</Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.monitoringId}>
              <Card
                sx={{
                  borderLeft: `6px solid ${levelColor(m.level)}`,
                  height: '100%',
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/monitoramentos/${m.monitoringId}`)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LevelLight level={m.level} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {m.roomName || 'Sala não informada'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {m.className || 'Turma não informada'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6">
                        {m.currentLeq != null ? `${m.currentLeq.toFixed(1)} dB` : '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.level ? LEVEL_LABELS[m.level] : 'Coletando…'}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Início às {fmtTime(m.startedAt)}
                    </Typography>

                    {m.lastAlert && (
                      <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                        {m.lastAlert.message}
                      </Alert>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default LiveMonitoring
