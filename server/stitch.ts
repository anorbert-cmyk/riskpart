import 'dotenv/config';
import { stitch, type Screen } from '@google/stitch-sdk';

// In-memory store for screen objects (they have methods we need to call later)
const screenStore = new Map<string, Screen>();
let sessionCounter = 0;

function nextSessionId(): string {
  return `s_${Date.now()}_${++sessionCounter}`;
}

export type DeviceType = 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC';
export type ModelId = 'GEMINI_3_PRO' | 'GEMINI_3_FLASH' | 'GEMINI_3_1_PRO';

type SdkModelId = 'GEMINI_3_PRO' | 'GEMINI_3_FLASH';

function resolveSdkModel(modelId?: ModelId): SdkModelId | undefined {
  if (!modelId) return undefined;
  if (modelId === 'GEMINI_3_1_PRO') return 'GEMINI_3_PRO';
  return modelId as SdkModelId;
}

export async function listProjects() {
  const projects = await stitch.projects();
  return projects.map((p) => ({ id: p.id, data: p.data }));
}

export async function createProject(title?: string) {
  const project = await stitch.createProject(title);
  return { id: project.id, data: project.data };
}

export async function generateScreen(
  projectId: string,
  prompt: string,
  deviceType?: DeviceType,
  modelId?: ModelId
) {
  const project = stitch.project(projectId);
  const screen = await project.generate(prompt, deviceType, resolveSdkModel(modelId));

  const sessionId = nextSessionId();
  screenStore.set(sessionId, screen);

  const [html, imageUrl] = await Promise.all([
    screen.getHtml(),
    screen.getImage(),
  ]);

  return { sessionId, screenId: screen.id, projectId: screen.projectId, html, imageUrl };
}

export async function editScreen(
  sessionId: string,
  prompt: string,
  deviceType?: DeviceType,
  modelId?: ModelId
) {
  const screen = screenStore.get(sessionId);
  if (!screen) throw new Error(`Session not found: ${sessionId}`);

  const edited = await screen.edit(prompt, deviceType, resolveSdkModel(modelId));

  // Replace old screen reference
  screenStore.set(sessionId, edited);

  const [html, imageUrl] = await Promise.all([
    edited.getHtml(),
    edited.getImage(),
  ]);

  return { sessionId, screenId: edited.id, html, imageUrl };
}

export async function getScreenHtml(sessionId: string) {
  const screen = screenStore.get(sessionId);
  if (!screen) throw new Error(`Session not found: ${sessionId}`);
  return screen.getHtml();
}

export async function getScreenImage(sessionId: string) {
  const screen = screenStore.get(sessionId);
  if (!screen) throw new Error(`Session not found: ${sessionId}`);
  return screen.getImage();
}

export async function listScreens(projectId: string) {
  const project = stitch.project(projectId);
  const screens = await project.screens();
  return screens.map((s) => ({ id: s.id, projectId: s.projectId, data: s.data }));
}
