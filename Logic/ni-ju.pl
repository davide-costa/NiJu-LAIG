:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(between)).
:- include('defines.pl').
:- include('menus.pl').
:- include('utils.pl').

niJu :-
	mainMenu.


%-----------------%
%-  Print Board  -%
%-----------------%

printBoard([]).
printBoard([FirstLine|Rest]) :-
	length(FirstLine, NumCols),
	nl,
	write('  '),
	printBoardColNum(1, NumCols),
	nl,
	printBlackLineForBoard(NumCols, NumCols),
	nl,
	printRowByRow([FirstLine|Rest], NumCols, 1).

printBoardColNum(CurrCol, 0).
printBoardColNum(CurrCol, NumColsToPrint) :-
	write('    '),
	write(CurrCol),
	write('   '),
	NewCurrCol is CurrCol + 1,
	NewNumColsToPrint is NumColsToPrint - 1,
	printBoardColNum(NewCurrCol, NewNumColsToPrint).
	
printBlackLineForBoard(0, BoardNumCols) :-
	write('-').
printBlackLineForBoard(N, BoardNumCols) :-
	N1 is N-1,
	((N \= BoardNumCols); write('   ')),
	write('--------'),
	printBlackLineForBoard(N1, BoardNumCols).

	
printRowByRow([], NumCols, CurrRowNum).
printRowByRow([Line|Rest], NumCols, CurrRowNum) :-
	write('   | '),
	printRowTiles(0, Line),
	nl,
	(CurrRowNum > 9; write(' ')),
	write(CurrRowNum),
	NewCurrRowNum is CurrRowNum + 1,
	write(' | '),
	printRowTiles(1, Line),
	nl,
	write('   | '),
	printRowTiles(2, Line),
	nl,
	printBlackLineForBoard(NumCols, NumCols),
	nl,
	printRowByRow(Rest, NumCols, NewCurrRowNum).
	
	
printRowTiles(0, []).
printRowTiles(1, []).
printRowTiles(2, []).
printRowTiles(YTile, [Tile|RTiles]) :-
	printTileLine(Tile, YTile), write('| '),
	printRowTiles(YTile, RTiles).
	

printTileLine([L|T], 0) :- printTileElement(L).
printTileLine([L|T], Idx) :- NIdx is Idx-1, printTileLine(T, NIdx).


printTileElement([]).
printTileElement([L|T]) :- 
	numbersToSimbols(L, X), write(X), write(' '), printTileElement(T).

	
	
	

%------------------------%
%-  Print Player Tiles  -%
%------------------------%
	
printPlayerTiles(Player, Player1Tiles, Player2Tiles) :- 
	((Player == 1, printTiles(Player1Tiles)); printTiles(Player2Tiles)),
	nl.
	

printTiles(ListTiles) :-
	length(ListTiles, NumTiles),
	printTilesAux(ListTiles, NumTiles, 1).
	
printTilesAux(ListTiles, 0, TileIdx) :- nl,nl.
printTilesAux(ListTiles, NumTiles, TileIdx) :-
	((NumTiles >= 10, (CurrNumTilesToPrint is 10, NextNumTiles is NumTiles-10)); (CurrNumTilesToPrint is NumTiles, NextNumTiles is 0)),
	nl,
	printBlackLineForTiles(CurrNumTilesToPrint),
	nl,
	MaxTileIdxToPrint is TileIdx + CurrNumTilesToPrint,
	printTileRowByRow(ListTiles, TileIdx, MaxTileIdxToPrint),
	NewTileIdx is TileIdx + CurrNumTilesToPrint,
	nl,
	printTilesAux(ListTiles, NextNumTiles, NewTileIdx).

	
printTileRowByRow([], TileIdx, MaxTileIdx).
printTileRowByRow(ListTiles, TileIdx, MaxTileIdx) :-
	printTileRowTiles(0, ListTiles, TileIdx, MaxTileIdx),
	nl,
	printTileRowTiles(1, ListTiles, TileIdx, MaxTileIdx),
	nl,
	printTileRowTiles(2, ListTiles, TileIdx, MaxTileIdx),
	nl,
	NumTilesToPrint is MaxTileIdx - TileIdx,
	printBlackLineForTiles(NumTilesToPrint), 
	nl,
	printTilesNums(TileIdx, NumTilesToPrint).

	
numSpacesGivenTileNum(TileNum) :-
	TileNum < 10, write('      ').
numSpacesGivenTileNum(TileNum) :-
	TileNum > 9, write('     ').
	
	
printTilesNums(TileNum, 0).
printTilesNums(TileNum, NumTiles) :-
	write(' ('), write(TileNum), write(')'),
	numSpacesGivenTileNum(TileNum),
	TileNum1 is TileNum + 1,
	NumTiles1 is NumTiles - 1,
	printTilesNums(TileNum1, NumTiles1).
	
	
printTileRowTiles(0, Board, MaxTileIdx, MaxTileIdx).
printTileRowTiles(1, Board, MaxTileIdx, MaxTileIdx).
printTileRowTiles(2, Board, MaxTileIdx, MaxTileIdx).
printTileRowTiles(YTile, Board, TileIdx, MaxTileIdx) :-
	nth1(TileIdx, Board, Tile),
	printTileLine(Tile, YTile), write(' |  '),
	NewIdx is TileIdx + 1,
	printTileRowTiles(YTile, Board, NewIdx, MaxTileIdx).

	
