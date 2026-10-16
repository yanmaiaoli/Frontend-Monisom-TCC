import { Paper, Typography } from '@mui/material'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <Paper sx={{ p: 1, boxShadow: 2 }}>
      <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p) => (
        <Typography key={p.dataKey} variant="body2">
          {p.name}: {Number(p.value).toFixed(1)} dB
        </Typography>
      ))}
    </Paper>
  )
}

function NoiseGraph({ windows }) {
  const data = (windows || []).map((w) => ({
    label: fmtTime(w.windowStart),
    leq: w.leq,
    l90: w.l90,
    l10: w.l10,
  }))

  if (data.length === 0) {
    return <Typography color="text.secondary">Sem dados de janela ainda.</Typography>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 24, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis domain={['auto', 'auto']} label={{ value: 'dB', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend />
        <ReferenceLine y={35} stroke="#4FC3F7" strokeDasharray="3 3" />
        <ReferenceLine y={65} stroke="#FFD54F" strokeDasharray="3 3" />
        <ReferenceLine y={85} stroke="#EF5350" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="leq" name="Leq" stroke="#1976d2" strokeWidth={2} dot={{ r: 6 }} />
        <Line dataKey="l90" name="L90" stroke="transparent" dot={{ r: 5, fill: '#4FC3F7' }} />
        <Line dataKey="l10" name="L10" stroke="transparent" dot={{ r: 5, fill: '#EF5350' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default NoiseGraph
