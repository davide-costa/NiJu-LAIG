const player1Tiles = [[[3, 3, 3], [0, 1, 3], [0, 0, 0]], [[3, 3, 3], [0, 1, 0], [0, 0, 3]], [[3, 3, 3], [0, 1, 0], [0, 3, 0]], [[3, 3, 3], [0, 1, 0], [3, 0, 0]], [[3, 3, 3],
        [3, 1, 0], [0, 0, 0]], [[3, 3, 0], [0, 1, 3], [0, 0, 3]], [[3, 3, 0], [0, 1, 3], [0, 3, 0]], [[3, 3, 0], [0, 1, 3], [3, 0, 0]], [[3, 3, 0], [3, 1, 3],
        [0, 0, 0]], [[3, 3, 0], [0, 1, 0], [0, 3, 3]], [[3, 3, 0], [0, 1, 0], [3, 0, 3]], [[3, 3, 0], [3, 1, 0], [0, 0, 3]], [[3, 3, 0], [0, 1, 0], [3, 3, 0]],
    [[3, 3, 0], [3, 1, 0], [0, 3, 0]], [[3, 0, 0], [0, 1, 3], [3, 0, 3]], [[3, 0, 0], [3, 1, 3], [0, 0, 3]], [[3, 0, 0], [0, 1, 3], [3, 3, 0]], [[3, 0, 0],
        [3, 1, 3], [0, 3, 0]], [[0, 3, 0], [3, 1, 3], [0, 3, 0]], [[3, 0, 3], [0, 1, 0], [3, 0, 3]]];

const player2Tiles = [[[3, 3, 3], [0, 2, 3], [0, 0, 0]], [[3, 3, 3], [0, 2, 0], [0, 0, 3]], [[3, 3, 3], [0, 2, 0], [0, 3, 0]], [[3, 3, 3], [0, 2, 0], [3, 0, 0]], [[3, 3, 3],
        [3, 2, 0], [0, 0, 0]], [[3, 3, 0], [0, 2, 3], [0, 0, 3]], [[3, 3, 0], [0, 2, 3], [0, 3, 0]], [[3, 3, 0], [0, 2, 3], [3, 0, 0]], [[3, 3, 0], [3, 2, 3],
        [0, 0, 0]], [[3, 3, 0], [0, 2, 0], [0, 3, 3]], [[3, 3, 0], [0, 2, 0], [3, 0, 3]], [[3, 3, 0], [3, 2, 0], [0, 0, 3]], [[3, 3, 0], [0, 2, 0], [3, 3, 0]],
    [[3, 3, 0], [3, 2, 0], [0, 3, 0]], [[3, 0, 0], [0, 2, 3], [3, 0, 3]], [[3, 0, 0], [3, 2, 3], [0, 0, 3]], [[3, 0, 0], [0, 2, 3], [3, 3, 0]], [[3, 0, 0],
        [3, 2, 3], [0, 3, 0]], [[0, 3, 0], [3, 2, 3], [0, 3, 0]], [[3, 0, 3], [0, 2, 0], [3, 0, 3]]];

const emptyTile = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
const initBoard = [[emptyTile]];
const maxPlayTime = 60; //in seconds

/**
 * Game. This class represents the game. It stores all the necessary information regarding the state of the game, e.g., the board, the players' tiles and all the plays that have been made (used for game movie). It is created every time a game starts.
 * @constructor
 */
function Game(scene, selectedScene)
{
    this.scene = scene;
    this.selectedScene = selectedScene;
    this.init();
    this.winner = null;
    this.listOfPlays = [];
};
Game.prototype.stateMachine;

/**
 * This function initializes the game. It is called by the constructor and the everytime a game movie starts playing (can be used to reset the game to its initial state without creating a new instance of the Game class).
 */
Game.prototype.init = function ()
{
    this.createTilesTextures();
    this.currState = 1;
    this.currPlayer = 1;
    this.currPlayNumMinutes = 0;
    this.currPlayNumMiliSeconds = 0;
    this.currBoardMatrix = initBoard;
    this.currBoard = this.createBoardFromMatrix(this.currBoardMatrix);
    this.setBoardTilesPos(this.currBoard);
    this.player1Tiles = this.createTilesGivenTilesMatrixes(player1Tiles);
    this.setTilesPosPlayer1Box();
    this.setTilesAsPickable(this.player1Tiles);
    this.player2Tiles = this.createTilesGivenTilesMatrixes(player2Tiles);
    this.setTilesPosPlayer2Box();

    this.tilePicked = false;
    this.tilePickedObj = null;

    this.dropCellPicked = false;
    this.dropCellPickedObj = null;

    this.prologResponse = null;

    this.timeSinceErrorMessageActive = 0;
    this.isErrorMessageActive = false;
    this.isPaused = false;
    this.movingTiles = [];


}

/**
 * This function is responsible for implementing the code necessary to communicate with the logic of the game, implemented in prolog.
 * It sends the list it receives as parameter to prolog, performing the adequate encoding using json functions.
 */