printBlackLineForTiles(0).
printBlackLineForTiles(N) :-
	N1 is N-1,
	((N1 \= 0, write('----------')); write('--------')),
	printBlackLineForTiles(N1).




%----------------------%
%-  Read Player Play  -%
%----------------------%
	
	
readPlayerPlay([FirstLine|Rest], PlayerTilesLength, TileNum, Rotation, Row, Col) :-
	readTileNum(PlayerTilesLength, TileNum),
	readRotation(Rotation),
	length([FirstLine|Rest], NumRows),
	length(FirstLine, NumCols),
	((NumRows == 1, NumCols == 1, Row is 1, Col is 1); readRowAndCol([FirstLine|Rest], NumRows, Row, NumCols, Col)).


readRowAndCol(Board, NumRows, Row, NumCols, Col) :-
	repeat,
	(
		write('please choose a valid row: '),
		read(Row),
		number(Row), Row > 0, NumRows >= Row,
		
		write('please choose a valid column: '),
		read(Col),
		number(Col), Col > 0, NumCols >= Col
	),
	validMove(Board, Row, Col).
	
	
readTileNum(NumPlayerTiles, TileNum) :-
	repeat,
	write('please choose a valid tile to play: '),
	read(TileNum),
	nl,
	number(TileNum), TileNum > 0, TileNum =< NumPlayerTiles.
	
readRotation(Rotation):-
	repeat,
	write('please choose a valid rotation: '),
	read(Rotation),
	nl,
	number(Rotation), Rotation >= 0, Rotation < 4.

	

%----------------------%
%-     Rotate Tile    -%
%----------------------%
	
/* rotate tile receives the tile to be rotated and a num (0,1,2 or 3) that represents a clockwise rotation of 0, 90, 180 or 270 respectively  */
rotateTile(Tile, 0, Tile).

rotateTile(Tile, 1, RotatedTile) :-
	matrixRotation(Tile, RotatedTile).
	
rotateTile(Tile, 2, RotatedTile) :-
	matrixRotation(Tile, Rotated90Tile),
	matrixRotation(Rotated90Tile, RotatedTile).
	
rotateTile(Tile, 3, RotatedTile) :-
	matrixRotation(Tile, Rotated90Tile),
	matrixRotation(Rotated90Tile, Rotated180Tile),
	matrixRotation(Rotated180Tile, RotatedTile).
	
matrixRotation(Matrix, RotatedMatrix) :-
   transpose(Matrix, Aux),
   maplist(reverse, Aux, RotatedMatrix).




%----------------------%
%-     Place Tile     -%
%----------------------%

setTile(Board, Row, Column, Tile, NewBoard) :-
	setRow(Row, Board, Column, Tile, NewBoard).

setRow(1, [Row|Rest], Column, Tile, [NewRow|Rest]):-
	setColumn(Column, Row, Tile, NewRow).

setRow(Pos, [Row|Rest], Column, Tile, [Row|NewRow]):-
	Pos > 1,
	Next is Pos-1,
	setRow(Next, Rest, Column, Tile, NewRow).

setColumn(1, [_|Rest], Tile, [Tile|Rest]).

setColumn(Pos, [X|Rest], Tile, [X|NewRest]):-
	Pos > 1,
	Next is Pos-1,
	setColumn(Next, Rest, Tile, NewRest).
	
	

	
%----------------------%
%-   Rearrange Board  -%
%----------------------%

isRearrangeNecessary([FirstLine|Rest]) :-
	length([FirstLine|Rest], NumRows),
	length(FirstLine, NumCols),
	(
		hasTileInRow([FirstLine|Rest], NumRows, NumCols, 1, 1, 1);	%upper row%
		hasTileInRow([FirstLine|Rest], NumRows, NumCols, 1, NumCols, 1);  %bottom row%
		hasTileInCol([FirstLine|Rest], NumRows, NumCols, 1, 1, 1);	%left column%
		hasTileInCol([FirstLine|Rest], NumRows, NumCols, NumRows, 1, 1)	%rigth column%
	).

/* the 2nd parameter indicates if it shoud continued checking (1) or should stop and rearrage is necessary (0)*/
hasTileInRow(Board, NumRows, NumCols, CurrI, CurrJ, 0).
hasTileInRow(Board, NumRows, NumCols, CurrI, CurrJ, 1):-
	getElement(Board, CurrI, CurrJ, Tile),
	ifThenElse(Tile == [[0, 0, 0], [0, 0, 0], [0, 0, 0]], Continue is 1, Continue is 0),
	NewJ is CurrJ + 1,
	\+((Continue == 1, NewJ >= NumCols)),
	hasTileInRow(Board, NumRows, NumCols, CurrI, NewJ, Continue).
	
/* the 2nd parameter indicates if it shoud continued checking (1) or should stop and rearrage is necessary (0)*/
hasTileInCol(Board, NumRows, NumCols, CurrI, CurrJ, 0).
hasTileInCol(Board, NumRows, NumCols, CurrI, CurrJ, 1):-
	getElement(Board, CurrI, CurrJ, Tile),
	ifThenElse(Tile == [[0, 0, 0], [0, 0, 0], [0, 0, 0]], Continue is 1, Continue is 0),
	NewI is CurrI + 1,
	\+((Continue == 1, NewI >= NumRows)),
	hasTileInCol(Board, NumRows, NumCols, NewI, CurrJ, Continue).
	
	
