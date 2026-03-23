import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  listProjects,
  createProject,
  generateScreen,
  editScreen,
  getScreenHtml,
  getScreenImage,
  listScreens,
  type DeviceType,
  type ModelId,
} from './stitch.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// List projects
app.get('/api/stitch/projects', async (_req, res) => {
  try {
    const projects = await listProjects();
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
app.post('/api/stitch/projects', async (req, res) => {
  try {
    const { title } = req.body;
    const project = await createProject(title);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate screen
app.post('/api/stitch/generate', async (req, res) => {
  try {
    const { projectId, prompt, deviceType, modelId } = req.body as {
      projectId: string;
      prompt: string;
      deviceType?: DeviceType;
      modelId?: ModelId;
    };
    if (!projectId || !prompt) {
      res.status(400).json({ error: 'projectId and prompt are required' });
      return;
    }
    const result = await generateScreen(projectId, prompt, deviceType, modelId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Edit screen
app.post('/api/stitch/edit', async (req, res) => {
  try {
    const { sessionId, prompt, deviceType, modelId } = req.body as {
      sessionId: string;
      prompt: string;
      deviceType?: DeviceType;
      modelId?: ModelId;
    };
    if (!sessionId || !prompt) {
      res.status(400).json({ error: 'sessionId and prompt are required' });
      return;
    }
    const result = await editScreen(sessionId, prompt, deviceType, modelId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get HTML
app.get('/api/stitch/html/:sessionId', async (req, res) => {
  try {
    const html = await getScreenHtml(req.params.sessionId);
    res.json({ html });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get image
app.get('/api/stitch/image/:sessionId', async (req, res) => {
  try {
    const imageUrl = await getScreenImage(req.params.sessionId);
    res.json({ imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List screens in a project
app.get('/api/stitch/projects/:projectId/screens', async (req, res) => {
  try {
    const screens = await listScreens(req.params.projectId);
    res.json({ screens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Stitch API server running on http://localhost:${PORT}`);
});
