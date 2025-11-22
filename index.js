const express = require("express");
const { 
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionsBitField
} = require("discord.js");
require("dotenv").config();

// -----------------------------------
//  WEB SERVER (needed for uptime ping)
// -----------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// -----------------------------------
//  DISCORD BOT
// -----------------------------------
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Slash command definition
const commands = [
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot says what you type (Admins & Owner only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message for the bot to send')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// Register slash commands (GUILD ONLY)
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering guild slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID // ← Only this server gets commands
            ),
            { body: commands }
        );
        console.log('Guild slash commands registered!');
    } catch (err) {
        console.error(err);
    }
})();

// Bot ready event
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Command handling
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ❌ BLOCK DM USAGE
    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ This command cannot be used in DMs.",
            ephemeral: true
        });
    }

    // ❌ BLOCK OTHER SERVERS
    if (interaction.guild.id !== process.env.GUILD_ID) {
        return interaction.reply({
            content: "❌ This command is not available in this server.",
            ephemeral: true
        });
    }

    if (interaction.commandName === 'say') {
        const isOwner = interaction.guild.ownerId === interaction.user.id;
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isOwner && !isAdmin) {
            return interaction.reply({
                content: "❌ Only **Admins** or the **Server Owner** can use this command.",
                ephemeral: true
            });
        }

        const text = interaction.options.getString('message');
        await interaction.reply({ content: text });
    }
});

// Start Discord bot
client.login(process.env.TOKEN);