rearrangeFirstPlayBoard([FirstLine|Rest], NewBoard) :-
	emptyBoardThreeForThree(EmptyBoardThreeForThree),
	append(FirstLine, FirstLine, [Tile|Tail]), %to remove a [ ]
	setTile(EmptyBoardThreeForThree, 2, 2, Tile, NewBoard).
	
	
	
rearrangeBoardIfNecessary([FirstLine|Rest], NewBoard) :-
	length([FirstLine|Rest], NumRows),
	length(FirstLine, NumCols),
	(
		%upper row%
		(hasTileInRow([FirstLine|Rest], NumRows, NumCols, 1, 1, 1), rearrangeUpperRow([FirstLine|Rest], NumCols, [NewBoardAux|NewBoardAuxRest]));
				
		%bottom row%
		(hasTileInRow([FirstLine|Rest], NumRows, NumCols, NumRows, 1, 1), rearrangeDownRow([FirstLine|Rest], NumCols, [NewBoardAux|NewBoardAuxRest]));
			
		%left column%
		(hasTileInCol([FirstLine|Rest], NumRows, NumCols, 1, 1, 1), rearrangeLeftCol([FirstLine|Rest], [NewBoardAux|NewBoardAuxRest]));
				
		%rigth column%
		(hasTileInCol([FirstLine|Rest], NumRows, NumCols, 1, NumCols, 1), rearrangeRightCol([FirstLine|Rest], [NewBoardAux|NewBoardAuxRest]))
	),
	length(NewBoardAuxRest, L),
    length(Xs, L),
    append(Xs, _, NewBoardAuxRest),
	nth1(L, NewBoardAuxRest, E),
	NewBoard = [NewBoardAux|Xs].
	
rearrangeBoardIfNecessary([FirstLine|Rest], NewBoard) :-
	((Rest is 0, NewBoard = [FirstLine]); NewBoard = [FirstLine|Rest]).
	
	
rearrangeLeftCol([], NewBoard).
rearrangeLeftCol([Row|Rest], [NewBoardHead|NewBoardTail]) :-
	rearrangeLeftColAux(Row, NewBoardHead),
	rearrangeLeftCol(Rest, NewBoardTail).
	
rearrangeLeftColAux(Row, NewRow) :-
	emptyTile(EmptyTile),
	append([EmptyTile], Row, NewRow).
	
rearrangeRightCol([], NewBoard).
rearrangeRightCol([Row|Rest], [NewBoardHead|NewBoardTail]) :-
	rearrangeRightColAux(Row, NewBoardHead),
	rearrangeRightCol(Rest, NewBoardTail).
	
rearrangeRightColAux(Row, NewRow) :-
	emptyTile(EmptyTile),
	append(Row, [EmptyTile], NewRow).
		
rearrangeUpperRow(Board, NumCols, NewBoard) :-
	createRowOfEmptyTiles(Row, NumCols),
	append([Row], Board, NewBoard).
	
rearrangeDownRow(Board, NumCols, NewBoard) :-
	createRowOfEmptyTiles(Row, NumCols),
	append(Board, [Row], NewBoard).

	


%----------------------------%
%- Get Player Num From Tile -%
%----------------------------%

getPlayerNumFromTile(Tile, Player) :-
	getElement(Tile, 2, 2, Player).


	
%----------------------%
%-  End of Game Check -%
%----------------------%

%receives CurrI and CurrJ with value of 2, to not start in the most exterior line, except for the first call that will be with 1%
%NumRows first assigned value will not be used fact, its just for the other recursive calls%
notEndOfGame([FirstLine|Rest], NumRows, CurrJ, NumRows).
notEndOfGame([FirstLine|Rest], CurrI, CurrJ, NumRows) :-
	length(FirstLine, NumCols),
	analiseLineForEndOfGame([FirstLine|Rest], CurrI, CurrJ, NumCols),
	NextI is CurrI + 1,
	length([FirstLine|Rest], NewNumRows),
	notEndOfGame([FirstLine|Rest], NextI, CurrJ, NewNumRows).
	
analiseLineForEndOfGame(Board, CurrI, NumCols, NumCols).
analiseLineForEndOfGame(Board, CurrI, CurrJ, NumCols) :-
	getElement(Board, CurrI, CurrJ, CurrTile),
	\+(hasThisTileGivenVictory(CurrTile, Board, CurrI, CurrJ)),
	NextJ is CurrJ + 1,
	analiseLineForEndOfGame(Board, CurrI, NextJ, NumCols).
	
