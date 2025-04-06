import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../components/axiosInstance';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const { user } = useAuth();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/chats', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      setChats(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError(
        error.response?.data?.message || error.message || 'Failed to fetch chats'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchChats();
    }
  }, [user]);

  const handleOpen = (chat) => {
    setSelectedChat(chat);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedChat(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await axiosInstance.delete(`/api/admin/chats/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        await fetchChats(); // Refresh list
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert(
          error.response?.data?.message || error.message || 'Failed to delete chat'
        );
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Chats
      </Typography>

      {chats.length === 0 ? (
        <Alert severity="info">No chats found</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Messages</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat._id}>
                  <TableCell>{chat.userId?.name || 'Unknown'}</TableCell>
                  <TableCell>{chat.messages?.length || 0} messages</TableCell>
                  <TableCell>
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleOpen(chat)} color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(chat._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Chat Details</DialogTitle>
        <DialogContent>
          {selectedChat && (
            <>
              <Typography variant="h6" gutterBottom>
                User: {selectedChat.userId?.name || 'Unknown'}
              </Typography>
              <List>
                {selectedChat.messages?.map((msg, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Typography color={msg.role === 'user' ? 'primary' : 'secondary'}>
                          {msg.role}
                        </Typography>
                      }
                      secondary={msg.content}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatList;
