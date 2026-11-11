const https = require('https');
const axios = require('axios');

const processDeckFile = (lines) => {
  const main = [];
  const extra = [];
  const side = [];
  let section = 'main';

  lines.forEach(line => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      if (trimmed.toLowerCase() === '#extra') section = 'extra';
      else if (trimmed.toLowerCase() === '!side') section = 'side';
      else if (trimmed.toLowerCase() === '#main') section = 'main';
      return;
    }

    const id = parseInt(trimmed);
    if (!isNaN(id)) {
      if (section === 'main') main.push(id);
      else if (section === 'extra') extra.push(id);
      else if (section === 'side') side.push(id);
    }
  });

  return { main, extra, side };
};

/**
 * Descarga un archivo .ydk desde una URL
 */
const fetchYDK = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
};

const getCardNames = async (ids) => {
  const batchSize = 50;
  const nameMap = {};
  const batches = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize));
  }

  try {
    const results = await Promise.all(
      batches.map(batch =>
        axios.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`)
      )
    );

    results.forEach(res => {
      res.data.data.forEach(card => {
        nameMap[card.id] = card.name;
      });
    });
  } catch (e) {
    console.error('Error al obtener nombres:', e);
  }

  return nameMap;
};

const getCardInfoMap = async (ids) => {
  const uniqueIDs = [...new Set(ids.map(Number))];
  const infoMap = {};
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < uniqueIDs.length; i += batchSize) {
    batches.push(uniqueIDs.slice(i, i + batchSize));
  }

  try {
    const results = await Promise.all(
      batches.map(batch =>
        axios.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${batch.join(',')}`)
      )
    );

    results.forEach(res => {
      res.data.data.forEach(card => {
        infoMap[card.id] = {
          name: card.name,
          image: `https://yugi.wiki/assets/card-images/common/${card.id}.jpg`
        };
      });
    });
  } catch (e) {
    console.error('Error al obtener info de cartas:', e);
  }

  return infoMap;
};

const getCardInfoMapImg = async (ids) => {
  const uniqueIDs = [...new Set(ids.map(Number))];
  const infoMap = {};

  uniqueIDs.forEach(id => {
    infoMap[id] = {
      image: `https://yugi.wiki/assets/card-images/common/${id}.jpg`
    };
  });

  return infoMap;
};

const formatDeckSection = (ids, nameMap) => {
  const seen = new Map();

  for (const id of ids) {
    const name = nameMap[id] || `Carta ${id}`;
    seen.set(name, (seen.get(name) || 0) + 1);
  }

  return Array.from(seen.entries())
    .map(([name, count]) => `${name} **x${count}**`)
    .join('\n');
};

module.exports = {
  processDeckFile,
  fetchYDK,
  getCardNames,
  getCardInfoMapImg,
  getCardInfoMap,
  formatDeckSection
};