getNumTilesAroundThatMatchTileSpecification(Tile, Board, CurrI, CurrJ, Sum, ListTilesWithSpecification) :-
	getPlayerNumFromTile(Tile, PlayerNum),
	length(Board, NumRows),
	nth1(1, Board, FirstRow),
	length(FirstRow, NumCols),

	getElement(Tile, 1, 1, Aux1),
	Aux1I is CurrI - 1,
	Aux1J is CurrJ - 1,
	(
		((\+((between(1, NumRows, Aux1I), between(1, NumCols, Aux1J)))), Aux1Value is 0);
		
		(
			getElement(Board, Aux1I, Aux1J, Aux1Tile),
			getPlayerNumFromTile(Aux1Tile, Aux1PlayerNum),
			(((Aux1 == 3, Aux1PlayerNum == PlayerNum), Aux1Value is 1, Aux1List = [Aux1I, Aux1J, Aux1Tile]); Aux1Value is 0, Aux1List = [])
		)
	),
	
	getElement(Tile, 1, 2, Aux2),
	Aux2I is CurrI - 1,
	Aux2J is CurrJ,
	(
		((\+((between(1, NumRows, Aux2I), between(1, NumCols, Aux2J)))), Aux2Value is 0);
		
		(
			getElement(Board, Aux2I, Aux2J, Aux2Tile),
			getPlayerNumFromTile(Aux2Tile, Aux2PlayerNum),
			(((Aux2 == 3, Aux2PlayerNum == PlayerNum), Aux2Value is 1, Aux2List = [Aux2I, Aux2J, Aux2Tile]); Aux2Value is 0, Aux2List = [])
		)
	),
	
	getElement(Tile, 1, 3, Aux3),
	Aux3I is CurrI - 1,
	Aux3J is CurrJ + 1,
	(
		((\+((between(1, NumRows, Aux3I), between(1, NumCols, Aux3J)))), Aux3Value is 0);
		
		(
			getElement(Board, Aux3I, Aux3J, Aux3Tile),
			getPlayerNumFromTile(Aux3Tile, Aux3PlayerNum),
			(((Aux3 == 3, Aux3PlayerNum == PlayerNum), Aux3Value is 1, Aux3List = [Aux3I, Aux3J, Aux3Tile]); Aux3Value is 0, Aux3List = [])
		)
	),
	
	getElement(Tile, 2, 1, Aux4),
	Aux4I is CurrI,
	Aux4J is CurrJ - 1,
	(
		((\+((between(1, NumRows, Aux4I), between(1, NumCols, Aux4J)))), Aux4Value is 0);
		
		(
			getElement(Board, Aux4I, Aux4J, Aux4Tile),
			getPlayerNumFromTile(Aux4Tile, Aux4PlayerNum),
			(((Aux4 == 3, Aux4PlayerNum == PlayerNum), Aux4Value is 1, Aux4List = [Aux4I, Aux4J, Aux4Tile]); Aux4Value is 0, Aux4List = [])

		)
	),
	
	
	getElement(Tile, 2, 3, Aux5),
	Aux5I is CurrI,
	Aux5J is CurrJ + 1,
	(
		((\+((between(1, NumRows, Aux5I), between(1, NumCols, Aux5J)))), Aux5Value is 0);
		
		(
			getElement(Board, Aux5I, Aux5J, Aux5Tile),
			getPlayerNumFromTile(Aux5Tile, Aux5PlayerNum), 
			(((Aux5 == 3, Aux5PlayerNum == PlayerNum), Aux5Value is 1, Aux5List = [Aux5I, Aux5J, Aux5Tile]); Aux5Value is 0, Aux5List = [])
		)
	),
	
	getElement(Tile, 3, 1, Aux6),
	Aux6I is CurrI + 1,
	Aux6J is CurrJ - 1,
	(
		((\+((between(1, NumRows, Aux6I), between(1, NumCols, Aux6J)))), Aux6Value is 0);
		
		(
			getElement(Board, Aux6I, Aux6J, Aux6Tile),
			getPlayerNumFromTile(Aux6Tile, Aux6PlayerNum),
			(((Aux6 == 3, Aux6PlayerNum == PlayerNum), Aux6Value is 1, Aux6List = [Aux6I, Aux6J, Aux6Tile]); Aux6Value is 0, Aux6List = [])
		)
	),
	
	getElement(Tile, 3, 2, Aux7),
	Aux7I is CurrI + 1,
	Aux7J is CurrJ,
	(
		((\+((between(1, NumRows, Aux7I), between(1, NumCols, Aux7J)))), Aux7Value is 0);
		
		(
			getElement(Board, Aux7I, Aux7J, Aux7Tile),
			getPlayerNumFromTile(Aux7Tile, Aux7PlayerNum),
			(((Aux7 == 3, Aux7PlayerNum == PlayerNum), Aux7Value is 1, Aux7List = [Aux7I, Aux7J, Aux7Tile]); Aux7Value is 0, Aux7List = [])
		)
	),
	
	getElement(Tile, 3, 3, Aux8),
	Aux8I is CurrI + 1,
	Aux8J is CurrJ + 1,
	(
		((\+((between(1, NumRows, Aux8I), between(1, NumCols, Aux8J)))), Aux8Value is 0);
		
		(
			getElement(Board, Aux8I, Aux8J, Aux8Tile),
			getPlayerNumFromTile(Aux8Tile, Aux8PlayerNum),
			(((Aux8 == 3, Aux8PlayerNum == PlayerNum), Aux8Value is 1, Aux8List = [Aux8I, Aux8J, Aux8Tile]); Aux8Value is 0, Aux8List = [])
		)
	),
	
	Sum is (Aux1Value + Aux2Value + Aux3Value + Aux4Value + Aux5Value + Aux6Value + Aux7Value + Aux8Value),
	SumOfLists = [Aux1List, Aux2List, Aux3List, Aux4List, Aux5List, Aux6List, Aux7List, Aux8List],
	remove_list(SumOfLists, [[]], ListTilesWithSpecification).
	
	
hasThisTileGivenVictory(Tile, Board, CurrI, CurrJ) :-
	getNumTilesAroundThatMatchTileSpecification(Tile, Board, CurrI, CurrJ, Sum, ListTilesWithSpecification),
	Sum == 4.
	
	

