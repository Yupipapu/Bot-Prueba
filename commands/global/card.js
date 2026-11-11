const { SlashCommandBuilder } = require('discord.js');
const CardArchetype = require('../../utils/YG/card/archetype');
const CardArt = require('../../utils/YG/card/art');
const CardInfo = require('../../utils/YG/card/info');
const CardRandom = require('../../utils/YG/card/random');

const subcommandsConfig = [
  { name: 'archetype', description: 'Muestra cartas de un arquetipo', inputDesc: 'Nombre del arquetipo' },
  { name: 'art', description: 'Muestra los diferentes artes de una carta', inputDesc: 'Nombre o ID de la carta' },
  { name: 'info', description: 'Muestra información de una carta de Yu-Gi-Oh!', inputDesc: 'Nombre o ID de la carta' },
  { name: 'random', description: 'Muestra una carta aleatoria' }
];

const commandBuilder = new SlashCommandBuilder()
  .setName('card')
  .setDescription('Comandos relacionados a cartas de Yu-Gi-Oh!');

for (const sub of subcommandsConfig) {
  commandBuilder.addSubcommand(subcommand => {
    subcommand
      .setName(sub.name)
      .setDescription(sub.description);

    if (sub.inputDesc) {
      subcommand.addStringOption(option =>
        option
          .setName('input')
          .setDescription(sub.inputDesc)
          .setRequired(true)
      );
    }

    return subcommand;
  });
}

const handlers = {
  archetype: CardArchetype,
  art: CardArt,
  info: CardInfo,
  random: CardRandom
};

module.exports = {
  data: commandBuilder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const handler = handlers[subcommand];

    if (handler) {
      return handler.execute(interaction);
    }

    return interaction.reply({ content: 'Subcomando no reconocido.', ephemeral: true });
  }
};