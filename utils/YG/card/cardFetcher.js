const axios = require("axios");

const normalizeName = (name) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const cardFetcher = async (input) => {
  try {
    const value = String(input).trim();

    const url = /^\d+$/.test(value)
      ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${value}`
      : `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(
          normalizeName(value)
        )}`;

    const { data } = await axios.get(url);

    return data?.data?.[0] ?? null;
  } catch (err) {
    console.error("Error al buscar carta:", err.message);
    return null;
  }
};

module.exports = {
  normalizeName,
  cardFetcher,
};