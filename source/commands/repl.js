"use strict";

import { evalLisp, loadFile } from "utils/lisp.js";

export default {
    name: "repl",
    errorVerb: "run a lisp command",
    missingArgsVerb: "lisping",
    aliases: ["lisp"],
    args: true,
    cooldown: 0,
    guildOnly: false,
    description: "Runs a lisp command",
    shortDesc: "Runs a command of a lisp-like language in a repl",

    execute({ channel }, args) {
        loadFile("resources/standard-library.fakelisp");
        const output = evalLisp(args.join(" "));

        channel.send("```" + output + "```");
    },
};