Game.prototype.sendRequestToProlog = function (messageToProlog)
{
    let JsonRequest = JSON.stringify(messageToProlog);
    let requestPort = 8081;
    let request = new XMLHttpRequest();
    request.open('GET', 'http://127.0.0.1:8081' + '/' + JsonRequest, true);
    request.onload = (function (response) {

        this.prologResponse = JSON.parse(response.target.response);
        if (this.prologResponse[0] === -1)
            return;

        if (this.prologResponse.length === 3) //indicates that is response to human request
            Human.handlePrologResponse(this);
        else
            Computer.handlePrologResponse(this);

    }).bind(this);
    request.onerror = (function () {
        this.serverError = true;
        backToMenuFromGame(); 
    }).bind(this);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

/**
 * Returns the current players' tiles, i.e., a array with two arrays.
 * Each sub array represents the set of tiles that each currently has available to play the game.
 */
Game.prototype.getCurrPlayersTiles = function ()
{
    return [this.player1Tiles.slice(), this.player2Tiles.slice()];
}

/**
 * Sets the current players' tiles. Receives the new tiles to be set in the form of an array with two arrays.
 * Each sub array represents the set of tiles that each currently has available to play the game.
 */
Game.prototype.setCurrPlayersTiles = function (newPlayerTiles)
{
    this.player1Tiles = newPlayerTiles[0].slice();
    this.player2Tiles = newPlayerTiles[1].slice();
}

/**
 * Reverses all the tiles' animations it receives as parameter, by calling the adequate method of the class Tile.
 * It is for undo used to perform an animation with the reverse direction of the play, i.e., the tile moving from the board to the box of tile of the player.
 */
Game.prototype.reverseTilesAnimation = function (tiles)
{
    for (let i = 0; i < tiles.length; i++)
    {
        if (tiles[i].posBeforeAnimation != null && tiles[i].placeOnBoardATEOfAnimation)
        {
            tiles[i].startReverseAnimation();
            tiles[i].placeOnBoardATEOfAnimation = false;
            this.movingTiles.push(tiles[i]);
        }
    }
}

/**
 * Reverts the last play (undo). Performs an animation of the tile going back to the place it came from (the reverse aniamtion of the animation performed when the play ocurred).
 * Performs all the necessary changes in the Game class internal state so it goes back to the state where it before the play was made, so that performing the undo.
 */
Game.prototype.undoLastPlay = function ()
{
    if(this.isPaused)
        return;
    if (this.currState == 7 || this.currState == 8 || this.playingGameMovie)
        return;
    let lastPlay = this.listOfPlays.pop();
    if (lastPlay == null)
        return;
    let tile = lastPlay.tilePlayed;
    let preLastPlayIdx = this.listOfPlays.length - 1;
    if (preLastPlayIdx < 0)
    {
        this.movingTiles.push(tile);
        tile.startReverseAnimation();
        this.undoing = true;
        this.cameraController.startMovingCamera180Degrees();
        return;
    }
    let preLastPlay = this.listOfPlays[preLastPlayIdx];
    this.commitPlay(preLastPlay);
    this.reverseTilesAnimation(this.player1Tiles);
    this.reverseTilesAnimation(this.player2Tiles);
    preLastPlay.tilePlayed.placeOnBoardATEOfAnimation = true;
    preLastPlay.tilePlayed.startMovingAnimationToAux(preLastPlay.destinationTableCoords);
}

/**
 * Plays the current game movie play. Performs all the necessary updates in Game class' internal state, changing it according to the play that should be reproduced, i.e., commits the play to the Game class.
 */
Game.prototype.playCurrGameMoviePlay = function ()
{
    let play = this.listOfPlays[this.gameMovieCurrPlayIdx];
    this.commitPlayAndSetUpAnimation(play);
}

/**
 * Toggles the pause. If the game is currently paused, unpauses it. If the game is currently running, pauses it.
 * Stops the turn time counter so that the player currently playing never looses the turn until the game is unpaused.
 * Also works with animations, i.e., when the game stop, all animations stop.
 * Starting a game movie overrides the pause state, setting the game running again. The game is not paused in the end of the movie, in case it has not ended yet.
 */
Game.prototype.togglePause = function ()
{
    if(this.isPaused)
        this.isPaused = false;
    else
        this.isPaused = true;
}

/**
 * Performs all the necessary changes in Game's internal state to start playing the game movie. Starts all the mechanism necessary to play the game movie.
 */
Game.prototype.startPlayingGameMovie = function ()
{
    this.stateBeforeGameMovie = this.currState;
    if(this.movingTiles.length != 0)
        this.finishAllTilesAnimations();
    this.init();
    this.currState = 8;
    this.playingGameMovie = true;
    if (this.listOfPlays.length == 0)
        return;
    this.gameMovieCurrPlayIdx = 0;
    for (let i = 0; i < this.listOfPlays.length; i++)
        this.listOfPlays[i].destinationTableCoords = this.listOfPlays[i].destinationTableCoords.slice();
    let play = this.listOfPlays[this.gameMovieCurrPlayIdx];
    play.destinationTableCoords = play.destinationTableCoords.slice();
    this.setCurrPlayersTiles(play.playersTilesBoxesBeforePlay);
    this.setTilesPosPlayer1Box();
    this.setTilesPosPlayer2Box();
    this.setBoardTilesPos(this.currBoard);
    this.commitPlayAndSetUpAnimation(play);
}

/**
 * Performs all the necessary changes in Game's internal state to start playing the next play of the game and all the animations associated with it.
 */
Game.prototype.jumpToNextPlayOfGameMovie = function ()
{
    this.gameMovieCurrPlayIdx++;
    if (this.gameMovieCurrPlayIdx >= this.listOfPlays.length)
    {
        this.playingGameMovie = false;
        return;
    }
    this.playCurrGameMoviePlay();
}

/**
 * Memorizes a play that will, eventually, later be commited (thus performing the changes in Game's internal state according to that play).
 * Does not perform any changes in Game's internal state, only memorizes a play. That play may never be commited, not performing any changes to the internal state, however this never hapenns in the code on this project.
 */
Game.prototype.prepareForPlay = function (play)
{
    this.currPlay = play;
}

/**
 * Returns the play memorized and passed as parameter to prepareForPlay function.
 */
Game.prototype.getCurrPlay = function ()
{
    return this.currPlay;
}

/**
 * Calls the function commitPlayAndSetUpAnimation, which:
 * Performs all the changes in the internal state to effectivate a play, i.e., changes game internal info according to the play made so the game knows a play was made.
 * It commits the play. If this function is not called, any mechanism regarding a play will have no effect in the Game's internal state.
 * This function is entirely responsible for performing changes in the game state according to plays that are made.
 * Thus, it can be used to commit a play that has just been made, to replay a play (in game movie) or undoing a play (the pre-last play is committed on that case).
 * And sets up the animation regarding the play that will be commited.
 * In addition, it remembers the play, i.e., adds it to the array listOfPlays, so that it can be used to play the gme movie or undoing later.
 * This function is only called to commit a play that has just been made by a player and is never called for the game movie or the undo.
 */
Game.prototype.commitPlayAndRememberIt = function (play)
{
    this.commitPlayAndSetUpAnimation(play);
    this.listOfPlays.push(play);
}

/**
 * Calls the function commitPlay, which:
 * Performs all the changes in the internal state to effectivate a play, i.e., changes game internal info according to the play made so the game knows a play was made.
 * It commits the play. If this function is not called, any mechanism regarding a play will have no effect in the Game's internal state.
 * This function is entirely responsible for performing changes in the game state according to plays that are made.
 * Thus, it can be used to commit a play that has just been made, to replay a play (in game movie) or undoing a play (the pre-last play is committed on that case).
 * In addition, it sets up the animation regarding the play that will be commited.
 */
Game.prototype.commitPlayAndSetUpAnimation = function (play)
{
    this.commitPlay(play);
    play.tilePlayed.placeOnBoardATEOfAnimation = true;
    this.startMovingTile(play.tilePlayed, play.destinationTableCoords);
    play.tilePlayed.deactivateShader();
    play.tilePlayed.startMovingAnimationTo(play.destinationTableCoords);
}

/**
 * Performs all the changes in the internal state to effectivate a play, i.e., changes game internal info according to the play made so the game knows a play was made.
 * It commits the play. If this function is not called, any mechanism regarding a play will have no effect in the Game's internal state.
 * This function is entirely responsible for performing changes in the game state according to plays that are made.
 * Thus, it can be used to commit a play that has just been made, to replay a play (in game movie) or undoing a play (the pre-last play is committed on that case).
 */
Game.prototype.commitPlay = function (play)
{
    this.currBoardMatrix = play.newBoardMatrix;
    this.currBoard = play.newBoard;
    this.lastPlacedTileBoardCoords = play.destinationBoardCoords.slice();
    this.setCurrPlayersTiles(play.playersTilesBoxesBeforePlay);
    this.removeTileFromPlayer(play.tilePlayed, play.currPlayer);
    this.currPlayer = play.nextPlayer;
    if(!this.playingGameMovie)
        this.currState = play.nextState;
    this.setPickableAttributesAccordingToPlay(play);
    this.resetPlayTime();
    this.cameraController.startMovingCamera180Degrees();
}

/**
 * Starts moving a tile. Performs all the changes in the Game's internal state necessary to start moving the tile received in the first parameter to the destination pos recceived as second parameter (passed as an array).
 */
Game.prototype.startMovingTile = function (tile, dstPos)
{
    tile.startMovingAnimationTo(dstPos);
    this.movingTiles.push(tile);
}

/**
 * Sets the pickable attributes of the all the tiles currently in the game, according to the play it receives as parameter, preparing the pickable attributes for the next play.
 * I.e., sets all the board tiles as not pickable. Sets the (player that lost the turn)'s tiles as not pickable. Sets the (player that will play next)'s tiles as pickable.
 * This method is called by the commitPlay function.
 */
Game.prototype.setPickableAttributesAccordingToPlay = function (play)
{
    if (this instanceof ComputerComputer)
        return;

    this.setTilesAsNotPickable(this.getPlayerTiles(play.currPlayer));
    this.setTilesAsNotPickable(this.getAllEmptyBoardTiles());
    this.setTilesAsPickable(this.getPlayerTiles(play.nextPlayer));
}

/**
 * Returns an array representing the set of tiles of the player that is currently playing (the one which owns the turn to play).
 */
Game.prototype.getCurrPlayerTiles = function ()
{
    return this.getPlayerTiles(this.currPlayer);
}

/**
 * Returns the number of the player that is currently not playing (the one that currently doesn't own the turn to play).
 */
Game.prototype.getOtherPlayer = function ()
{
    if (this.currPlayer == 1)
        return 2;
    else
        return 1;
}

/**
 * Returns an array representing the set of tiles of the player that is currently not playing (the one that currently doesn't own the turn to play).
 */
Game.prototype.getOtherPlayerTiles = function ()
{
    return this.getPlayerTiles(this.getOtherPlayer());
}

/**
 * Returns an array representing the set of tiles of the player corresponding to the number it receives as parameter.
 */
Game.prototype.getPlayerTiles = function (player)
{
    if (player == 1)
        return this.player1Tiles;
    else
        return this.player2Tiles;
}

/**
 * Returns the tile (object of class Tile) representing the Tile of the player corresponding to the number it receives as parameter that has the shader active (indicating that it is selected and was picked)
 */
Game.prototype.getTileFromPlayerWithShaderActive = function (player)
{
    let tilesMatrix = this.getPlayerTiles(player);
    for (let i = 0; i < tilesMatrix.length; i++)
        if (tilesMatrix[i].hasShaderActive())
            return tilesMatrix[i];

    return null;
}

/**
 * Returns an array representing the set of tiles (in form of matrix (bidemensional array)) of the player that is currently playing (the one which owns the turn to play).
 */
Game.prototype.getCurrPlayerTilesMatrix = function ()
{
    return this.getPlayerTilesMatrix(this.currPlayer);
}

/**
 * Returns an array representing the set of tiles (in form of matrix (bidemensional array)) of the player that is currently playing (the one which owns the turn to play).
 */
Game.prototype.getPlayerTilesMatrix = function (player)
{
    if (player == 1)
        return this.getTilesMatrix(this.player1Tiles);
    else
        return this.getTilesMatrix(this.player2Tiles);
}

/**
 * Returns an array representing the set of tiles (in form of matrix (bidemensional array)) of the player that is currently playing (the one which owns the turn to play).
 */
Game.prototype.getTilesMatrix = function (tiles)
{
    let tilesMatrix = [];
    for (let i = 0; i < tiles.length; i++)
        tilesMatrix.push(tiles[i].getMatrix());

    return tilesMatrix;
}

/**
 * Returns the tile that has the tile matrix given as parameter, making all possible rotations (0, 90, 180 e 270 degrees) on the tile matrix.
 */
Game.prototype.getTileInTilesArrayRotatingTile = function (tiles, tileMatrix)
{
    for (let i = 0; i < tiles.length; i++)
    {
        let tileCopy = new Tile(this.scene, tiles[i].getMatrix(), null, null, null, null, null, null);
        for (let j = 0; j < 4; j++)
        {
            if (j != 0)
                tileCopy.rotate();
            let currAcum = 0;
            let currTileMatrix = tileCopy.getMatrix();
            for (let k = 0; k < currTileMatrix.length; k++)
                for (let w = 0; w < currTileMatrix.length; w++)
                    if (currTileMatrix[k][w] == tileMatrix[k][w])
                        currAcum++;

            if (currAcum == 9)
            {
                tiles[i].setMatrix(tileCopy.getMatrix());
                return tiles[i];
            }
        }
    }
}

/**
 * Returns the board currently stored in Game class. Represents the current state of the board.
 * The board is return in the form of a matrix (bidimensional array) of Tiles (objects of class Tile).
 */
Game.prototype.getBoard = function ()
{
    return this.currBoard;
}

/**
 * Sets the tile currently in the game board received as first parameter, at the coords received as second parameter (received as an array) as invisible.
 * The tile is an object of class Tile, representing a tile in the game.
 */
Game.prototype.setTileMatrixAsInvisible = function (board, coords)
{
    board[coords[1]][coords[0]].setInvisible();
}

/**
 * Sets the tiles' it receives as parameter as not pickable, indicanting that they can't be picked by the user.
 * The tiles should be passed as an array of class Tile.
 */
Game.prototype.setTilesAsNotPickable = function (tiles)
{
    for (let i = 0; i < tiles.length; i++)
        tiles[i].setAsNotPickable();
}

/**
 * Sets the tiles' it receives as parameter as not pickable, indicanting that they can be picked by the user.
 * The tiles should be passed as an array of class Tile.
 */
Game.prototype.setTilesAsPickable = function (tiles)
{
    for (let i = 0; i < tiles.length; i++)
        tiles[i].setAsPickable();
}

/**
 * Returns all the tiles that are currently empty in the game board. The tiles are returned in the form of an array of objects of class Tile.
 */
Game.prototype.getAllEmptyBoardTiles = function ()
{
    let emptyTile = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let emptyTiles = [];
    for (let i = 0; i < this.currBoard.length; i++)
        for (let j = 0; j < this.currBoard[i].length; j++)
            if (this.currBoard[i][j].getMatrix().equals(emptyTile))
                emptyTiles.push(this.currBoard[i][j]);

    return emptyTiles;
}

/**
 * Returns the board coords of the cell it receives as parameter, searching in the board of tiles for the corresponding cell matrix. 
 * The coords are returned in the form of an array of 2 elements (2D coords).
 */
Game.prototype.getBoardCoordsOfCell = function (board, cell)
{
    let cellMatrix = cell.getMatrix();
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board[i].length; j++)
        {
            let currAcum = 0;
            let currCellMatrix = board[i][j].getMatrix();
            for (let k = 0; k < currCellMatrix.length; k++)
                for (let w = 0; w < currCellMatrix.length; w++)
                    if (currCellMatrix[k][w] == cellMatrix[k][w])
                        currAcum++;

            if (currAcum == 9)
                return [j, i];
        }
}

