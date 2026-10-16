import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import client from '../api/client.js'

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

function duration(start, end) {
  if (!start || !end) return '—'
  const ms = new Date(end) - new Date(start)
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}min ${sec}s`
}

function FinishedList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await client.get('/monitoring/finished')
        setItems(data)
        setError('')
      } catch {
        setError('Não foi possível carregar os monitoramentos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Box>
      <PageHeader
        title="Monitoramentos finalizados"
        description="Histórico dos monitoramentos finalizados — consulte o detalhe, o gráfico de ruído e os alertas de cada medição."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">Nenhum monitoramento finalizado.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sala</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
                <TableCell>Duração</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((m) => (
                <TableRow
                  key={m.monitoringId}
                  hover
                  onClick={() => navigate(`/monitoramentos/${m.monitoringId}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{m.roomName || '—'}</TableCell>
                  <TableCell>{m.className || '—'}</TableCell>
                  <TableCell>{fmt(m.startedAt)}</TableCell>
                  <TableCell>{fmt(m.finishedAt)}</TableCell>
                  <TableCell>{duration(m.startedAt, m.finishedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default FinishedList
