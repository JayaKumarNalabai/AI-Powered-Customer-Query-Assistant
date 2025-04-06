import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Tooltip
} from '@mui/material';

const RecentChats = ({ chats = [] }) => {
  if (chats.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No recent chats</Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Last Message</TableCell>
          <TableCell>Sentiment</TableCell>
          <TableCell>Last Updated</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {chats.map((chat) => (
          <TableRow key={chat._id}>
            <TableCell>{chat.userId?.name || 'Unknown'}</TableCell>
            <TableCell>
              <Tooltip title={chat.lastMessage || ''}>
                <Typography noWrap sx={{ maxWidth: 200 }}>
                  {chat.lastMessage || 'No messages'}
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell>{chat.sentiment || 'N/A'}</TableCell>
            <TableCell>
              {new Date(chat.updatedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentChats;