/**
 * Returns the board coords of the cell it receives as parameter searching in the board of tiles matrixes for the corresponding cell matrix.
 * The coords are returned in the form of an array of 2 elements (2D coords).
 */
Game.prototype.getMatrixBoardCoordsOfCell = function (boardMatrix, cell)
{
    let cellMatrix = cell.getMatrix();
    for (let i = 0; i < boardMatrix.length; i++)
        for (let j = 0; j < boardMatrix[i].length; j++)
        {
            let currAcum = 0;
            let currCellMatrix = boardMatrix[i][j];
            for (let k = 0; k < currCellMatrix.length; k++)
                for (let w = 0; w < currCellMatrix.length; w++)
                    if (currCellMatrix[k][w] == cellMatrix[k][w])
                        currAcum++;

            if (currAcum == 9)
                return [j, i];
        }
}

/**
 * Returns the board coords of the cell matrix it receives as parameter searching in the board of tiles matrixes for the corresponding cell matrix.
 * The coords are returned in the form of an array of 2 elements (2D coords).
 */
Game.prototype.getMatrixBoardCoordsOfCellMatrix = function (board, cellMatrix)
{
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board[i].length; j++)
        {
            let currAcum = 0;
            let currCellMatrix = board[i][j];
            for (let k = 0; k < currCellMatrix.length; k++)
                for (let w = 0; w < currCellMatrix[k].length; w++)
                    if (currCellMatrix[k][w] == cellMatrix[k][w])
                        currAcum++;

            if (currAcum == 9)
                return [j, i];
        }
}

