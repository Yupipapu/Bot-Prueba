const repository = require("../pokemon/teamRepository");
const pokedex = require("../pokemon/pokedex");
const config = require("../../config/config");

function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildPayload(userId) {
    const team = repository.get(userId);
    const dynamic = [];
    
    if (team) {
        for (let i = 1; i <= 4; i++) {
            const id = team[`pokemon${i}`];
            
            if (!id) continue;
            
            const pokemon = pokedex.getById(id);
            if (!pokemon) continue;

            dynamic.push({
                type: 1,
                name: `pokemon${i}_name`,
                value: capitalize(pokemon.name)
            });

            dynamic.push({
                type: 3,
                name: `pokemon${i}_image`,
                value: {
                    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
                }
            });
        }
    }

    return {
        username: `Trainer ${userId}`,
        provider_issued_user_id: String(userId),
        data: {
            dynamic
        }
    };
}

async function sync(userId) {
    const payload = buildPayload(userId);

    console.log("========== PAYLOAD ==========");
    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch(
        `https://discord.com/api/v9/applications/${config.clientId}/users/${userId}/identities/0/profile`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${config.token}`,
                "Content-Type": "application/json",
                "User-Agent": "DiscordBot"
            },
            body: JSON.stringify(payload)
        }
    );

    const text = await response.text();

    console.log("========== DISCORD ==========");
    console.log("Status:", response.status);
    console.log(text);
    console.log("=============================");

    if (!response.ok) {
        const error = new Error(`Discord API (${response.status}): ${text}`);
        error.status = response.status;
        error.body = text;
        throw error;
    }

    console.log("✅ Widget actualizado correctamente.");
}

module.exports = {
    buildPayload,
    sync
};