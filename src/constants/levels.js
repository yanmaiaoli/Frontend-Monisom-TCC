export const LEVEL_COLORS = {
  COMFORTABLE: '#4FC3F7',
  ADEQUATE: '#66BB6A',
  ATTENTION: '#FFD54F',
  CRITICAL: '#EF5350',
}

export const LEVEL_LABELS = {
  COMFORTABLE: 'Confortável',
  ADEQUATE: 'Adequado',
  ATTENTION: 'Atenção',
  CRITICAL: 'Crítico',
}

export function levelColor(level) {
  return LEVEL_COLORS[level] || '#9E9E9E'
}