/**
 * Removes the tile received as parameter from the list of tiles of the player that is currently playing (the one who owns the turn to play).
 * The tile is passed in the form of an object of class Tile.
 */
Game.prototype.removeTileFromCurrPlayer = function (tilePicked)
{
    this.removeTileFromPlayer(tilePicked, this.currPlayer);
}

/**
 * Removes the tile received as first parameter from the list of tiles of the player corresponding to the number it receives as second parameter.
 * The tile is passed in the form of an object of class Tile.
 */
Game.prototype.removeTileFromPlayer = function (tile, player)
{
    let playerTiles = this.getPlayerTiles(player);
    let index = playerTiles.indexOf(tile);
    if (index != -1)
        playerTiles.splice(index, 1);
}

/**
 * Removes the tile received as parameter from the list of tiles of the player that is currently playing (the one who owns the turn to play).
 * The tile is passed in the form of a matrix (bidemensional array) representing the tile (matrix representation of the tile).
 */
Game.prototype.removeTileWithMatrixFromCurrPlayer = function (tileMatrix)
{
    let currPlayerTilesMatrixes = this.getCurrPlayerTilesMatrix();
    let index = currPlayerTilesMatrixes.indexOf(tileMatrix);
    if (index != -1)
        currPlayerTilesMatrixes.splice(index, 1);
}

