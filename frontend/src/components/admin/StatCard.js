import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, color }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        bgcolor: color,
        color: 'white'
      }}
    >
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Typography component="p" variant="h3">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
