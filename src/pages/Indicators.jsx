import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import PageHeader from '../components/PageHeader.jsx'
import client from '../api/client.js'
import { LEVEL_LABELS, levelColor } from '../constants/levels.js'

const TURNOS = [
  { value: '', label: 'Todos os turnos' },
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'noturno', label: 'Noturno' },
]

function turnoLabel(value) {
  const map = { matutino: 'Matutino', vespertino: 'Vespertino', noturno: 'Noturno' }
  return value ? map[value] || value : '—'
}

function db(v) {
  return v != null ? `${Number(v).toFixed(1)} dB` : '—'
}

function SummaryCard({ label, value }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  )
}

function Indicators() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [turno, setTurno] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    const params = {}
    if (from) params.from = from
    if (to) params.to = to
    if (turno) params.turno = turno
    client
      .get('/indicators', { params })
      .then(({ data }) => {
        if (active) {
          setData(data)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os indicadores')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [from, to, turno])

  const summary = data?.summary
  const ranking = data?.ranking || []

  return (
    <Box>
      <PageHeader
        title="Indicadores"
        description="Indicadores gerais da escola, calculados a partir dos monitoramentos finalizados."
      />

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="De"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          label="Até"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <TextField
          select
          label="Turno"
          size="small"
          sx={{ minWidth: 180 }}
          value={turno}
          onChange={(e) => setTurno(e.target.value)}
        >
          {TURNOS.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <SummaryCard label="Monitoramentos" value={summary?.totalMonitorings ?? 0} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <SummaryCard label="Leq médio" value={db(summary?.averageLeq)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <SummaryCard label="Alertas" value={summary?.totalAlerts ?? 0} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <SummaryCard label="Atenção / Crítico" value={summary?.criticalMonitorings ?? 0} />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Turmas mais ruidosas
          </Typography>
          {ranking.length === 0 ? (
            <Typography color="text.secondary">
              Nenhum monitoramento finalizado no período selecionado.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Turma</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell align="right">Capacidade</TableCell>
                    <TableCell align="right">Monitoramentos</TableCell>
                    <TableCell align="right">Leq médio</TableCell>
                    <TableCell align="right">Faixa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranking.map((r) => (
                    <TableRow key={r.className}>
                      <TableCell>{r.className}</TableCell>
                      <TableCell>{turnoLabel(r.turno)}</TableCell>
                      <TableCell align="right">{r.capacidade ?? '—'}</TableCell>
                      <TableCell align="right">{r.monitorings}</TableCell>
                      <TableCell align="right">{db(r.leqTotal)}</TableCell>
                      <TableCell align="right">
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: `${levelColor(r.level)}33`,
                            fontSize: '0.8rem',
                          }}
                        >
                          {LEVEL_LABELS[r.level] || r.level}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  )
}

export default Indicators
