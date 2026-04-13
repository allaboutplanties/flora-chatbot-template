// MIT License — Flora Chatbot Template
'use strict';

const { createPlantEntry, isExpired, slugify } = require('./cache-schema');

// In-memory store (n8n workflows use n8n's built-in DB via Static Data or a DB node)
// This module is used when running outside of n8n (e.g., local dev, tests)
const store = new Map();

function get(nameOrId) {
  const key = slugify(nameOrId);

  // Try exact key
  if (store.has(key)) {
    const entry = store.get(key);
    if (isExpired(entry)) {
      store.delete(key);
      return { found: false, reason: 'expired', suggestion: 'enrichment_agent' };
    }
    return { found: true, data: entry, age_days: _ageDays(entry), source: entry.source };
  }

  // Try aliases
  for (const [, entry] of store) {
    const aliases = (entry.name?.aliases || []).map(a => slugify(a));
    if (aliases.includes(key) || slugify(entry.name?.common || '') === key) {
      if (isExpired(entry)) {
        store.delete(entry.id);
        return { found: false, reason: 'expired', suggestion: 'enrichment_agent' };
      }
      return { found: true, data: entry, age_days: _ageDays(entry), source: entry.source };
    }
  }

  return { found: false, reason: 'not_in_cache', suggestion: 'enrichment_agent' };
}

function set(data) {
  const entry = createPlantEntry(data);
  store.set(entry.id, entry);
  return entry;
}

function update(id, patch) {
  const key = slugify(id);
  if (!store.has(key)) return null;
  const existing = store.get(key);
  const updated = { ...existing, ...patch, updated_at: new Date().toISOString() };
  store.set(key, updated);
  return updated;
}

function remove(id) {
  store.delete(slugify(id));
}

function list({ source, expired } = {}) {
  const result = [];
  for (const [, entry] of store) {
    if (source && entry.source !== source) continue;
    if (expired !== undefined && isExpired(entry) !== expired) continue;
    result.push(entry);
  }
  return result;
}

function size() {
  return store.size;
}

function _ageDays(entry) {
  const created = new Date(entry.created_at);
  return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
}

module.exports = { get, set, update, remove, list, size };
