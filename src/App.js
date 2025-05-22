import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [token, setToken] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [jsonResult, setJsonResult] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('figmaToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleTokenSave = () => {
    localStorage.setItem('figmaToken', token);
    showNotification('Token saved successfully!', 'success');
  };

  const handleTokenDelete = () => {
    localStorage.removeItem('figmaToken');
    setToken('');
    showNotification('Token deleted successfully!', 'success');
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleToggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  const extractFileAndNodeId = (url) => {
    // Try to match design URL format
    let match = url.match(/design\/(.*?)\/(.*?)\?node-id=(.*?)(?:&|$)/);
    if (match) {
      return { fileId: match[1], nodeId: match[3] };
    }
    
    // Try to match file URL format
    match = url.match(/file\/(.*?)\/\?node-id=(.*?)(?:&|$)/);
    if (match) {
      return { fileId: match[1], nodeId: match[2] };
    }
    
    return null;
  };

  const handleGetJson = async () => {
    try {
      const ids = extractFileAndNodeId(figmaUrl);
      if (!ids) {
        showNotification('Invalid Figma URL format', 'error');
        return;
      }

      const response = await axios.get(
        `https://api.figma.com/v1/files/${ids.fileId}/nodes?ids=${ids.nodeId}`,
        {
          headers: {
            'X-Figma-Token': token
          }
        }
      );

      setJsonResult(JSON.stringify(response.data, null, 2));
      showNotification('JSON fetched successfully!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error fetching JSON', 'error');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonResult);
    showNotification('JSON copied to clipboard!', 'success');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Figma JSON Parser
        </Typography>
        
        <Paper sx={{ p: 4, mb: 4, width: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }} elevation={3}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'text.primary' }}>
            Figma Access Token
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Personal Access Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              type={showToken ? 'text' : 'password'}
              variant="outlined"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle token visibility"
                      onClick={handleToggleTokenVisibility}
                      edge="end"
                      size="small"
                    >
                      {showToken ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleTokenSave}
              size="large"
              disabled={!token}
              sx={{ minWidth: '120px', borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 'medium' }}
            >
              Save Token
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleTokenDelete}
              size="large"
              disabled={!token}
              sx={{ minWidth: '120px', borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 'medium' }}
            >
              Delete Token
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Your token is stored securely in browser local storage. Never share your token publicly.
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, mb: 4, width: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }} elevation={3}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'text.primary' }}>
            Generate JSON from Figma Selection
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Figma Selection URL"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="https://www.figma.com/design/..."
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleGetJson}
              size="large"
              disabled={!token || !figmaUrl}
              sx={{ minWidth: '120px', borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 'medium' }}
            >
              Get JSON
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Copy the link to a specific Figma element by right-clicking it in Figma and selecting 'Copy link'.
          </Typography>
        </Paper>

        {jsonResult && (
          <Paper sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', backgroundColor: '#ffffff' }} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>JSON Result</Typography>
              <Button 
                variant="outlined" 
                onClick={handleCopyJson}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'medium' }}
              >
                Copy to Clipboard
              </Button>
            </Box>
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                p: 3,
                borderRadius: 2,
                overflow: 'auto',
                maxHeight: '400px',
                border: '1px solid #e0e0e0',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {jsonResult}
            </Box>
          </Paper>
        )}
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