%------------------%
%-   End of Game  -%
%------------------%

endOfGame(CurrPlayer) :-
	clearConsole(5),
	write('Player '),
	write(CurrPlayer),
	write(' wins!'), nl,
	pressEnterToContinue, nl,
	mainMenu.
	
endOfGameWithoutWin :-
	clearConsole,
	write('No more playes available. Game ended without a winner!'), nl, 
	pressEnterToContinue, nl,
	mainMenu.
	
	

%-------------------%
%-   Prepare Game  -%
%-------------------%

prepareGame(InitBoard, Player1Tiles, Player2Tiles) :-
	board(0, InitBoard),
	playerToTiles(1, Player1Tiles),
	playerToTiles(2, Player2Tiles).
		
	
	
%----------------------%
%- Ni-Ju Humano Humano-%
%----------------------%

niJuHumanoHumano :-
	prepareGame(InitBoard, Player1Tiles, Player2Tiles),
	gameLoop(InitBoard, 1, Player1Tiles, Player2Tiles).
	
gameLoop(Board, CurrPlayer, Player1Tiles, Player2Tiles):-
	((board(0, InitBoard), (Board == InitBoard)); printBoard(Board)),
	getCurrPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, CurrPlayerTiles),
	printTiles(CurrPlayerTiles),
	length(CurrPlayerTiles, CurrPlayerTilesLength),
	readPlayerPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col),
	nth1(TileNum, CurrPlayerTiles, ChoosenTile),
	nth1(TileNum, CurrPlayerTiles, _, PlayerNewListOfTiles),  %remove the tile from the list of tiles %
	rotateTile(ChoosenTile, Rotation, RotatedTile),
	setTile(Board, Row, Col, RotatedTile, BoardWithPlacedTile),
	length(BoardWithPlacedTile, BoardLength),
	(verifyNotEndOfGame(BoardLength, BoardWithPlacedTile); endOfGame(CurrPlayer)),
	getNewPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, PlayerNewListOfTiles, NewPlayer1Tiles, NewPlayer2Tiles),
	((BoardLength == 1, rearrangeFirstPlayBoard(BoardWithPlacedTile, RearrangedBoard)); rearrangeBoardIfNecessary(BoardWithPlacedTile, RearrangedBoard)),
	((CurrPlayer == 1, gameLoop(RearrangedBoard, 2, NewPlayer1Tiles, NewPlayer2Tiles)); gameLoop(RearrangedBoard, 1, NewPlayer1Tiles, NewPlayer2Tiles)).

	
verifyNotEndOfGame(1, BoardWithPlacedTile) :-
	notEndOfGame(BoardWithPlacedTile, 1, 1, 1).
	
verifyNotEndOfGame(NumRows, BoardWithPlacedTile) :-
	NumRows \= 1,
	notEndOfGame(BoardWithPlacedTile, 2, 2, NumRows).
	
getCurrPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, CurrPlayerTiles) :-
	((CurrPlayer == 1, CurrPlayerTiles = Player1Tiles); CurrPlayerTiles = Player2Tiles).
	
getNewPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, CurrPlayerTiles, NewPlayer1Tiles, NewPlayer2Tiles) :-
	((CurrPlayer == 1, (NewPlayer1Tiles = CurrPlayerTiles, NewPlayer2Tiles = Player2Tiles)); (NewPlayer1Tiles = Player1Tiles, NewPlayer2Tiles = CurrPlayerTiles)).
	
		
	
	
%--------------------%
%-   IA - Nivel 0   -%
%--------------------%	
	
generateRandomPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col) :-
	generateAllValidPlays(Board, CurrPlayerTilesLength, ListOfPlays),
	random_member(TileNum - Row - Col - Rotation, ListOfPlays).
	
	
generateAllValidPlays(Board, CurrPlayerTilesLength, ListOfPlays) :-
	findall(TileNum - Row - Col - Rotation, (validMove(Board, Row, Col), validTile(CurrPlayerTilesLength, TileNum), validRotation(Rotation)), ListWithDuplicates),
	remove_duplicates(ListWithDuplicates, ListOfPlays).
	
	
validTile(CurrPlayerTilesLength, TileNum) :-
	between(1, CurrPlayerTilesLength,TileNum).
	
	
validMove([FirstLine|Rest], 1, 1) :-
	length([FirstLine|Rest], NumRows),
	NumRows == 1,
	length(FirstLine, NumCols),
	NumCols == 1.
	
validMove([FirstLine|Rest], Row, Col) :-
	emptyTile(EmptyTile),
	getElement([FirstLine|Rest], Row, Col, Element),
	Element == EmptyTile,
	
	(
		(
			UpperElemRow is Row - 1,
			getElement([FirstLine|Rest], UpperElemRow, Col, UpperElement),
			UpperElement \= EmptyTile
		);
		
		(
			DownElemRow is Row + 1,
			getElement([FirstLine|Rest], DownElemRow, Col, DownElement),
			DownElement \= EmptyTile
		);
		
		(
			LeftElemCol is Col - 1,
			getElement([FirstLine|Rest], Row, LeftElemCol, LeftElement),
			LeftElement \= EmptyTile
		);
		
		(
			RightElemCol is Col + 1,
			getElement([FirstLine|Rest], Row, RightElemCol, RightElement),
			RightElement \= EmptyTile
		)
	),
	
	length([FirstLine|Rest], NumRows),
	Row =< NumRows,
	
	length(FirstLine, NumCols),
	Col =< NumCols.
	
	
	
