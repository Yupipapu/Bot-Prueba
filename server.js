const express = require('express');
const config = require('./config/config'); // Ajusta la ruta según la ubicación de tu archivo de configuración

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// RUTA DE CALLBACK DE OAUTH2
// ==========================================
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('❌ Error: No se proporcionó ningún código de autorización.');
    }

    try {
        const params = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.redirectUri,
        });

        // 1. Intercambiar el código por el token de acceso del usuario
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(tokenData.error_description || 'Error al obtener el token de acceso de Discord.');
        }

        const accessToken = tokenData.access_token;

        // 2. Obtener la información del usuario autenticado en Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const discordUser = await userResponse.json();
        const discordId = discordUser.id;

        // 3. Registrar/Crear el perfil de identidad inicial en Discord (Evita el error 404)
        const linkResponse = await fetch(
            `https://discord.com/api/v9/applications/${config.clientId}/users/${discordId}/identities/pokemon/${discordId}/profile`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${config.token}`,
                    "Content-Type": "application/json",
                    "User-Agent": "DiscordBot"
                },
                body: JSON.stringify({
                    username: `Trainer ${discordId}`,
                    data: { dynamic: [] }
                })
            }
        );

        if (!linkResponse.ok) {
            const errText = await linkResponse.text();
            console.error("⚠️ Advertencia al registrar identidad inicial:", errText);
        }

        console.log(`✅ ¡Usuario autenticado y perfil de identidad creado con éxito! ID de Discord: ${discordId}`);

        // Respuesta visual para el navegador
        res.send(`<h1>¡Autenticación exitosa!</h1><p>Bienvenido, ${discordUser.username}. Ya puedes cerrar esta pestaña y volver a Discord.</p>`);

    } catch (error) {
        console.error('❌ Error crítico en el callback de OAuth2:', error);
        res.status(500).send('Ocurrió un error al procesar la autenticación con Discord.');
    }
});

// ==========================================
// INICIAR EL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});