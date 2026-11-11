const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const config = require("./config/config");
const loadCommands = require("./events/loadCommands");
const interactionCreate = require("./events/interactionCreate");
const pokedex = require("./utils/pokemon/pokedex");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { guildCommands } = loadCommands(client);
const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("📖 Cargando Pokédex...");
    await pokedex.load();

    console.log("🔁 Registrando comandos...");

    if (guildCommands.length > 0) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        {
          body: guildCommands,
        },
      );

      console.log("✅ Comandos de servidor registrados");
    }

    interactionCreate(client);

    client.once("ready", () => {
      console.log(`🤖 Bot listo como ${client.user.tag}`);
    });

    await client.login(config.token);
  } catch (error) {
    console.error(error);
  }
})();