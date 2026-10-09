import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import client from '../api/client.js'

const TURNOS = [
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'noturno', label: 'Noturno' },
]

function turnoLabel(value) {
  return TURNOS.find((t) => t.value === value)?.label || value
}

function Classes() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [turno, setTurno] = useState('matutino')
  const [capacidade, setCapacidade] = useState('')
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/classes')
      setClasses(data)
      setLoadError('')
    } catch {
      setLoadError('Não foi possível carregar as turmas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setTurno('matutino')
    setCapacidade('')
    setOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setName(c.name)
    setTurno(c.turno)
    setCapacidade(String(c.capacidade))
    setOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const body = { name, turno, capacidade: Number(capacidade) }
    try {
      if (editing) {
        await client.put(`/classes/${editing.id}`, body)
        setSnackbar({ open: true, message: 'Turma atualizada', severity: 'success' })
      } else {
        await client.post('/classes', body)
        setSnackbar({ open: true, message: 'Turma cadastrada', severity: 'success' })
      }
      setOpen(false)
      load()
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Erro ao salvar turma',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Turmas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova turma
        </Button>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Turno</TableCell>
                <TableCell>Capacidade</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>Nenhuma turma cadastrada</TableCell>
                </TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{turnoLabel(c.turno)}</TableCell>
                    <TableCell>{c.capacidade}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEdit(c)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar turma' : 'Nova turma'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            select
            label="Turno"
            fullWidth
            margin="normal"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
          >
            {TURNOS.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Capacidade"
            type="number"
            fullWidth
            margin="normal"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !name || !capacidade}
          >
            {saving ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Classes