/**
 * Performs all the necessary changes in the game to display the end game info and the winner of the game.
 */
Game.prototype.setEndOfGameStyle = function (winner)
{
    endOfGameStyle(winner);
    this.currState = 20; //to an undefined state (default in state machine)
}

/**
 * Performs all the necessary changes in the game to go back to the game. This function is called to leave the state of displaying the end game info.
 */
Game.prototype.backToGameStyle = function ()
{
    //remove elements
    let elements = document.getElementsByClassName("endOfGameStyle");
    for(let i = 0; i < elements.length; i++)
        elements[i].remove();
    document.getElementById('endOfGameTitle').remove();
}

/**
 * Updates the Game's internal state based on time. It receives, in milliseconds, the elapsed time since the last time the function was called.
 * The time must be relative to the last time the function was called and can be any value as long as it is in milliseconds.
 * It is used to controll everything in the game that is based in time: animations, state machine, turn time couting, etc.
 */
Game.prototype.update = function (elapsedTime)
{
    if(this.isPaused)
        return;
    this.stateMachine();

    for (let i = 0; i < this.movingTiles.length; i++)
        this.updateMovingTile(this.movingTiles[i], elapsedTime, i);

    if (this.isErrorMessageActive)
    {
        this.timeSinceErrorMessageActive += elapsedTime;
        if (this.timeSinceErrorMessageActive >= 5000)
        {
            this.isErrorMessageActive = false;
            this.timeSinceErrorMessageActive = 0;
            this.removeErrorMessage();
        }
    }

    if (this.movingTiles.length == 0 && this.winner == null)
        this.updateCurrPlayTime(elapsedTime);
    this.displayCurrPlayTime();
    this.checkPlayTimeOver();
}

/**
 * This function is called by the function update. It is responsible for performing a part of the job of the update function: updating all the information regarding a moving tile.
 * It is called (by the update function) for each moving tile in the game.
 * The Game supports multiple animations running at the same time.
 */
Game.prototype.updateMovingTile = function (movingTile, elapsedTime, idx)
{
    if (movingTile != null)
    {
        if (movingTile.update(elapsedTime) == "finished")
            this.finishMovingTileAnimation(movingTile, idx);
    }
}