validRotation(Rotation) :-
	between(0, 3,Rotation).
		
	
	
%-----------------------------------%
%- Ni-Ju Humano Computador Nivel 0 -%
%-----------------------------------%
	
	
niJuHumanoComputadorNivel0 :-
	prepareGame(InitBoard, Player1Tiles, Player2Tiles),
	gameLoopIANivel0(InitBoard, 1, Player1Tiles, Player2Tiles).
	
gameLoopIANivel0(Board, CurrPlayer, Player1Tiles, Player2Tiles):-
	getCurrPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, CurrPlayerTiles),
	(CurrPlayer == 2; printTiles(CurrPlayerTiles)),
	length(CurrPlayerTiles, CurrPlayerTilesLength),
	((CurrPlayer == 1, readPlayerPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col); generateRandomPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col))),
	nth1(TileNum, CurrPlayerTiles, ChoosenTile),
	nth1(TileNum, CurrPlayerTiles, _, PlayerNewListOfTiles),  %remove the tile from the list of tiles %
	rotateTile(ChoosenTile, Rotation, RotatedTile),
	setTile(Board, Row, Col, RotatedTile, BoardWithPlacedTile),
	length(BoardWithPlacedTile, BoardLength),
	(verifyNotEndOfGame(BoardLength, BoardWithPlacedTile); endOfGame(CurrPlayer)),
	getNewPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, PlayerNewListOfTiles, NewPlayer1Tiles, NewPlayer2Tiles),
	((BoardLength == 1, rearrangeFirstPlayBoard(BoardWithPlacedTile, RearrangedBoard)); rearrangeBoardIfNecessary(BoardWithPlacedTile, RearrangedBoard)),
	printBoard(RearrangedBoard),
	((CurrPlayer == 1, gameLoopIANivel0(RearrangedBoard, 2, NewPlayer1Tiles, NewPlayer2Tiles)); gameLoopIANivel0(RearrangedBoard, 1, NewPlayer1Tiles, NewPlayer2Tiles)).
	
	
	
	
	
%--------------------------------------------------%
%- Ni-Ju Computador Nivel 0 vs Computador Nivel 0 -%
%--------------------------------------------------%
	
	
niJuComputadorNivel0ComputadorNivel0 :-
	prepareGame(InitBoard, Player1Tiles, Player2Tiles),
	gameLoopIANivel0Nivel0(InitBoard, 1, Player1Tiles, Player2Tiles).
	
gameLoopIANivel0Nivel0(Board, CurrPlayer, Player1Tiles, Player2Tiles) :-
	getCurrPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, CurrPlayerTiles),
	length(CurrPlayerTiles, CurrPlayerTilesLength),
	((CurrPlayerTilesLength \= 0); endOfGameWithoutWin),
	generateRandomPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col),
	nth1(TileNum, CurrPlayerTiles, ChoosenTile),
	nth1(TileNum, CurrPlayerTiles, _, PlayerNewListOfTiles),  %remove the tile from the list of tiles %
	rotateTile(ChoosenTile, Rotation, RotatedTile),
	setTile(Board, Row, Col, RotatedTile, BoardWithPlacedTile),
	length(BoardWithPlacedTile, BoardLength),
	(verifyNotEndOfGame(BoardLength, BoardWithPlacedTile); endOfGame(CurrPlayer)),
	getNewPlayerTiles(CurrPlayer, Player1Tiles, Player2Tiles, PlayerNewListOfTiles, NewPlayer1Tiles, NewPlayer2Tiles),
	((BoardLength == 1, rearrangeFirstPlayBoard(BoardWithPlacedTile, RearrangedBoard)); rearrangeBoardIfNecessary(BoardWithPlacedTile, RearrangedBoard)),
	printBoard(RearrangedBoard),
	pressEnterToContinue,
	((CurrPlayer == 1, gameLoopIANivel0Nivel0(RearrangedBoard, 2, NewPlayer1Tiles, NewPlayer2Tiles)); gameLoopIANivel0Nivel0(RearrangedBoard, 1, NewPlayer1Tiles, NewPlayer2Tiles)).
	
	
	

	
%--------------------%
%-   IA - Nivel 1   -%
%--------------------%


generateIAPlay(Board, CurrPlayerTiles, CurrPlayerTilesLength, TileNum, Rotation, Row, Col) :-
	findall(Val - TileN - X - Y - Rot, (validMove(Board, X, Y), validTile(CurrPlayerTilesLength, TileN), nth1(TileN, CurrPlayerTiles, Tile), validRotation(Rot), evaluatePlay(Board, Tile, X, Y, Val)), ListOfAllPlays),
	remove_duplicates(ListOfAllPlays, NewList),
	sort(NewList, SortedList),
	length(SortedList, SortedListLength),
	nth1(SortedListLength, SortedList, Value - TileNum - Row - Col - Rotation).

	
