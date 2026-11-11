const { SlashCommandBuilder } = require("discord.js");
const TeamClear = require("../../utils/pokemon/handlers/clear");
const TeamSet = require("../../utils/pokemon/handlers/set");
const TeamView = require("../../utils/pokemon/handlers/view");
const ordinals = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto", "Sexto"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("team")
        .setDescription("Gestiona tu equipo Pokémon")

        .addSubcommand(sub =>
            sub
                .setName("clear")
                .setDescription("Elimina tu equipo")
        )

        .addSubcommand(sub => {
            sub
                .setName("set")
                .setDescription("Configura tu equipo Pokémon");

            for (let i = 1; i <= 6; i++) {
                sub.addStringOption(option =>
                    option
                        .setName(`pokemon${i}`)
                        .setDescription(`${ordinals[i - 1]} Pokémon`)
                        .setAutocomplete(true)
                );
            }
            return sub;
        })

        .addSubcommand(sub =>
            sub
                .setName("view")
                .setDescription("Muestra tu equipo")
        ),

    async autocomplete(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "set") { return TeamSet.autocomplete(interaction); }

        return interaction.respond([]); 
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "clear") return TeamClear.execute(interaction);
        if (subcommand === "set") return TeamSet.execute(interaction);
        if (subcommand === "view") return TeamView.execute(interaction);

        return interaction.reply({ content: "Subcomando no reconocido.", ephemeral: true });
    }
};