/**
 * Performs all the necessary actions to terminate the animation of the first moving tile in the array of moving tiles.
 */
Game.prototype.finishCurrMovingTileAnimation = function ()
{
    let tile = this.movingTiles[0];
    if (tile == null)
        return;
    this.finishMovingTileAnimation(tile, 0);
}

/**
 * Performs all the necessary actions to terminate all the animations in course.
 */
Game.prototype.finishAllTilesAnimations = function ()
{
    for(let i = 0; i < this.movingTiles.length; i++)
        this.finishMovingTileAnimation(this.movingTiles[i], i);
}

/**
 * Performs all the necessary actions to terminate the animation that the Tile it receives as first parameter is currently performing. The second parameter is the idx of the Tile (respective to the movingTiles array) of the class Game.
 */
Game.prototype.finishMovingTileAnimation = function (movingTile, idx)
{
    if (movingTile != null)
    {
        movingTile.finishCurrAnimation();
        if (movingTile.placeOnBoardATEOfAnimation)
        {
            let x = this.lastPlacedTileBoardCoords[0];
            let y = this.lastPlacedTileBoardCoords[1];
            this.currBoard[y][x] = movingTile;
            this.currBoardMatrix[y][x] = movingTile.getMatrix();
        }

        this.movingTiles.splice(idx, 1);
        if (this.playingGameMovie)
            this.jumpToNextPlayOfGameMovie();
    }

    if (this.movingTiles.length == 0)
        if (this.undoing == true)
        {
            this.undoing = false;
            this.init();
        }
}

/**
 * This function is called by the state machine of game until all the animations ins course are finished. 
 * When that happens it changes the state to the nextState given as parameter or to the stateInCaseOfEndOfGame (as parameter too) in case we have a winner.
 */
Game.prototype.waitForEndOfAnimation = function (nextState, stateInCaseOfEndOfGame)
{
    if (this.movingTiles.length == 0)
    {
        if(this.winner == null)
            this.currState = nextState;
        else
            this.currState = stateInCaseOfEndOfGame;
    }
}

/**
 * This function is called by the state machine of game until the game movie is over. 
 * When that happens it changes the state to the stateBeforeGameMovie or to an undefined state, default in state machine, in case we have a winner.
 */
Game.prototype.waitForEndOfGameMovie = function ()
{
    if (this.playingGameMovie == false)
    {
        if(this.winner != null)
        {
            this.setEndOfGameStyle(this.winner);
            this.currState = 20;
            return;
        }
        else
            this.currState = this.stateBeforeGameMovie;
    }
}

/**
 * This function is called in order to display the moving tiles in the scene.
 */
Game.prototype.displayMovingTiles = function ()
{
    for (let i = 0; i < this.movingTiles.length; i++)
        this.movingTiles[i].display();
}

/**
 * This function is called in order to display player 1 tiles in the box of available tiles to play.
 */
Game.prototype.displayPlayer1Tiles = function ()
{
    this.displayPlayerTiles(this.player1Tiles);
}

/**
 * This function is called in order to display player 2 tiles in the box of available tiles to play.
 */
Game.prototype.displayPlayer2Tiles = function ()
{
    this.displayPlayerTiles(this.player2Tiles);
}

/**
 * This function is called in order to display player tile in the box of available tiles to play. If pickables the tiles as also registered for picking.
 * It receives the array of tiles to display.
 */
Game.prototype.displayPlayerTiles = function (playerTiles)
{
    for (let i = 0; i < playerTiles.length; i++)
    {
        if (playerTiles[i].isPickable)
        {
            let tile = playerTiles[i];
            this.scene.registerForPick(tile.id, tile);
        }
        playerTiles[i].display();
    }
}

/**
 * This function is called in order to display board (matrix of tiles). If pickables the tiles as also registered for picking.
 */
Game.prototype.displayBoard = function ()
{
    for (let i = 0; i < this.currBoard.length; i++)
    {
        let currLineLength = this.currBoard[i].length;
        for (let j = 0; j < currLineLength; j++)
        {
            let tile = this.currBoard[i][j];
            if (tile.isPickable)
            {
                this.scene.registerForPick(tile.id, tile);
            }
            tile.display();
        }
    }
}

/**
 * This function creates an array of tiles with the matrixes given an parameter.
 * Returns the array of created tiles.
 */
Game.prototype.createTilesGivenTilesMatrixes = function (tilesMatrixes)
{
    let tilesList = [];
    for (let i = 0; i < tilesMatrixes.length; i++)
        tilesList.push(new Tile(this.scene, tilesMatrixes[i], null, this.player1TileTexture, this.player2TileTexture, this.whiteTexture, this.blackTexture, this.selectedTileTexture));

    return tilesList;
}

/**
 * This function sets the atribute pos of each of the tiles of player 1, in order to display them.
 */
Game.prototype.setTilesPosPlayer1Box = function ()
{
    let playerTilesWidth = (this.player1Tiles.length / 10) * (cellSize + cellSize / 1.5);
    let startPosX = 0.25;
    this.setTilesPosPlayerBox(this.player1Tiles, startPosX);
}

/**
 * This function sets the atribute pos of each of the tiles of player 2, in order to display them.
 */
