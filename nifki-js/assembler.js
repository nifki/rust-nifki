"use strict";

/**
 * An "instruction" is a Javascript function that takes an interpreter state,
 * mutates it in place, and returns nothing. It also has public fields:
 *   - pops - the number of stack items consumed.
 *   - pushes - the number of stack items created.
 */

var assemble = function() {
    function decodeString(source) {
        // FIXME
        return source;
    }

    var STOP_WORDS = {
        "THEN": null,
        "WHILE": null,
        "NEXT": null,
        "ELSE": null
    };

    function assemble(source) {
        console.log("assemble()");

        var lineNum = 1;

        function syntaxException(message) {
            return "SyntaxException: " + message + " at line " + lineNum;
        }

        /** Matches and classifies a single instruction (or newline or
         * comment). Everything except whitespace will be matched.
         * Note: Javascript RegExps have state; we need a fresh one.
         */
        var wordRegExp = new RegExp(
            "(\\n|#[^\\n]*\\n?)" + "|" +
            "\"([^\"]*)(\"?)" + "|" +
            "([0-9][^\\t\\n\\r ]*)" + "|" +
            (
                "([^\\(\\t\\n\\r ]+)" +
                "\\(" +
                "([^\\)\\t\\n\\r ]*)" +
                "\\)" +
                "(?![^\\t\\n\\r ])"
            ) + "|" +
            "[^\\t\\n\\r ]+",
            "g"
        );
        var wordMatch; // Next match object from `wordRegExp`.
        var word; // Equal to `wordMatch[0]`, except when null.

        /** Moves on to the next instruction.
         */
        function next() {
            while (true) {
                var m = wordRegExp.exec(source);
                if (m !== null) {
                    if (typeof m[1] !== "undefined") {
                        // Newline and/or comment.
                        lineNum++;
                        continue;
                    }
                    word = m[0];
                } else {
                    word = null;
                }
                wordMatch = m;
                return;
            }
        }

        next(); // Initialise `word` and `wordMatch()`.

        /** Checks that the next word matches 'expected' and calls 'next()'.
         * @throws SyntaxException if the word does not match.
         */
        function expect(expected) {
            if (word !== expected) {
                throw syntaxException("Expected "+expected);
            }
            next();
        }

        var globalMappings = {};
        var globalValues = [];

        function getGlobalIndex(name) {
            if (!(name in globalMappings)) {
                globalMappings[name] = globalValues.length;
                globalValues.push(null);
            }
            return globalMappings[name];
        }

        var instructions = [];
        var instructionsFilled = 0;

        /** Appends a placeholder to `instructions` and returns a
         * function that replaces it with the passed instruction.
         */
        function allocate() {
            var slotIndex = instructions.length;
            instructions.push(null);
            return function(instruction) {
                if (instructions[slotIndex] !== null) {
                    throw syntaxException(
                        "This slot has already been filled");
                }
                instructions[slotIndex] = instruction;
                instructionsFilled++;
            };
        }

        /** Fills in the next instruction.
         * Equivalent to 'allocate()(instruction)'.
         */
        function append(instruction) {
            allocate()(instruction);
        }

        function parseFunctionBody(funcEntrySP, funcExitSP, originalName) {
            console.log("parseFunctionBody(" + originalName + ")");

            var localMappings = {};
            var numLocals = 0;

            function getLocalIndex(name) {
                if (!(name in localMappings)) {
                    localMappings[name] = numLocals;
                    numLocals++;
                }
                return localMappings[name];
            }

            function parseBlock(entrySP, exitSP, numLoops) {
                var sp = entrySP;
                function appendAndUpdateSP(instruction) {
                    sp -= instruction.pops;
                    if (sp < 0) {
                        throw syntaxException("Stack underflow");
                    }
                    sp += instruction.pushes;
                    append(instruction);
                }
                while (
                    word !== null &&
                    !(word in STOP_WORDS) &&
                    wordMatch[5] !== "DEF"
                ) {
                    var instruction = null;
                    if (word === ";") {
                        if (sp !== 0) {
                            throw syntaxException(
                                "Stack should be empty before executing ;");
                        }
                    } else if (word === "BREAK") {
                        if (sp != 0) {
                            throw syntaxException(
                                "Stack should be empty before executing BREAK"
                            );
                        }
                        // Glob up as many "BREAK"s as possible.
                        var numBreaks = 0;
                        while (word === "BREAK") {
                            numBreaks++;
                            next();
                        }
                        if (numBreaks > numLoops) {
                            throw syntaxException(
                                numBreaks + " BREAK instructions, " +
                                "but only " + numLoops + " enclosing loops");
                        }
                        append(BREAK(numBreaks));
                        return;
                    } else if (word === "ERROR") {
                        if (sp != 1) {
                            throw syntaxException(
                                "Stack should contain 1 item (the result) " +
                                "before executing ERROR");
                        }
                        // FIXME:
                        // this.append(ERROR);
                        // this.next();
                        // return;
                        throw "ERROR instruction not yet implemented";
                        // It wasn't implemented in the Java either.
                    } else if (word === "FOR") {
                        if (sp != 1) {
                            throw syntaxException(
                                "Stack should contain 1 item " +
                                "(the table or string) before executing FOR");
                        }
                        sp--;
                        next();
                        var slot = allocate();
                        var loopPC = instructions.length;
                        // Parse the loop body.
                        parseBlock(2, 0, numLoops + 1);
                        expect("NEXT");
                        append(OPS.NEXT);
                        var elsePC = instructions.length;
                        // Parse the "ELSE" block.
                        parseBlock(0, 0, numLoops);
                        expect("ELSE");
                        var breakPC = instructions.length;
                        slot(FOR(loopPC, elsePC, breakPC));
                    } else if (word === "IF") {
                        if (sp != 1) {
                            throw syntaxException(
                                "Stack should contain 1 item " +
                                "(the condition) before executing IF"
                            );
                        }
                        var ifSlot = allocate();
                        next();
                        sp--;
                        // Parse the "THEN" block.
                        parseBlock(0, 0, numLoops);
                        expect("THEN");
                        var thenSlot = allocate();
                        var elsePC = instructions.length;
                        // Parse the "ELSE" block.
                        parseBlock(0, 0, numLoops);
                        expect("ELSE");
                        var endPC = instructions.length;
                        ifSlot(IF(elsePC));
                        thenSlot(GOTO(endPC));
                    } else if (word === "LOOP") {
                        if (sp != 0) {
                            throw syntaxException(
                                "Stack should be empty before executing LOOP"
                            );
                        }
                        next();
                        var slot = allocate();
                        var loopPC = instructions.length;
                        // Parse the condition.
                        parseBlock(0, 1, numLoops + 1);
                        sp++;
                        expect("WHILE");
                        appendAndUpdateSP(OPS.WHILE);
                        // Parse the loop body.
                        parseBlock(0, 0, numLoops + 1);
                        expect("NEXT");
                        append(OPS.NEXT);
                        var elsePC = instructions.length;
                        // Parse the "ELSE" block.
                        parseBlock(0, 0, numLoops);
                        expect("ELSE");
                        var breakPC = instructions.length;
                        slot(LOOP(loopPC, elsePC, breakPC));
                    } else if (word === "RETURN") {
                        if (sp != 1) {
                            throw syntaxException(
                                "Stack should contain 1 item (the result) " +
                                "before executing RETURN");
                        }
                        append(OPS.RETURN);
                        next();
                        return;
                    } else if (typeof wordMatch[2] !== "undefined") {
                        // String literal.
                        if (wordMatch[3] === "") {
                            throw syntaxException(
                                "Unclosed string literal: " + wordMatch[0]);
                        }
                        appendAndUpdateSP(CONSTANT({
                            "type": "string",
                            "v": decodeString(wordMatch[2])
                        }));
                    } else if (typeof wordMatch[4] !== "undefined") {
                        // Number literal.
                        var value = +wordMatch[4];
                        if (value !== value) {
                            throw syntaxException("Not a number");
                        }
                        appendAndUpdateSP(CONSTANT({
                            "type": "number",
                            "v": value
                        }));
                    } else if (typeof wordMatch[5] !== "undefined") {
                        var op = wordMatch[5];
                        var name = wordMatch[6];
                        var index;
                        if (op === "LOAD") {
                            index = getGlobalIndex(name);
                            appendAndUpdateSP(LOAD(index, name));
                        } else if (op === "STORE") {
                            index = getGlobalIndex(name);
                            appendAndUpdateSP(STORE(index, name));
                        } else if (op === "LLOAD") {
                            index = getLocalIndex(name);
                            appendAndUpdateSP(LLOAD(index, name));
                        } else if (op === "LSTORE") {
                            index = getLocalIndex(name);
                            appendAndUpdateSP(LSTORE(index, name));
                        } else if (op === "SET") {
                            appendAndUpdateSP(SET(name));
                        } else {
                            throw syntaxException(
                                "Unknown instruction: " + word);
                        }
                    } else {
                        if (!(word in OPS)) {
                            throw syntaxException(
                                "Unknown instruction: " + word);
                        }
                        appendAndUpdateSP(OPS[word]);
                    }
                    next();
                }
                if (sp != exitSP) {
                    throw syntaxException(
                        "Stack contains " + sp +
                        " items; should be " + exitSP
                    );
                }
            }

            if (instructionsFilled !== instructions.length) {
                throw syntaxException(
                    "Used != Filled");
            }
            var startPC = instructions.length;
            parseBlock(funcEntrySP, funcExitSP, 0);
            if (instructionsFilled !== instructions.length) {
                throw syntaxException(
                    "Used != Filled");
            }
            var endPC = instructions.length;
            // Work out the stack requirements (`stackLen`).
            var stackLen = 0, sp = funcEntrySP;
            for (var i=startPC; i < endPC; i++) {
                sp -= instructions[i].pops;
                sp += instructions[i].pushes;
                if (sp > stackLen) stackLen = sp;
            }
            // TODO: Do we need `numLocals`/`stackLen`?
            return newFunction(startPC, stackLen, originalName);
        }

        // Parse the main program.
        var main = parseFunctionBody(0, 0, "<main>");
        append(OPS.END);
        // Parse the function definitions.
        while (word !== null) {
            if (wordMatch[5] !== "DEF") {
                throw syntaxException(
                    "Expected DEF(name)");
            }
            var name = wordMatch[6];
            next();
            var value = parseFunctionBody(1, -1, name);
            // Was `defineFunction()` in Java:
            var index = getGlobalIndex(name);
            globalValues[index] = value;
        }

        return { // TODO: Add more.
            "instructions": instructions,
            "globalMappings": globalMappings,
            "globalValues": globalValues,
            "main": main
        };
    }

    return assemble;
}();