evaluatePlay(Board, Tile, Row, Col, Val) :-
	%check if that play wins the game%
	setTile(Board, Row, Col, Tile, BoardWithPlacedTile),
	((notEndOfGame(BoardWithPlacedTile, 2, 2, 0), EndOfGameValue is 0); EndOfGameValue is 100),

	%check if starts building a possible victory%
	getElement(Tile, 2, 2, PlayerNum),
	fakeTileWithAllSquaresChecked(PlayerNum, FakeTile),
	getNumTilesAroundThatMatchTileSpecification(FakeTile, Board, Row, Col, _, ListOfTilesAndCoords),
	removeNotBlockedTiles(Board, FakeTile, Row, Col, ListOfTilesAndCoords, [[]], NewListOfTilesAndCoords),
	checkOpponentTilesValue(BoardWithPlacedTile, NewListOfTilesAndCoords, MaxSumValueForVictory),
	(
		(MaxSumValueForVictory == -1, WinValue is 0);
		(MaxSumValueForVictory == 0, WinValue is 10);
		WinValue is MaxSumValueForVictory * 20
	), !,
	
	%check if can prevent a defeat now or in the future%
	((PlayerNum == 1, OpponentPlayerNum is 2); OpponentPlayerNum is 1),
	fakeTileWithAllSquaresChecked(OpponentPlayerNum, FakeTileOpponent),
	getNumTilesAroundThatMatchTileSpecification(FakeTileOpponent, Board, Row, Col, _, ListOfOpponentTilesAndCoords),
	removeNotBlockedTiles(Board, FakeTileOpponent, Row, Col, ListOfOpponentTilesAndCoords, [[]], NewListOfOpponentTilesAndCoords),
	checkOpponentTilesValue(Board, NewListOfOpponentTilesAndCoords, MaxSumValueForNotDefeat),
	(
		(MaxSumValueForNotDefeat == -1, PreventDefeat is 0);
		(MaxSumValueForNotDefeat == 0, PreventDefeat is 7);
		PreventDefeat is MaxSumValueForNotDefeat * 15
	),
	Val is EndOfGameValue + WinValue + PreventDefeat, !.
	
	
removeNotBlockedTiles(Board, FakeTile, FakeTileRow, FakeTileCol, [], AuxListOfOpponentTilesAndCoords, ListOfOpponentTilesAndCoords) :-
	remove_list(AuxListOfOpponentTilesAndCoords, [[]], ListOfOpponentTilesAndCoords).
removeNotBlockedTiles(Board, FakeTile, FakeTileRow, FakeTileCol, [FirstOpponentTileAndCoords | ListOfRestOpponentTilesAndCoords], AuxListOfOpponentTilesAndCoords, ListOfOpponentTilesAndCoords) :-
	nth1(1, FirstOpponentTileAndCoords, Row),
	nth1(2, FirstOpponentTileAndCoords, Col),
	nth1(3, FirstOpponentTileAndCoords, Tile),
	getNumTilesAroundThatMatchTileSpecification(Tile, Board, Row, Col, SumWithoutTile, _),
	setTile(Board, FakeTileRow, FakeTileCol, FakeTile, NewBoard),
	getNumTilesAroundThatMatchTileSpecification(Tile, NewBoard, Row, Col, SumWithFakeTile, _),
	(
		(SumWithFakeTile > SumWithoutTile, 
		FirstNewOpponentTilesAndCoords = FirstOpponentTileAndCoords,
		append(AuxListOfOpponentTilesAndCoords, [FirstOpponentTileAndCoords], NewAuxListOfOpponentTilesAndCoords),
		removeNotBlockedTiles(Board, FakeTile, FakeTileRow, FakeTileCol, ListOfRestOpponentTilesAndCoords, NewAuxListOfOpponentTilesAndCoords, ListOfOpponentTilesAndCoords));
		
		removeNotBlockedTiles(Board, FakeTile, FakeTileRow, FakeTileCol, ListOfRestOpponentTilesAndCoords, AuxListOfOpponentTilesAndCoords, ListOfOpponentTilesAndCoords)
	).
	
	
checkOpponentTilesValue(Board, [], -1).
checkOpponentTilesValue(Board, ListOfOpponentTilesAndCoords, MaxSumValue) :-
	checkOpponentTilesValueAux(Board, ListOfOpponentTilesAndCoords, 0, MaxSumValue).
	
checkOpponentTilesValueAux(Board, [], CurrMaxSumValue, MaxSumValue) :-
	MaxSumValue is CurrMaxSumValue.
	
checkOpponentTilesValueAux(Board, [FirstTileAndCoords| RestOfTilesAndCoords], CurrMaxSumValue, MaxSumValue) :-
	nth1(1, FirstTileAndCoords, Row),
	nth1(2, FirstTileAndCoords, Col),
	nth1(3, FirstTileAndCoords, Tile),
	getNumTilesAroundThatMatchTileSpecification(Tile, Board, Row, Col, Sum, _),
	ifThenElse(checkIfTileCanStillWin(Board, Tile, Row, Col), ((Sum > CurrMaxSumValue, NewCurrMaxSumValue is Sum); NewCurrMaxSumValue is CurrMaxSumValue), NewCurrMaxSumValue is CurrMaxSumValue),
	checkOpponentTilesValueAux(Board, RestOfTilesAndCoords, NewCurrMaxSumValue, MaxSumValue).
	
		
changeTileOwner(Tile, NewTile) :-
	nth1(1, Tile, FirstLine),
	
	nth1(2, Tile, MiddleLine),
	nth1(1, MiddleLine, Middle1),
	nth1(2, MiddleLine, CurrPlayer),
	((CurrPlayer == 1, Middle2 is 2); Middle2 is 1),
	nth1(3, MiddleLine, Middle3),
	NewMiddleLine = [Middle1, Middle2, Middle3],
	
	nth1(3, Tile, LastLine),
	
	NewTile is [FirstLine, NewMiddleLine, LastLine].
	