Game.prototype.setTilesPosPlayer2Box = function ()
{
    let playerTilesWidth = (this.player2Tiles.length / 10) * (cellSize + cellSize / 1.5);
    let startPosX = tableWidth - 1;
    this.setTilesPosPlayerBox(this.player2Tiles, startPosX);
}

/**
 * This function sets the atribute pos of each of the tiles received as parameter using startPosX and other pre-defined constants with board and table measures.
 * Must be used only for tiles that will be displayed in the box of one of the players.
 */
Game.prototype.setTilesPosPlayerBox = function (tiles, startPosX)
{
    let numTiles = tiles.length;
    if (numTiles > 10)
        numTiles = 10;

    let startPos = [0, 0];
    startPos[0] = startPosX;

    let playerTilesHeight = (tiles.length / 2) * cellSize + ((tiles.length - 1) / 2) * cellSize / 1.5;
    startPos[1] = (tableLength - playerTilesHeight) / 2;

    let currPos = startPos.slice();
    for (let i = 0; i < tiles.length; i++)
    {
        tiles[i].placeThatBelongsTo = "box";
        if (i % 2 == 0) //in order to change line and carriage return, 2 tiles per line, 10 cols of tiles, 20 tiles total
        {
            currPos[0] = startPos[0];
            currPos[1] = startPos[1] + (i / 2) * (cellSize + cellSize / 1.5);
        }

        tiles[i].setPos(currPos[0], currPos[1]);
        currPos[0] += cellSize + cellSize / 2;
    }
}

/**
 * This function creates based on the array of tile matrixes (boardMatrix) given by parameter, the board matrixes of tile instances.
 */
Game.prototype.createBoardFromMatrix = function (boardMatrix)
{
    let board = [];
    for (let i = 0; i < boardMatrix.length; i++)
    {
        let boardLine = [];
        for (let j = 0; j < boardMatrix[i].length; j++)
        {
            if (boardMatrix[i][j] != null)
            {
                let tile = (new Tile(this.scene, boardMatrix[i][j], null, this.player1TileTexture, this.player2TileTexture, this.whiteTexture, this.blackTexture, this.selectedTileTexture));
                tile.placeThatBelongsTo = "board";
                boardLine.push(tile);
            } else
                boardLine.push(null);
        }
        board.push(boardLine);
    }

    return board;
}

/**
 * This function sets the atribute pos of each of the tiles created based on the array of tiles (board) given by parameter, using pre-defined constants with board and table measures.
 * Must be used only for tiles that will be displayed in the board.
 */
Game.prototype.setBoardTilesPos = function (board)
{
    let boardHeight = board.length;
    let boardWidth = board[0].length;
    Table.computeBoardStartPos(boardHeight, boardWidth);
    let startPos = [boardStartPosX, boardStartPosY];

    let currPos = startPos.slice();
    for (let i = 0; i < board.length; i++)
    {
        for (let j = 0; j < board[i].length; j++)
        {
            board[i][j].setPos(currPos);
            currPos[0] += cellSize + cellSize / 2;
        }
        currPos[0] = startPos[0];
        currPos[1] += cellSize + cellSize / 2;
    }
}

/**
 * This function creates and displays an error message during game. The message is dispalyed after score board.
 */
Game.prototype.showErrorMessage = function (message)
{
    if (this.isErrorMessageActive)
        return;

    let errorMessageElement = document.createElement("div");
    errorMessageElement.id = "errorMessage";
    errorMessageElement.innerHTML = `<p> ` + message + ` </p>`;
    document.getElementsByClassName("score-board")[0].insertAdjacentElement('afterend', errorMessageElement);
    this.isErrorMessageActive = true;
}

/**
 * This function removed a pre-set error message from the screen.
 */
Game.prototype.removeErrorMessage = function ()
{
    let errorMessageElement = document.getElementById("errorMessage");
    if(errorMessageElement != null)
        errorMessageElement.remove();
}

/**
 * This function cancels last pick of a tile in box of tiles by one of the players. It deactivates the sahder used in the tile.
 */
Game.prototype.cancelLastPick = function ()
{
    if (!this instanceof HumanHuman && !this instanceof HumanComputer)
        return;
    if (this.currState != 2 && this.currState != 5)
        return;

    this.tilePicked = false;
    this.tilePickedObj.deactivateShader();
    this.setTilesAsPickable(this.getCurrPlayerTiles());
    this.setTilesAsNotPickable(this.getAllEmptyBoardTiles());
    if (this instanceof HumanHuman)
        this.setCurrPlayerStateAsPickTile();
    else
        this.currState = 1;
}

/**
 * This function sets the state as the pick tile from the box of tiles, taking into account the curr player.
 */
Game.prototype.setCurrPlayerStateAsPickTile = function ()
{
    if (this.currPlayer == 1)
        this.currState = 1;
    else
        this.currState = 3;
}

/**
 * This function rotates the picked tile, invoking rotate internal method from tile class.
 */
Game.prototype.rotateTile = function ()
{
    if ((this.currPlayer == 1 && this.currState != 2) || (this.currPlayer == 2 && this.currState != 5) || this.tilePickedObj == null)
        return;

    this.tilePickedObj.rotate();
}

