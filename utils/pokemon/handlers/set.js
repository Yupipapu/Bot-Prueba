const { EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../../config/config");
const repository = require("../teamRepository");
const pokedex = require("../pokedex");
const widget = require("../../widget/widget");

module.exports = {
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const results = pokedex.search(focused);

        await interaction.respond(
            results.map(pokemon => ({
                name: pokemon.name,
                value: String(pokemon.id)
            }))
        );
    },

    async execute(interaction) {
        await interaction.deferReply();

        let team = repository.get(interaction.user.id);

        if (!team) {
            team = {
                pokemon1: null, pokemon2: null, pokemon3: null,
                pokemon4: null, pokemon5: null, pokemon6: null
            };
        }

        for (let i = 1; i <= 6; i++) {
            const value = interaction.options.getString(`pokemon${i}`);

            if (value !== null) {
                team[`pokemon${i}`] = Number(value);
            }
        }

        repository.save(interaction.user.id, team);

        let widgetAuthorized = true;

        try {
            await widget.sync(interaction.user.id);
        } catch (err) {
            console.error(err);

            if (err.status === 404) {
                widgetAuthorized = false;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🎒 Equipo Pokémon actualizado")
            .setDescription(repository.format(team))
            .setColor(interaction.member?.roles?.highest?.color || EMBED_COLOR)
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        if (widgetAuthorized) {
            return interaction.editReply({
                embeds: [embed]
            });
        }

        return interaction.editReply({
            content:
                "⚠️ **Tu equipo fue guardado correctamente.**\n\n" +
                "Sin embargo, todavía no has autorizado el Widget de Discord.\n\n" +
                "Ejecuta el comando **`/widget`** y pulsa **Authorize Widget**.\n" +
                "Solo tendrás que hacerlo una vez.",
            embeds: [embed]
        });
    }
};