checkIfTileCanStillWin(Board, Tile, CurrI, CurrJ) :-
	getPlayerNumFromTile(Tile, PlayerNum),
	length(Board, NumRows),
	nth1(1, Board, FirstRow),
	length(FirstRow, NumCols),
	
	
	
	getElement(Tile, 3, 3, Aux1),
	Aux1I is CurrI + 1,
	Aux1J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux1I), between(1, NumCols, Aux1J))));
		
		(
			getElement(Board, Aux1I, Aux1J, Aux1Tile),
			getPlayerNumFromTile(Aux1Tile, Aux1PlayerNum),
			Aux1 == 3, 
			Aux1PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux2),
	Aux2I is CurrI + 1,
	Aux2J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux2I), between(1, NumCols, Aux2J))));
		
		(
			getElement(Board, Aux2I, Aux2J, Aux2Tile),
			getPlayerNumFromTile(Aux2Tile, Aux2PlayerNum),
			Aux2 == 3, 
			Aux2PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux3),
	Aux3I is CurrI + 1,
	Aux3J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux3I), between(1, NumCols, Aux3J))));
		
		(
			getElement(Board, Aux3I, Aux3J, Aux3Tile),
			getPlayerNumFromTile(Aux3Tile, Aux3PlayerNum),
			Aux3 == 3, 
			Aux3PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux4),
	Aux4I is CurrI + 1,
	Aux4J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux4I), between(1, NumCols, Aux4J))));
		
		(
			getElement(Board, Aux4I, Aux4J, Aux4Tile),
			getPlayerNumFromTile(Aux4Tile, Aux4PlayerNum),
			Aux4 == 3, 
			Aux4PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux5),
	Aux5I is CurrI + 1,
	Aux5J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux5I), between(1, NumCols, Aux5J))));
		
		(
			getElement(Board, Aux5I, Aux5J, Aux5Tile),
			getPlayerNumFromTile(Aux5Tile, Aux5PlayerNum),
			Aux5 == 3, 
			Aux5PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux6),
	Aux6I is CurrI + 1,
	Aux6J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux6I), between(1, NumCols, Aux6J))));
		
		(
			getElement(Board, Aux6I, Aux6J, Aux6Tile),
			getPlayerNumFromTile(Aux6Tile, Aux6PlayerNum),
			Aux6 == 3, 
			Aux6PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux7),
	Aux7I is CurrI + 1,
	Aux7J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux7I), between(1, NumCols, Aux7J))));
		
		(
			getElement(Board, Aux7I, Aux7J, Aux7Tile),
			getPlayerNumFromTile(Aux7Tile, Aux7PlayerNum),
			Aux7 == 3, 
			Aux7PlayerNum == PlayerNum
		)
	),
	
	getElement(Tile, 3, 3, Aux8),
	Aux8I is CurrI + 1,
	Aux8J is CurrJ + 1,
	(
		(\+((between(1, NumRows, Aux8I), between(1, NumCols, Aux8J))));
		
		(
			getElement(Board, Aux8I, Aux8J, Aux8Tile),
			getPlayerNumFromTile(Aux8Tile, Aux8PlayerNum),
			Aux8 == 3, 
			Aux8PlayerNum == PlayerNum
		)
	).
	
	
	
	
%--------------------%
%- Ni-Ju Computador -%
%--------------------%
	
niJuComputador(Nivel, Board, CurrPlayerTiles, RotatedTile, RearrangedBoard, EndOfGame) :-
	length(CurrPlayerTiles, CurrPlayerTilesLength),
	((Nivel == 0, generateRandomPlay(Board, CurrPlayerTilesLength, TileNum, Rotation, Row, Col)); generateIAPlay(Board, CurrPlayerTiles, CurrPlayerTilesLength, TileNum, Rotation, Row, Col)),
	nth1(TileNum, CurrPlayerTiles, ChoosenTile),
	rotateTile(ChoosenTile, Rotation, RotatedTile), 
	setTile(Board, Row, Col, RotatedTile, BoardWithPlacedTile),
	length(BoardWithPlacedTile, BoardLength),
	((verifyNotEndOfGame(BoardLength, BoardWithPlacedTile), EndOfGame is 0); EndOfGame is 1),
	((BoardLength == 1, rearrangeFirstPlayBoard(BoardWithPlacedTile, RearrangedBoard)); rearrangeBoardIfNecessary(BoardWithPlacedTile, RearrangedBoard)).
	
	
	
	
%----------------%
%- Ni-Ju Humano -%
%----------------%
	
niJuHumano(Board, ChoosenTile, Row, Col, RearrangedBoard, EndOfGame) :-
	setTile(Board, Row, Col, ChoosenTile, BoardWithPlacedTile),
	length(BoardWithPlacedTile, BoardLength),
	((verifyNotEndOfGame(BoardLength, BoardWithPlacedTile), EndOfGame is 0); EndOfGame is 1),
	((BoardLength == 1, rearrangeFirstPlayBoard(BoardWithPlacedTile, RearrangedBoard)); rearrangeBoardIfNecessary(BoardWithPlacedTile, RearrangedBoard)).

	