import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import PageHeader from '../components/PageHeader.jsx'
import client from '../api/client.js'

function Allocations() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [allocated, setAllocated] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [loading, setLoading] = useState(true)
  const [allocLoading, setAllocLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const loadBase = async () => {
    setLoading(true)
    try {
      const [classesRes, teachersRes] = await Promise.all([
        client.get('/classes'),
        client.get('/teachers'),
      ])
      setClasses(classesRes.data)
      setTeachers(teachersRes.data)
    } catch {
      setSnackbar({ open: true, message: 'Não foi possível carregar os dados', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBase()
  }, [])

  const loadAllocated = async (classId) => {
    setAllocLoading(true)
    try {
      const { data } = await client.get(`/classes/${classId}/teachers`)
      setAllocated(data)
    } catch {
      setAllocated([])
    } finally {
      setAllocLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClassId) {
      loadAllocated(selectedClassId)
      setSelectedTeacherId('')
    } else {
      setAllocated([])
    }
  }, [selectedClassId])

  const availableTeachers = teachers.filter((t) => !allocated.some((a) => a.id === t.id))

  const handleAllocate = async () => {
    if (!selectedClassId || !selectedTeacherId) return
    setSaving(true)
    try {
      await client.post(`/classes/${selectedClassId}/teachers`, {
        teacherId: selectedTeacherId,
      })
      setSnackbar({ open: true, message: 'Professor lotado na turma', severity: 'success' })
      setSelectedTeacherId('')
      loadAllocated(selectedClassId)
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Erro ao lotar professor',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <PageHeader title="Lotação" description="Vinculação de professores às turmas." />

      <TextField
        select
        label="Turma"
        fullWidth
        sx={{ maxWidth: 400, mb: 3 }}
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        disabled={loading}
      >
        <MenuItem value="">Selecione uma turma</MenuItem>
        {classes.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {selectedClassId && (
        <>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Professor"
              sx={{ minWidth: 300 }}
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              disabled={availableTeachers.length === 0}
            >
              <MenuItem value="">
                {availableTeachers.length === 0
                  ? 'Nenhum professor disponível'
                  : 'Selecione um professor'}
              </MenuItem>
              {availableTeachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={handleAllocate}
              disabled={!selectedTeacherId || saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Alocar'}
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Professores lotados
          </Typography>
          {allocLoading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>Nenhum professor lotado nesta turma</TableCell>
                    </TableRow>
                  ) : (
                    allocated.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.email}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

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

export default Allocations
