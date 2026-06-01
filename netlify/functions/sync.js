const { getStore } = require('@netlify/blobs');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  const store = getStore({ name: 'schedule', consistency: 'strong' });

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get('shared', { type: 'json' });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify(data || { sched: { ruben: {}, yuval: {} }, prog: { ruben: {}, yuval: {} }, updatedAt: 0 })
      };
    } catch (err) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify({ sched: { ruben: {}, yuval: {} }, prog: { ruben: {}, yuval: {} }, updatedAt: 0 })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      if (!body.sched || !body.prog) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid data' }) };
      }
      body.updatedAt = Date.now();
      await store.setJSON('shared', body);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify({ ok: true, updatedAt: body.updatedAt })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify({ error: err.message })
      };
    }
  }

  return { statusCode: 405, headers: cors, body: 'Method not allowed' };
};
