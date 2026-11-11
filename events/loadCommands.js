const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadCommands(client) {
    client.commands = new Collection();

    const guildCommands = [];
    const globalCommands = [];
    const basePath = path.join(__dirname, '../commands');


    const globalPath = path.join(basePath, 'global');
    if (fs.existsSync(globalPath)) {
        const globalFiles = fs.readdirSync(globalPath).filter(file => file.endsWith('.js'));
        for (const file of globalFiles) {
            const filePath = path.join(globalPath, file);
            const command = require(filePath);

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                globalCommands.push(command.data.toJSON());
                console.log(`🌍 Global cargado: /${command.data.name}`);
            } else {
                console.warn(`⚠️ Comando ignorado (faltan props): ${file}`);
            }
        }
    }

    const guildPath = path.join(basePath, 'guild');
    if (fs.existsSync(guildPath)) {
        const guildFiles = fs.readdirSync(guildPath).filter(file => file.endsWith('.js'));
        for (const file of guildFiles) {
            const filePath = path.join(guildPath, file);
            const command = require(filePath);

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                guildCommands.push(command.data.toJSON());
                console.log(`🏠 Guild cargado: /${command.data.name}`);
            } else {
                console.warn(`⚠️ Comando ignorado (faltan props): ${file}`);
            }
        }
    }
    return { guildCommands, globalCommands };
}
module.exports = loadCommands;