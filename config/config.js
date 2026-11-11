require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    guildId: process.env.GUILD_ID,
    IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID,
    EMBED_COLOR: process.env.EMBED_COLOR,
    redirectUri: process.env.REDIRECT_URI
};