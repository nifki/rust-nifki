var TEST_CODE = (
    '# A maze game.\n' +
    ' ## showDemos = FALSE\n' +
    ' ## #showDemos = TRUE\n' +
    ' ## mapOrder = "ABCDEFGHIJKLMN" # official\n' +
    ' ## #mapOrder = "INABCDEFGHJLM" # fiddling\n' +
    ' LOAD(Rocks_makeMaps) TABLE CALL LSTORE(maps) ;\n' +
    '# Plays the same level repeatedly until the player solves it.\n' +
    ' # Plays a single level, displays a success or failure screen, and returns TRUE\n' +
    ' # for success and FALSE for failure.\n' +
    ' # Move all the falling rocks.\n' +
    " # Returns 'TRUE' if the man dies, otherwise 'FALSE'.\n" +
    ' # Define some useful tests.\n' +
    ' # Runs a little celebration animation.\n' +
    ' LOAD(Rocks_makeMaps) TABLE CALL LSTORE(maps) ;\n' +
    'LOAD(Rocks_makeDemos) TABLE 0 LLOAD(maps) PUT CALL LSTORE(demos) ;\n' +
    'LOAD(Rocks_run) TABLE 0 LLOAD(maps) PUT 1 LLOAD(demos) PUT "showDemos" FALSE PUT CALL DROPTABLE ;\n' +
    'DEF(Rocks_isRight) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(pic) ;\n' +
    'LLOAD(pic) LOAD(Rocks_diamondPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_rockPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_rightPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'FALSE RETURN DEF(Rocks_makeMaps) LSTORE(ARGS) ;\n' +
    'TABLE LSTORE(maps) ;\n' +
    'LLOAD(maps) "A" TABLE 0 "<>###<>" PUT 1 "><+++><" PUT 2 "#+++++#" PUT 3 "#+++++#" PUT 4 "#+++++#" PUT 5 "<>+A+<>" PUT 6 "><###><" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "B" TABLE 0 "##########" PUT 1 "#AO  O  +#" PUT 2 "#### #> +#" PUT 3 "   #######" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "C" TABLE 0 "  ###  " PUT 1 "###+###" PUT 2 "#::O::#" PUT 3 "#:#+#:#" PUT 4 "#   A #" PUT 5 "#######" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "D" TABLE 0 "<>###<>" PUT 1 "><OOO><" PUT 2 "#O+++O#" PUT 3 "#O+A+O#" PUT 4 "#O+++O#" PUT 5 "<>+++<>" PUT 6 "><###><" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "E" TABLE 0 "#######" PUT 1 "#+#+#+#" PUT 2 "#AOOOO#" PUT 3 "#+++++#" PUT 4 "#######" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "F" TABLE 0 "#########" PUT 1 "#+::A::+#" PUT 2 "##:O#O:##" PUT 3 "#::<+O::#" PUT 4 "#:#::<#:#" PUT 5 "#:+#::::#" PUT 6 "#########" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "G" TABLE 0 "   #######" PUT 1 "   #   OA<" PUT 2 "   #::O+<" PUT 3 "#### O+<" PUT 4 "#   O+<" PUT 5 "#++++<" PUT 6 "####<" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "H" TABLE 0 "#######" PUT 1 "#+OOO+#" PUT 2 "##>O<##" PUT 3 "#O+++##" PUT 4 "#O#++ #" PUT 5 "#+# > #" PUT 6 "#  A  #" PUT 7 "#######" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "I" TABLE 0 "######" PUT 1 "#++++#" PUT 2 "#+OO+#" PUT 3 "#++++#" PUT 4 "#O+AO#" PUT 5 "#++++#" PUT 6 "#+OO+#" PUT 7 "#++++#" PUT 8 "######" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "J" TABLE 0 "##########" PUT 1 "#++OOO+++#" PUT 2 "#OO+OO+OO#" PUT 3 "#+O+++#++#" PUT 4 "#+A++O#++#" PUT 5 "#++O+++++#" PUT 6 "##########" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "K" TABLE 0 " ### " PUT 1 "##O##" PUT 2 "# A:#" PUT 3 "## ##" PUT 4 " #+# " PUT 5 " ### " PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "L" TABLE 0 "################" PUT 1 "#AOO: O:O :OO+O#" PUT 2 "#+:#<>+<>+<>+O+#" PUT 3 "#+#+OO>OO>OO>+O#" PUT 4 "#+#OO<O++#++#O+#" PUT 5 "#+#O< + +#++#+O#" PUT 6 "#+#O#:+:<:++#O+#" PUT 7 "#+#+ >:<>##:#+O#" PUT 8 "#+#:#   O O:#O+#" PUT 9 "#+#:#::O:<O>O+O#" PUT 10 "#+#:> O:<OOO>O+#" PUT 11 "#+#::>:<+:++#+O#" PUT 12 "#+>::::+#:++#O+#" PUT 13 "#+:>##:#O##:<+O#" PUT 14 "#::::::::::::::#" PUT 15 "################" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "M" TABLE 0 "##############" PUT 1 "#+O#OOOO+OOO+#" PUT 2 "##O#O>++:::+ #" PUT 3 "#AOOO## O  # #" PUT 4 "# #>O+O#O# # #" PUT 5 "#  O>++#+ #OO#" PUT 6 "#+ : ++ :#O++#" PUT 7 "#+>#### # O  #" PUT 8 "#+ O#+#   #  #" PUT 9 "#+ : O ## OOO#" PUT 10 "#+># #  O+::+#" PUT 11 "#+O#   OOOOOO#" PUT 12 "#+:#+++++++++#" PUT 13 "##+###########" PUT PUT LSTORE(maps) ;\n' +
    'LLOAD(maps) "N" TABLE 0 "#########" PUT 1 "#OO+++++#" PUT 2 "#OO+OOOO#" PUT 3 "#OOOOOOO#" PUT 4 "#OOOOOOO#" PUT 5 "#OOOOOOO#" PUT 6 "#OOOOOOO#" PUT 7 "#OOOOOOO#" PUT 8 "#OOOOOOO#" PUT 9 "#OOO+OOO#" PUT 10 "#OO+++OO#" PUT 11 "#OOA+++O#" PUT 12 "#O+  #+O#" PUT 13 "#O++   O#" PUT 14 "#O++:+OO#" PUT 15 "#O+#  +O#" PUT 16 "#O   ++O#" PUT 17 "#OO+:++O#" PUT 18 "#O+  #+O#" PUT 19 "#O++   O#" PUT 20 "#+++:+++#" PUT 21 "#       #" PUT 22 "#########" PUT PUT LSTORE(maps) ;\n' +
    '# Feel free to add new levels here.\n' +
    ' LLOAD(maps) RETURN DEF(Rocks_makeDemos) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(maps) ;\n' +
    'TABLE LSTORE(demos) ;\n' +
    '# Give each map an empty demo.\n' +
    ' LLOAD(maps) FOR DROP LSTORE(mapName) ;\n' +
    'LLOAD(demos) LLOAD(mapName) "" PUT LSTORE(demos) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    "# I'm afraid you have to insert waits for rockfalls manually at the moment.\n" +
    ' LLOAD(demos) "A" "URDDLLUUURRDRDDDDLDLLULUU" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "B" "RRRRRRRD" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "C" "RRRUULRDDLLLLUURRUDD" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "D" "DDRLLURRULLURR" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "E" "DUUDRDULRRDUUDRDULRRDUU" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "F" "RRRLDDRDDLLLUUDL-RURUULLLLRDDLDDR" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "G" "LDULLDRDLDLLLDLRRR" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "H" "RRUULULL-------RUURRLLLLRRDDDRLDDLLLU" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "I" "DLLRURRDLRDDLLL-UUUUUURRRDDLL" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "J" "RRDRRRRUUL--RUULLDRDDDLLUULL--UULLDDRLDDR" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "K" "RLDD" PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "L" "DRLDDDDDDDDDDDDRRRRRUURLDDRRRRRRRRLURULURULURULURULURULUR" "ULURDLLURLLLLDURLLLLDURLLLLLLDDDDDDDDDDDDRRRDRRRRRRRRRUULLR" + "RULLLLLLRRUUURUULLRUUR--LURDDDLRDDLLLDULLDRDLDUUUUUURLRRULL" + "DDDDDDDDLLULDUUUUUR-------------LUUUU" + PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "M" "DDRDRRRRRDDRRDDLRUUURLRURR-LURUUULLR-LDLLURRRRDDDLDLDLDLL" "UULULDRLUUDRDLRRRUR-LUUUURLLDRULLDRULLLDDLLLDDDDDRDRRDDDRUL" + "RRDLURRDLURRDLURRDLURRDRRLURULLLLLLULUDRDRRRRURUUUURUUUULLL" + "LLLLLDDLLLRUULRDDLDDDDDDDDDRD" + PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) "N" "DRDRDDLDLDDRDRDRRLUUDLDLLLLRURLURUULUDRDRRRULRULU" "URUDLDLLLURLURURRRLULLRULUUUU" + "UUUURRRR" + PUT LSTORE(demos) ;\n' +
    'LLOAD(demos) RETURN DEF(Rocks_moveRocks) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(manX) ;\n' +
    'LLOAD(ARGS) 1 GET LSTORE(manY) ;\n' +
    'LLOAD(ARGS) 2 GET LSTORE(dx) ;\n' +
    'LLOAD(ARGS) 3 GET LSTORE(dy) ;\n' +
    'LLOAD(ARGS) 4 GET LSTORE(bgSprites) ;\n' +
    '# This array of flags is used to ensure rocks only move once each frame.\n' +
    ' TABLE LSTORE(isMoving) ;\n' +
    'LLOAD(bgSprites) 0.0 GET FOR DROP LSTORE(x) ;\n' +
    'LLOAD(isMoving) LLOAD(x) FALSE PUT LSTORE(isMoving) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    '# Scan for rocks.\n' +
    ' LLOAD(bgSprites) FOR LSTORE(row) LSTORE(y) ;\n' +
    'LLOAD(row) FOR LSTORE(rockSprite) LSTORE(x) ;\n' +
    'LLOAD(rockSprite) "Picture" GET LOAD(Rocks_rockPNG) == IF ;\n' +
    'LLOAD(isMoving) LLOAD(x) GET IF ;\n' +
    'LLOAD(isMoving) LLOAD(x) FALSE PUT LSTORE(isMoving) ;\n' +
    'THEN ;\n' +
    'LLOAD(bgSprites) LLOAD(y) 1.0 + GET LSTORE(rowBelow) ;\n' +
    'LLOAD(rowBelow) LLOAD(x) GET LSTORE(belowSprite) ;\n' +
    'TABLE LSTORE(dests) ;\n' +
    'LLOAD(dests) LLOAD(x) TRUE PUT LSTORE(dests) ;\n' +
    'LLOAD(belowSprite) "Picture" GET LSTORE(below) ;\n' +
    'LOAD(Rocks_isLeft) TABLE 0 LLOAD(below) PUT CALL LLOAD(row) LLOAD(x) 1.0 - GET "Picture" GET LOAD(Rocks_blankPNG) == AND IF ;\n' +
    '# It could fall left.\n' +
    ' LLOAD(dests) LLOAD(x) 1.0 - TRUE PUT LSTORE(dests) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LOAD(Rocks_isRight) TABLE 0 LLOAD(below) PUT CALL LLOAD(row) LLOAD(x) 1.0 + GET "Picture" GET LOAD(Rocks_blankPNG) == AND IF ;\n' +
    '# It could fall right.\n' +
    ' LLOAD(dests) LLOAD(x) 1.0 + TRUE PUT LSTORE(dests) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(dests) FOR DROP LSTORE(destX) ;\n' +
    '# Is there anything in the way?\n' +
    ' LLOAD(rowBelow) LLOAD(destX) GET LSTORE(destSprite) ;\n' +
    '# IF moving into a blank AND the man is not in the way\n' +
    ' LLOAD(destSprite) "Picture" GET LOAD(Rocks_blankPNG) == LLOAD(destX) LLOAD(manX) LLOAD(dx) - != LLOAD(destX) LLOAD(manX) != AND LLOAD(y) 1.0 + LLOAD(manY) LLOAD(dy) - != LLOAD(y) 1.0 + LLOAD(manY) != AND LLOAD(y) LLOAD(manY) LLOAD(dy) - != AND LLOAD(y) LLOAD(manY) != AND OR AND IF ;\n' +
    '# Move the rock.\n' +
    ' LLOAD(rockSprite) LOAD(Rocks_blankPNG) SET(Picture) LLOAD(destSprite) LOAD(Rocks_rockPNG) SET(Picture) LLOAD(isMoving) LLOAD(destX) TRUE PUT LSTORE(isMoving) ;\n' +
    '# Does it squash the man?\n' +
    ' LLOAD(destX) LLOAD(manX) LLOAD(dx) - == LLOAD(y) 2.0 + LLOAD(manY) LLOAD(dy) - == AND IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    "# Don't consider any other destination for this rock.\n" +
    ' BREAK THEN ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'FALSE RETURN DEF(Rocks_celebrate) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(picture) ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) 0.0 SET(X) ;\n' +
    'LLOAD(TEMP) 0.0 SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'TABLE LSTORE(sparks) ;\n' +
    '100.0 FOR DROP LSTORE(count) ;\n' +
    'LLOAD(sparks) LLOAD(count) TABLE "x" WINDOW "W" GET 2.0 / 0.5 - PUT "y" WINDOW "H" GET 2.0 / 0.5 - PUT "dx" RANDOM 0.5 - 1.0 * PUT "dy" RANDOM 0.5 - 1.0 * PUT "sprite" LLOAD(picture) SPRITE LSTORE(TEMP) LLOAD(TEMP) 1.0 SET(W) LLOAD(TEMP) 1.0 SET(H) LLOAD(TEMP) PUT PUT LSTORE(sparks) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'LOOP ;\n' +
    'KEYS "Space" GET NOT WHILE ;\n' +
    'LLOAD(count) 1.0 + 100.0 % LSTORE(count) ;\n' +
    'LLOAD(sparks) LLOAD(count) GET "sprite" GET FALSE SET(IsVisible) ;\n' +
    'LLOAD(sparks) LLOAD(count) TABLE "x" WINDOW "W" GET 2.0 / 0.5 - PUT "y" WINDOW "H" GET 2.0 / 0.5 - PUT "dx" RANDOM 0.5 - 1.0 * PUT "dy" RANDOM 0.5 - 1.0 * PUT "sprite" LLOAD(picture) SPRITE LSTORE(TEMP) LLOAD(TEMP) 1.0 SET(W) LLOAD(TEMP) 1.0 SET(H) LLOAD(TEMP) PUT PUT LSTORE(sparks) ;\n' +
    'LLOAD(sparks) FOR LSTORE(spark) LSTORE(i) ;\n' +
    'LLOAD(spark) "x" LLOAD(spark) "x" GET LLOAD(spark) "dx" GET + PUT LSTORE(spark) ;\n' +
    'LLOAD(spark) "y" LLOAD(spark) "y" GET LLOAD(spark) "dy" GET + PUT LSTORE(spark) ;\n' +
    'LLOAD(spark) "dy" LLOAD(spark) "dy" GET 0.01 + PUT LSTORE(spark) ;\n' +
    'LLOAD(spark) "sprite" GET LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) LLOAD(spark) "x" GET SET(X) ;\n' +
    'LLOAD(TEMP) LLOAD(spark) "y" GET SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'LLOAD(sparks) LLOAD(i) LLOAD(spark) PUT LSTORE(sparks) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'WAIT ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'CLS ;\n' +
    'TABLE RETURN DEF(Rocks_isLeft) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(pic) ;\n' +
    'LLOAD(pic) LOAD(Rocks_diamondPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_rockPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_leftPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'FALSE RETURN DEF(Rocks_playUntilWin) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(map) ;\n' +
    'LLOAD(ARGS) "demo" CONTAINS IF ;\n' +
    'LLOAD(ARGS) "demo" GET LSTORE(demo) ;\n' +
    'THEN ;\n' +
    '"" LSTORE(demo) ;\n' +
    'ELSE ;\n' +
    'LOOP ;\n' +
    'LOAD(Rocks_playLevel) TABLE 0 LLOAD(map) PUT "demo" LLOAD(demo) PUT CALL NOT WHILE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'TABLE RETURN DEF(Rocks_isWall) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(pic) ;\n' +
    'LLOAD(pic) LOAD(Rocks_wallPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_leftPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(pic) LOAD(Rocks_rightPNG) == IF ;\n' +
    'TRUE RETURN THEN ;\n' +
    'ELSE ;\n' +
    'FALSE RETURN DEF(Rocks_run) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(maps) ;\n' +
    'LLOAD(ARGS) 1 GET LSTORE(demos) ;\n' +
    'LLOAD(ARGS) "showDemos" CONTAINS IF ;\n' +
    'LLOAD(ARGS) "showDemos" GET LSTORE(showDemos) ;\n' +
    'THEN ;\n' +
    'TRUE LSTORE(showDemos) ;\n' +
    'ELSE ;\n' +
    'LLOAD(ARGS) "mapOrder" CONTAINS IF ;\n' +
    'LLOAD(ARGS) "mapOrder" GET LSTORE(mapOrder) ;\n' +
    'THEN ;\n' +
    '"ABCDEFGHIJKLMN" LSTORE(mapOrder) ;\n' +
    'ELSE ;\n' +
    'LLOAD(showDemos) NOT IF ;\n' +
    '# Throw away all the demos so people can actually play.\n' +
    ' LLOAD(maps) FOR DROP LSTORE(mapName) ;\n' +
    'LLOAD(demos) LLOAD(mapName) "" PUT LSTORE(demos) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LOOP ;\n' +
    'TRUE WHILE ;\n' +
    'LLOAD(mapOrder) FOR LSTORE(mapName) DROP ;\n' +
    'LOAD(Rocks_playUntilWin) TABLE 0 LLOAD(maps) LLOAD(mapName) GET PUT "demo" LLOAD(demos) LLOAD(mapName) GET PUT CALL DROPTABLE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'LOOP ;\n' +
    'KEYS "Space" GET WHILE ;\n' +
    'WAIT ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'CLS ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) 31.0 SET(W) LLOAD(TEMP) 31.0 SET(H) ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) 2.0 NEG SET(X) ;\n' +
    'LLOAD(TEMP) 13.0 NEG SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'TABLE 0 "+   + + +  + +  + ++++ +++ " PUT 1 "+   + + ++ + ++ + +    +  +" PUT 2 "+ + + + + ++ + ++ +++  +++ " PUT 3 "++ ++ + +  + +  + +    +  +" PUT 4 "+   + + +  + +  + ++++ +  +" PUT FOR LSTORE(row) LSTORE(y) ;\n' +
    'LLOAD(row) FOR LSTORE(cell) LSTORE(x) ;\n' +
    'LLOAD(cell) "+" == IF ;\n' +
    'LOAD(Rocks_wallPNG) SPRITE LSTORE(TEMP) LLOAD(TEMP) 1.0 SET(W) LLOAD(TEMP) 1.0 SET(H) LLOAD(TEMP) LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) LLOAD(x) SET(X) ;\n' +
    'LLOAD(TEMP) LLOAD(y) SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'LOOP ;\n' +
    'KEYS "Space" GET NOT WHILE ;\n' +
    'WAIT ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'CLS ;\n' +
    '# Throw away all the demos so people can actually play.\n' +
    ' LLOAD(maps) FOR DROP LSTORE(mapName) ;\n' +
    'LLOAD(demos) LLOAD(mapName) "" PUT LSTORE(demos) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'TABLE RETURN DEF(Rocks_playLevel) LSTORE(ARGS) ;\n' +
    'LLOAD(ARGS) 0 GET LSTORE(map) ;\n' +
    'LLOAD(ARGS) "demo" CONTAINS IF ;\n' +
    'LLOAD(ARGS) "demo" GET LSTORE(demo) ;\n' +
    'THEN ;\n' +
    '"" LSTORE(demo) ;\n' +
    'ELSE ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) 12.0 SET(W) LLOAD(TEMP) 12.0 SET(H) ;\n' +
    '# Define the mapping of characters to pictures.\n' +
    ' TABLE LSTORE(pictures) ;\n' +
    'LLOAD(pictures) " " LOAD(Rocks_blankPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) "A" LOAD(Rocks_blankPNG) PUT LSTORE(pictures) ;\n' +
    '# This marks the start position.\n' +
    ' LLOAD(pictures) ":" LOAD(Rocks_earthPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) "+" LOAD(Rocks_diamondPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) "O" LOAD(Rocks_rockPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) "#" LOAD(Rocks_wallPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) "<" LOAD(Rocks_leftPNG) PUT LSTORE(pictures) ;\n' +
    'LLOAD(pictures) ">" LOAD(Rocks_rightPNG) PUT LSTORE(pictures) ;\n' +
    '# Construct sprites for the map, count diamonds, and find the start position.\n' +
    ' TABLE LSTORE(bgSprites) ;\n' +
    '0.0 LSTORE(numDiamonds) ;\n' +
    'LLOAD(map) FOR LSTORE(row) LSTORE(y) ;\n' +
    'LLOAD(bgSprites) LLOAD(y) TABLE PUT LSTORE(bgSprites) ;\n' +
    'LLOAD(row) FOR LSTORE(char) LSTORE(x) ;\n' +
    'LLOAD(pictures) LLOAD(char) GET SPRITE LSTORE(TEMP) LLOAD(TEMP) 1.0 SET(W) LLOAD(TEMP) 1.0 SET(H) LLOAD(TEMP) LSTORE(sprite) ;\n' +
    'LLOAD(sprite) LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) LLOAD(x) SET(X) ;\n' +
    'LLOAD(TEMP) LLOAD(y) SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'LLOAD(bgSprites) LLOAD(y) DGET LLOAD(x) LLOAD(sprite) PUT PUT LSTORE(bgSprites) ;\n' +
    'LLOAD(char) "A" == IF ;\n' +
    'LLOAD(x) LSTORE(manX) ;\n' +
    'LLOAD(y) LSTORE(manY) ;\n' +
    'THEN ;\n' +
    'LLOAD(char) "+" == IF ;\n' +
    'LLOAD(numDiamonds) 1.0 + LSTORE(numDiamonds) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'LLOAD(numDiamonds) DUMP ;\n' +
    '" diamonds to collect\\A/" DUMP ;\n' +
    'LLOAD(demo) "" != IF ;\n' +
    '"Playing demo: \'" DUMP ;\n' +
    'LLOAD(demo) DUMP ;\n' +
    '"\'\\A/" DUMP ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Construct a sprite for the man.\n' +
    ' LOAD(Rocks_manPNG) SPRITE LSTORE(TEMP) LLOAD(TEMP) 1.0 SET(W) LLOAD(TEMP) 1.0 SET(H) LLOAD(TEMP) LSTORE(man) ;\n' +
    '# Game loop.\n' +
    ' 0.0 LSTORE(dx) ;\n' +
    '0.0 LSTORE(dy) ;\n' +
    '0.0 LSTORE(manCount) ;\n' +
    '0.0 LSTORE(bgCount) ;\n' +
    'FALSE LSTORE(manDead) ;\n' +
    '0.0 LSTORE(demoPos) ;\n' +
    "# Position within the 'demo' string.\n" +
    ' "" LSTORE(moves) ;\n' +
    '# Moves made so far. This is printed at the end of the level.\n' +
    ' LOOP ;\n' +
    'LLOAD(numDiamonds) 0.0 > LLOAD(manDead) NOT AND WHILE ;\n' +
    '# Display a frame.\n' +
    ' LLOAD(man) LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) LLOAD(manX) LLOAD(dx) LLOAD(manCount) * - SET(X) ;\n' +
    'LLOAD(TEMP) LLOAD(manY) LLOAD(dy) LLOAD(manCount) * - SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) LLOAD(man) "X" GET 0.5 + WINDOW "W" GET 2.0 / - SET(X) ;\n' +
    'LLOAD(TEMP) LLOAD(man) "Y" GET 0.5 + WINDOW "H" GET 2.0 / - SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'WINDOW LLOAD(bgCount) 0.05 * SET(B) WAIT ;\n' +
    '# Read the demo or the keyboard, if the man is exactly in a square.\n' +
    ' LLOAD(manCount) 0.0 == IF ;\n' +
    'LLOAD(demoPos) LLOAD(demo) LEN < IF ;\n' +
    '# Get the next move from the demo sequence.\n' +
    ' LLOAD(demo) LLOAD(demoPos) GET LSTORE(key) ;\n' +
    'LLOAD(demoPos) 1.0 + LSTORE(demoPos) ;\n' +
    'LLOAD(key) "L" == IF ;\n' +
    '1.0 NEG LSTORE(dx) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(key) "R" == IF ;\n' +
    '1.0 LSTORE(dx) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(key) "U" == IF ;\n' +
    '1.0 NEG LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(key) "D" == IF ;\n' +
    '1.0 LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    '# Get the next move by reading the keyboard.\n' +
    ' KEYS "LeftArrow" GET IF ;\n' +
    'LLOAD(dx) 1.0 - LSTORE(dx) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'KEYS "RightArrow" GET IF ;\n' +
    'LLOAD(dx) 1.0 + LSTORE(dx) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'KEYS "UpArrow" GET IF ;\n' +
    'LLOAD(dy) 1.0 - LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'KEYS "DownArrow" GET IF ;\n' +
    'LLOAD(dy) 1.0 + LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'LLOAD(dy) 0.0 != IF ;\n' +
    '0.0 LSTORE(dx) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'ELSE ;\n' +
    "# Check what we're about to hit.\n" +
    ' LLOAD(bgSprites) LLOAD(manY) LLOAD(dy) + GET LLOAD(manX) LLOAD(dx) + GET LSTORE(aheadSprite) ;\n' +
    'LLOAD(aheadSprite) "Picture" GET LSTORE(ahead) ;\n' +
    '# Is it a diamond?\n' +
    ' LLOAD(ahead) LOAD(Rocks_diamondPNG) == IF ;\n' +
    'LLOAD(numDiamonds) 1.0 - LSTORE(numDiamonds) ;\n' +
    '##DUMP numDiamonds DUMP " diamonds left\\A/"\n' +
    ' 20.0 LSTORE(bgCount) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Is it a rock?\n' +
    ' LLOAD(ahead) LOAD(Rocks_rockPNG) == IF ;\n' +
    "# Check what we're pushing it into.\n" +
    ' LLOAD(dy) 0.0 == LLOAD(bgSprites) LLOAD(manY) GET LLOAD(manX) 2.0 LLOAD(dx) * + GET "Picture" GET LOAD(Rocks_blankPNG) == AND IF ;\n' +
    '# Push succeeds.\n' +
    ' LLOAD(bgSprites) LLOAD(manY) GET LLOAD(manX) 2.0 LLOAD(dx) * + GET LOAD(Rocks_rockPNG) SET(Picture) THEN ;\n' +
    '# Push fails.\n' +
    ' 0.0 LSTORE(dx) ;\n' +
    '0.0 LSTORE(dy) ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Is it a wall?\n' +
    ' LOAD(Rocks_isWall) TABLE 0 LLOAD(ahead) PUT CALL IF ;\n' +
    '0.0 LSTORE(dx) ;\n' +
    '0.0 LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Does the man move?\n' +
    ' LLOAD(dx) 0.0 != LLOAD(dy) 0.0 != OR IF ;\n' +
    'LLOAD(manX) LLOAD(dx) + LSTORE(manX) ;\n' +
    'LLOAD(manY) LLOAD(dy) + LSTORE(manY) ;\n' +
    '1.0 LSTORE(manCount) ;\n' +
    '# Overwrite the square ahead with a blank.\n' +
    ' LLOAD(aheadSprite) LOAD(Rocks_blankPNG) SET(Picture) # Record the move.\n' +
    ' LLOAD(dx) 0.0 != IF ;\n' +
    'LLOAD(dx) 0.0 < IF ;\n' +
    '"L" LSTORE(key) ;\n' +
    'THEN ;\n' +
    '"R" LSTORE(key) ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'LLOAD(dy) 0.0 < IF ;\n' +
    '"U" LSTORE(key) ;\n' +
    'THEN ;\n' +
    '"D" LSTORE(key) ;\n' +
    'ELSE ;\n' +
    'ELSE ;\n' +
    'LLOAD(moves) LLOAD(key) + LSTORE(moves) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Move the man.\n' +
    ' LLOAD(manCount) 0.0 > IF ;\n' +
    'LLOAD(manCount) 0.25 - LSTORE(manCount) ;\n' +
    'LLOAD(manCount) 0.0 == IF ;\n' +
    '# Stop moving.\n' +
    ' 0.0 LSTORE(dx) ;\n' +
    '0.0 LSTORE(dy) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Fade the background.\n' +
    ' LLOAD(bgCount) 0.0 > IF ;\n' +
    'LLOAD(bgCount) 1.0 - LSTORE(bgCount) ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    '# Scan for rocks.\n' +
    ' LOAD(Rocks_moveRocks) TABLE 0 LLOAD(manX) PUT 1 LLOAD(manY) PUT 2 LLOAD(dx) PUT 3 LLOAD(dy) PUT 4 LLOAD(bgSprites) PUT CALL KEYS "Escape" GET OR LSTORE(manDead) ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    "# We've either won or lost.\n" +
    ' WINDOW 0.0 SET(B) TABLE LSTORE(bgSprites) ;\n' +
    '# Helps the garbage collector.\n' +
    ' "Moves made: " DUMP ;\n' +
    'LLOAD(moves) DUMP ;\n' +
    '"\\A/" DUMP ;\n' +
    '#  IF demo=="" { dummy = playLevel(map, demo=moves) }\n' +
    ' LLOAD(numDiamonds) 0.0 == IF ;\n' +
    'CLS ;\n' +
    'LLOAD(demo) "" == IF ;\n' +
    'LOAD(Rocks_celebrate) TABLE 0 LOAD(Rocks_diamondPNG) PUT CALL DROPTABLE ;\n' +
    'THEN ;\n' +
    'ELSE ;\n' +
    'TRUE RETURN THEN ;\n' +
    '20.0 FOR DROP LSTORE(i) ;\n' +
    'WINDOW LSTORE(TEMP) ;\n' +
    'LLOAD(TEMP) 0.30000000000000004 RANDOM 0.5 - * LLOAD(TEMP) "X" GET + SET(X) ;\n' +
    'LLOAD(TEMP) 0.30000000000000004 RANDOM 0.5 - * LLOAD(TEMP) "Y" GET + SET(Y) ;\n' +
    'LLOAD(TEMP) TRUE SET(IsVisible) ;\n' +
    'WAIT ;\n' +
    'NEXT ;\n' +
    'ELSE ;\n' +
    'CLS ;\n' +
    'LOAD(Rocks_celebrate) TABLE 0 LOAD(Rocks_rockPNG) PUT CALL DROPTABLE ;\n' +
    'FALSE RETURN ELSE ;\n' +
    'TABLE RETURN ' +
    ''
);
