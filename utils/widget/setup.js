const { ActionRowBuilder,  ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { EMBED_COLOR } = require("../../config/config");

module.exports = {

    async execute(interaction) {

        const authorizeButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Authorize Widget")
            .setURL(
                `https://discord.com/oauth2/authorize?client_id=786319798270427238&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=sdk.social_layer+sdk.social_layer_presence+applications.commands.permissions.update`
            );

        const row = new ActionRowBuilder()
            .addComponents(authorizeButton);

        const embed = new EmbedBuilder()
            .setTitle("🧩 Discord Widget")
            .setColor(EMBED_COLOR)
            .setDescription(
                [
                    "Para que el bot pueda actualizar automáticamente tu Widget de Discord, primero debes autorizar la aplicación.",
                    "",
                    "**Solo necesitas hacerlo una vez.**",
                    "",
                    "**Pasos:**",
                    "1️⃣ Haz clic en **Authorize Widget**.",
                    "2️⃣ Inicia sesión en Discord si es necesario.",
                    "3️⃣ Acepta los permisos solicitados.",
                    "4️⃣ Cierra la pestaña del navegador.",
                    "5️⃣ ¡Listo! A partir de ahora, cada vez que uses `/team set`, tu Widget se actualizará automáticamente."
                ].join("\n")
            )
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};