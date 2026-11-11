const { SlashCommandBuilder } = require('discord.js');
const { setLang } = require('../../database/guildLang');

const languages = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  jp: '日本語',
  pt: 'Português'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Set the bot language for this server')
    .addStringOption(option =>
      option
        .setName('lang')
        .setDescription('Choose a language')
        .setRequired(true)
        .addChoices(
          ...Object.entries(languages).map(([value, name]) => ({ name, value }))
        )
    ),

  async execute(interaction) {
    const selected = interaction.options.getString('lang');

    // Guardar idioma en DB
    await setLang(interaction.guild.id, selected);

    // Obtener el nombre legible
    const langName = languages[selected] || selected;

    return interaction.reply({
      content: `✅ Server language set to **${langName}**`,
      ephemeral: true
    });
  }
};