import Discord from "discord.js";
import Pokedex from "pokedex-promise-v2";
const P = new Pokedex();

export default {
	name: "berry",
	errorVerb: "taste your berry",
	missingArgsVerb: "berry",
	cooldown: 10,
	guildOnly: false,
	args: false,
	description:
		"Gets information about a random/specific pokémon berry or a list of them (using Pokéapi).",
	shortDesc: "Look up berry info",
	usage: "(**list**/[*berry name*])",

	execute({ channel }, args) {
		P.getBerriesList()
			.then(({ results, count }) => {
				if (args[0] && args[0].toLowerCase() === "list") {
					channel.send("**Current list of berries**:");
					berries = [];
					results.forEach(({ name }) => {
						berries.push(name);
					});
					channel.send(berries.join(", "));
				} else {
					berryName = args[0]
						? args[0].toLowerCase().match(/^[a-z]+/gm)[0]
						: results[getRandomInt(1, count)].name;

					console.log(`berry name:${berryName}`);

					P.getItemByName(`${berryName}-berry`)
						.then(berryItem => {
							P.getBerryByName(berryName)
								.then(berry => {
									const capitalizedBerryName = capitalizeFirstLetter(
										berryName,
									);
									console.log(
										`berry: ${capitalizedBerryName}`,
									);

									const flavorTexts =
										berryItem.flavor_text_entries;
									for (const x in flavorTexts) {
										if (
											flavorTexts[x].language.name ===
												"en" &&
											flavorTexts[x].version_group.name ==
												"ultra-sun-ultra-moon"
										) {
											infoText = flavorTexts[x].text;
											break;
										}
									}

									const names = berryItem.names;
									for (const x in names) {
										if (names[x].language.name === "en") {
											berryName = names[x].name;
											break;
										}
									}

									const flavors = berry.flavors;
									berryFlavor = "";
									numberOfFlavors = 0;
									for (const x in flavors) {
										// console.log(flavors[x].flavor.name + ": " + flavors[x].potency)
										if (flavors[x].potency > 0) {
											numberOfFlavors++;
											if (numberOfFlavors > 1) {
												berryFlavor += ", ";
											}
											if (flavors[x].potency > 10) {
												berryFlavor += "very ";
											}
											berryFlavor +=
												flavors[x].flavor.name;
										}
									}

									berrySizeMetric =
										berry.size >= 100
											? `${berry.size / 10} cm`
											: (berrySizeMetric = `${berry.size} mm`);

									const image = new Discord.MessageAttachment(
										berryItem.sprites.default,
										"image.png",
									);
									const sprite = new Discord.MessageAttachment(
										berryItem.sprites.default,
										`${capitalizedBerryName} berry.png`,
									);

									const mmToInch = 25.4 ** -1;

									const moveInfo = buildBerryEmbed(
										capitalizedBerryName,
										berryItem,
										berry,
										mmToInch,
									);

									const badge = new Discord.MessageAttachment(
										"resources/badgeMoveInfo.png",
										"badge.png",
									);
									const icon = new Discord.MessageAttachment(
										"resources/iconMatoBot.png",
										"icon.png",
									);

									channel.send({
										embed: moveInfo,
										files: [sprite, badge, image, icon],
									});
								})
								.catch(error => errorPokeAPI(error));
						})
						.catch(error => errorPokeAPI(error));
				}
			})
			.catch(error => errorPokeAPI(error));
	},
};

function buildBerryEmbed(
	capitalizedBerryName,
	{ effect_entries },
	berry,
	mmToInch,
) {
	return (
		new Discord.MessageEmbed()
			.setColor("#2990bb")
			.setTitle(`**${capitalizedBerryName} Berry**`)
			.setAuthor("Berry info", "attachment://badge.png", "")
			.setImage("attachment://image.png")
			.setURL(
				`https://bulbapedia.bulbagarden.net/wiki/${capitalizedBerryName}_Berry`,
			)
			.setDescription(
				effect_entries[0].effect
					.replace(/\n: /gm, ": ")
					.replace(/^.*:/gm, "**$&**"),
			)
			.addField(
				"Flavor",
				capitalizeFirstLetter(berryFlavor) || "???",
				true,
			)
			.addField(
				"Firmness",
				capitalizeFirstLetter(berry.firmness.name.replace(/-/g, " ")) ||
					"???",
				true,
			)
			.addField("Smoothness", `${berry.smoothness}% water` || "???", true)
			.addField(
				"Growth time",
				`${berry.growth_time} hours per stage` || "???",
				true,
			)
			// .addField("Growth stage", berry.growth_time + " hours" || "???", true)
			.addField(
				"Harvest",
				`Up to ${berry.max_harvest} on one tree` || "???",
				true,
			)
			.addField(
				"Size",
				`${berrySizeMetric} / ${parseFloat(
					(berry.size * mmToInch).toFixed(2),
				)}″` || "???",
				true,
			)
			// .addField("Cost", berryItem.cost + " Poké" || "???", true)
			/* .addField("Natural gift",
        capitalizeFirstLetter(berry.natural_gift_type.name) +
        " (power: " + berry.natural_gift_power + ")"
        || "??? ", true
    ) */
			.setTimestamp()
			.setFooter("Mato bot using PokéAPI", "attachment://icon.png")
	);
}

// https://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function errorPokeAPI(error) {
	console.log(`Pokédex API error:\n\n${error}`);
	message.channel.send(`**PokéAPI error**:\n${error}`);
}