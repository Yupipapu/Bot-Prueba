module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    // --- User Select Menu ---
    if (interaction.isUserSelectMenu()) {
      const [_, type] = interaction.customId.split("_user_");

      if (!["avatar", "banner", "info"].includes(type)) return;

      const member = await interaction.guild.members.fetch(
        interaction.values[0],
      );
      await runUserSubCommand(type, interaction, member, true, true);
      return;
    }

    // --- Autocomplete ---
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(err);
      }

      return;
    }

    // --- Slash Commands ---
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);

      const reply = {
        content: "❌ Hubo un error ejecutando este comando.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });


  async function runUserSubCommand(
    type,
    interaction,
    member,
    isUpdate = false,
    keepMenu = true,
  ) {
    let commandModule;

    switch (type) {
      case "avatar":
        commandModule = require("../utils/user/avatar");
        break;
      case "banner":
        commandModule = require("../utils/user/banner");
        break;
      case "info":
        commandModule = require("../utils/user/info");
        break;
      default:
        return;
    }

    await commandModule.execute(interaction, member, isUpdate, keepMenu);
  }
};