import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material';
import api from '../services/api';

function LearningContent() {
  const { language } = useParams();
  const [content, setContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data since learning_content table might not be populated
    // In production, this would fetch from /api/learning/:language
    setContent([
      {
        id: 1,
        topic: 'basics',
        title: 'Getting Started',
        content: 'Learn the fundamentals of programming...',
        order_index: 1
      },
      {
        id: 2,
        topic: 'variables',
        title: 'Variables and Data Types',
        content: 'Understanding variables and different data types...',
        order_index: 2
      }
    ]);
    setLoading(false);
  }, [language]);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Learning Content - {language?.toUpperCase()}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Explore topic-based tutorials and examples to enhance your understanding.
      </Typography>

      <Box sx={{ display: 'flex', mt: 3 }}>
        <Paper sx={{ width: 300, mr: 3 }}>
          <List>
            {content.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedTopic?.id === item.id}
                    onClick={() => setSelectedTopic(item)}
                  >
                    <ListItemText
                      primary={`${index + 1}. ${item.title}`}
                      secondary={item.topic}
                    />
                  </ListItemButton>
                </ListItem>
                {index < content.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper sx={{ flex: 1, p: 3 }}>
          {selectedTopic ? (
            <>
              <Typography variant="h5" gutterBottom>
                {selectedTopic.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>
                {selectedTopic.content}
              </Typography>
              {selectedTopic.code_examples && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Code Example
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {selectedTopic.code_examples}
                  </pre>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Select a topic from the list to view its content.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default LearningContent;

