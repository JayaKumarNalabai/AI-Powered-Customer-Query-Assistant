import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import axiosInstance from '../components/axiosInstance'; // adjust path if needed
import { useAuth } from '../../context/AuthContext'; // adjust path if needed

const RecentChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/recent-chats', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setChats(response.data || []);
      } catch (err) {
        console.error('Error fetching recent chats:', err);
        setError('Failed to load recent chats');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchChats();
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
