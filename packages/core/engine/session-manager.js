// MIT License — Flora Chatbot Template
'use strict';

const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function createSession(sessionId, metadata = {}) {
  const session = {
    id: sessionId,
    messages: [],
    language: metadata.language || 'en',
    tenantId: metadata.tenantId || 'default',
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

function addMessage(sessionId, role, content, metadata = {}) {
  let session = getSession(sessionId);
  if (!session) session = createSession(sessionId);
  session.messages.push({ role, content, timestamp: new Date().toISOString(), metadata });
  session.lastActivity = Date.now();
  return session;
}

function getHistory(sessionId, limit = 10) {
  const session = getSession(sessionId);
  if (!session) return [];
  return session.messages.slice(-limit);
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = { getSession, createSession, addMessage, getHistory, clearSession };