/**
 * This function creates the textures used to the tiles. It takes into account the curr scene.
 * Creates the five necessary tiles: player1TileTexture, player2TileTexture, selectedTileTexture, whiteTexture and blackTexture.
 */
Game.prototype.createTilesTextures = function ()
{
    //create player1 texture
    this.player1TileTexture = new CGFappearance(this.scene);
    this.player1TileTexture.setSpecular(0.7, 0.7, 0.7, 1);
    this.player1TileTexture.setDiffuse(0.1, 0.1, 0.1, 1);
    this.player1TileTexture.setShininess(1);

    //create player2 texture
    this.player2TileTexture = new CGFappearance(this.scene);
    this.player2TileTexture.setSpecular(0.7, 0.7, 0.7, 1);
    this.player2TileTexture.setDiffuse(0.1, 0.1, 0.1, 1);
    this.player2TileTexture.setShininess(1);

    //create tile selection texture
    this.selectedTileTexture = new CGFappearance(this.scene);
    this.selectedTileTexture.setSpecular(0.7, 0.7, 0.7, 1);
    this.selectedTileTexture.setDiffuse(0.1, 0.1, 0.1, 1);
    this.selectedTileTexture.setShininess(1);
 
    if(this.selectedScene == 'Classic')
    {
        this.player1TileTexture.loadTexture("scenes/images/marmore_branca.png");
        this.player2TileTexture.loadTexture("scenes/images/tileplayer2Texture2.png");
        this.selectedTileTexture.loadTexture("scenes/images/selectedTile2.png");

        this.whiteTexture = new CGFappearance(this.scene);
        this.whiteTexture.setSpecular(0.7, 0.7, 0.7, 1);
        this.whiteTexture.setDiffuse(0.1, 0.1, 0.1, 1);
        this.whiteTexture.setShininess(1);
        this.whiteTexture.loadTexture("scenes/images/marmore_branca.png");        
        
        this.blackTexture = new CGFappearance(this.scene);
        this.blackTexture.setSpecular(0.7, 0.7, 0.7, 1);
        this.blackTexture.setDiffuse(0.1, 0.1, 0.1, 1);
        this.blackTexture.setShininess(1);
        this.blackTexture.loadTexture("scenes/images/marmore_preta.png");  
    }
    else
    {
        this.player1TileTexture.loadTexture("scenes/images/marmore_branca.png");
        this.player2TileTexture.loadTexture("scenes/images/marmore_preta.png");
        this.selectedTileTexture.loadTexture("scenes/images/selectedTile1.png"); 
        this.whiteTexture = this.player1TileTexture;
        this.blackTexture = this.player2TileTexture;
    }
}

/**
 * This function displays on the screen the curr time of play, in minutes and seconds. When 15 seconds to the maxPlayTime the color of the numbers changes to red.
 */
Game.prototype.displayCurrPlayTime = function ()
{
    let m = this.currPlayNumMinutes; // 0 - ...
    let s = Math.floor(this.currPlayNumMiliSeconds / 1000); // 0 - 59

    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    let time = m + ":" + s;

    let timeElement = document.getElementsByClassName("time")[0];
    if(timeElement != null)
    {
        timeElement.innerText = time;
        timeElement.textContent = time;
        
        if (s >= 45 || m >= 1)
            timeElement.style.color = "#7A0000";
        else
            timeElement.style.color = "#006680";
    }
}

/**
 * This function updates the curr play time. It updates the seconds and the minutes when necessary.
 */
Game.prototype.updateCurrPlayTime = function (elapsedTime)
{
    this.currPlayNumMiliSeconds += elapsedTime;
    if (this.currPlayNumMiliSeconds >= 60000)
    {
        if (this.currPlayNumMiliSeconds > 60000)
            this.currPlayNumMiliSeconds -= 60000;
        else
            this.currPlayNumMiliSeconds = 0;

        this.currPlayNumMinutes++;
    }
}

/**
 * This function checks if the maxPlayTime is over. And if it is, it take the necessary actions, like show message, and change turn.
 */
Game.prototype.checkPlayTimeOver = function ()
{
    if (this.currPlayNumMinutes * 60 >= maxPlayTime)
    {
        this.resetPlayTime();
        this.setTilesAsNotPickable(this.getPlayerTiles(this.currPlayer));
        this.setTilesAsNotPickable(this.getAllEmptyBoardTiles());
        this.currPlayer = this.getOtherPlayer();
        this.setTilesAsPickable(this.getPlayerTiles(this.currPlayer));
        this.currState = this.nextStartState();
        let tilePicked = this.getTileFromPlayerWithShaderActive(this.getOtherPlayer());
        if (tilePicked != null)
            tilePicked.deactivateShader();
        this.showErrorMessage("Time's up! You Lost The Turn!");
        this.cameraController.startMovingCamera180Degrees();
    }
}

/**
 * This function reset the time of play to zero.
 */
Game.prototype.resetPlayTime = function ()
{
    this.currPlayNumMiliSeconds = 0;
    this.currPlayNumMinutes = 0;
}

/**
 * This function overloads the equals used by Javasript, in order to compare arrays, comparing the length and the elements, instead of the pointer.
 */
Array.prototype.equals = function (array) 
{
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) 
    {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) 
        {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        } 
        else if (this[i] != array[i]) 
        {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});