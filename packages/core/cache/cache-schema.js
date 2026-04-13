// MIT License — Flora Chatbot Template
'use strict';

const CACHE_TTL_DAYS = parseInt(process.env.FLORA_CACHE_TTL_DAYS || '30', 10);

function createPlantEntry(data) {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + CACHE_TTL_DAYS);

  return {
    id: data.id || slugify(data.name?.common || ''),
    shopify_id: data.shopify_id || null,
    name: {
      common: data.name?.common || '',
      scientific: data.name?.scientific || '',
      aliases: data.name?.aliases || [],
    },
    care: {
      light: data.care?.light || {},
      watering: data.care?.watering || {},
      temperature: data.care?.temperature || {},
      difficulty: data.care?.difficulty || {},
      toxicity: data.care?.toxicity || {},
      hardiness_zone: data.care?.hardiness_zone || {},
    },
    problems: data.problems || {},
    source: data.source || 'manual',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
}

function isExpired(entry) {
  if (!entry?.expires_at) return true;
  return new Date(entry.expires_at) < new Date();
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

module.exports = { createPlantEntry, isExpired, slugify, CACHE_TTL_DAYS };
