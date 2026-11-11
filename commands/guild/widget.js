const { SlashCommandBuilder } = require("discord.js");
const SetupCommand = require("../../utils/widget/setup");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("widget")
        .setDescription("Configuración del Widget")

        .addSubcommand(sub =>
            sub
                .setName("setup")
                .setDescription("Autoriza el Widget de Discord")
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "setup") {
            return SetupCommand.execute(interaction);
        }

        return interaction.reply({
            content: "Subcomando no reconocido.",
            ephemeral: true
        });
    }
};