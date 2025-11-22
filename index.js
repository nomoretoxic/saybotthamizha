const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    PermissionsBitField 
} = require('discord.js');
require('dotenv').config();

// Create bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ------------------------------
// Slash Command Registration
// ------------------------------

const commands = [
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot says what you type (Admins & Owner only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Only admins see it
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message for the bot to send')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Slash commands registered!');
    } catch (error) {
        console.error(error);
    }
})();

// ------------------------------
// Bot Events
// ------------------------------

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'say') {
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        // Permission check
        if (!isOwner && !isAdmin) {
            return interaction.reply({
                content: "❌ Only **Admins** or **Server Owner** may use this command.",
                ephemeral: true
            });
        }

        const text = interaction.options.getString('message');
        await interaction.reply({ content: text });
    }
});

// ------------------------------

client.login(process.env.TOKEN);
