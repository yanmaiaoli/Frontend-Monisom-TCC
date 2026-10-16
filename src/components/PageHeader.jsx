import { Box, Typography } from '@mui/material'

function PageHeader({ title, description, sx }) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Typography variant="h5">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}

export default PageHeader
