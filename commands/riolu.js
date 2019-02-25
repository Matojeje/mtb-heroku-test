const { Attachment } = require("discord.js"); // You could also do: const Attachment = require('discord.js').Attachment;

const Scraper = require("images-scraper");
const bing = new Scraper.Bing();

module.exports = {
	name: "riolu",
	errorVerb: "look up Riolu pics",
	missingArgsVerb: "Riolu",

	aliases: ["rpics", "rii", "riolupics"],
	args: false,
	cooldown: 10,
	guildOnly: false,
	shortDesc: "Fetches and sends a Riolu picture",
	description:
		"This command will look up a random Riolu picture from Bing. This might take a while.",
	usage: "",

	// This function is used to get a random image from Bing and then send it to Discord
	async execute(message) {
		const results = await bing.list({ keyword: "riolu", detail: true }); // Indexing Bing
		const reply = !results.length
			? "No results"
			: new Attachment(results[Math.floor(Math.random() * results.length)].url); // Randomize output
		message.channel.send(reply);
	},
};
