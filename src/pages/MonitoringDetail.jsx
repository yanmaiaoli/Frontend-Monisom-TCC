import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useParams } from 'react-router-dom'
import NoiseGraph from '../components/NoiseGraph.jsx'
import client from '../api/client.js'
import { levelColor, LEVEL_LABELS } from '../constants/levels.js'

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function db(v) {
  return v != null ? `${v.toFixed(1)} dB` : '—'
}

const DESCRIPTORS = {
  leqTotal:
    'Nível sonoro contínuo equivalente (Leq) de todo o monitoramento — a média de energia sonora em decibéis (dB).',
  l10: 'Nível sonoro excedido em 10% do tempo — representa os momentos mais ruidosos.',
  l50: 'Nível sonoro excedido em 50% do tempo — o valor mediano (nível típico).',
  l90: 'Nível sonoro excedido em 90% do tempo — representa o ruído de fundo.',
  level:
    'Classificação conforme o Leq total: Confortável (≤35 dB), Adequado (≤65 dB), Atenção (≤85 dB) e Crítico (>85 dB).',
}

function InfoCard({ label, value, color, help, emphasized = false }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderLeft: `${emphasized ? 6 : 4}px solid ${color || 'transparent'}`,
        backgroundColor: emphasized && color ? `${color}33` : undefined,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          {help && (
            <Tooltip title={help} arrow>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.8 }} />
            </Tooltip>
          )}
        </Box>
        <Typography variant="h6" sx={emphasized ? { fontWeight: 700 } : undefined}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function MonitoringDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await client.get(`/monitoring/${id}`)
      setData(data)
      setError('')
    } catch {
      setError('Não foi possível carregar o monitoramento')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const isLive = data != null && data.finishedAt == null

  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [isLive, load])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!data) return null

  const finished = data.finishedAt != null
  const summary = data.summary
  const windows = data.windows || []

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {data.roomName || 'Sala não informada'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {data.className || 'Turma não informada'} · {data.teacherName || 'Professor não informado'}
        {!finished && <Chip size="small" label="Em andamento" color="info" sx={{ ml: 1 }} />}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Início: {fmt(data.startedAt)} {finished && `· Fim: ${fmt(data.finishedAt)}`}
      </Typography>

      {finished ? (
        <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
          <Grid item xs={6} sm={4}>
            <InfoCard
              label="Leq total"
              value={summary ? db(summary.leqTotal) : '—'}
              help={DESCRIPTORS.leqTotal}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <InfoCard
              label="L10"
              value={summary ? db(summary.l10) : '—'}
              help={DESCRIPTORS.l10}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <InfoCard
              label="L50"
              value={summary ? db(summary.l50) : '—'}
              help={DESCRIPTORS.l50}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <InfoCard
              label="L90"
              value={summary ? db(summary.l90) : '—'}
              help={DESCRIPTORS.l90}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <InfoCard
              label="Nível"
              value={summary ? LEVEL_LABELS[summary.level] || summary.level : '—'}
              color={summary ? levelColor(summary.level) : undefined}
              help={DESCRIPTORS.level}
              emphasized
            />
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
          Monitoramento em andamento — as janelas abaixo são atualizadas conforme fecham.
        </Alert>
      )}

      {finished ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Ruído ao longo do tempo
          </Typography>
          <Paper sx={{ p: 2 }}>
            <NoiseGraph windows={windows} />
          </Paper>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Histórico de janelas
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Início</TableCell>
                  <TableCell>Fim</TableCell>
                  <TableCell align="right">Leq</TableCell>
                  <TableCell align="right">L90</TableCell>
                  <TableCell align="right">L10</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {windows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Nenhuma janela fechada ainda.</TableCell>
                  </TableRow>
                ) : (
                  windows.map((w) => (
                    <TableRow key={w.windowStart}>
                      <TableCell>{fmtTime(w.windowStart)}</TableCell>
                      <TableCell>{fmtTime(w.windowEnd)}</TableCell>
                      <TableCell align="right">{db(w.leq)}</TableCell>
                      <TableCell align="right">{db(w.l90)}</TableCell>
                      <TableCell align="right">{db(w.l10)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {finished && (data.perception != null || data.stress != null) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1">Percepção do professor</Typography>
          <Typography variant="body2">
            Percepção: {data.perception ?? '—'} · Estresse: {data.stress ?? '—'}
          </Typography>
        </Paper>
      )}

      {data.alerts && data.alerts.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Alertas
          </Typography>
          {data.alerts.map((a, i) => (
            <Alert
              key={i}
              severity={a.severity === 'MEDIUM' ? 'warning' : 'error'}
              sx={{ mb: 1 }}
            >
              <strong>{a.type}</strong> — {a.message}
            </Alert>
          ))}
        </Paper>
      )}
    </Box>
  )
}

export default MonitoringDetail
