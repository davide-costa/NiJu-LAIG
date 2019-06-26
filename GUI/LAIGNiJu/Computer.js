/**
 * Computer.  This class is responsable for making computer calls to IA in Prolog and handling responses, setting the game state accordingly.
 */
class Computer
{
    //Responsible for sending the request to prolog, and changing game state accordingly
    static sendRequestToProlog(Game, stateInCaseOfSucess)
    {
        let messageToProlog = [Game.level + 2, Game.currBoardMatrix, Game.getCurrPlayerTilesMatrix()];
        Game.sendRequestToProlog(messageToProlog);
        Game.currState = stateInCaseOfSucess;
    }
    
    //Responsible for handling the prolog xhtml request on load. It prepares some play info (according to prolog response) that will be necessary in OnPrologResponse function.
    static handlePrologResponse(Game)
    {
        let newBoardMatrix = Game.prologResponse[1];
        let tileToPlay = Game.getTileInTilesArrayRotatingTile(Game.getCurrPlayerTiles(), Game.prologResponse[3]);
        let placedTileBoardCoords = Game.getMatrixBoardCoordsOfCellMatrix(newBoardMatrix, Game.prologResponse[3]);
        let newBoard = Game.createBoardFromMatrix(newBoardMatrix);
        Game.setTileMatrixAsInvisible(newBoard, placedTileBoardCoords);
        Game.setBoardTilesPos(newBoard);
        let destinationTableCoords = Table.boardCoordsToTableCoords3D(placedTileBoardCoords);

        //commit play part
        let currPlayersTiles = Game.getCurrPlayersTiles();
        let play = new Play(newBoard, newBoardMatrix, destinationTableCoords,
                placedTileBoardCoords, tileToPlay, currPlayersTiles);
        Game.prepareForPlay(play);
    }
          
    //Responsible for handling the state of state machine that is called after prolog response. It alters the game accordingly.
    static OnPrologResponse(Game, nextPlayer, nextState)
    {
        if (Game.prologResponse != null)
        {
            //end of game when Prolog says so, or when tiles over
            if (Game.prologResponse[2] == 1 || (Game.getCurrPlayerTiles().length == 1 && Game.getOtherPlayerTiles().length == 0))
            {
                if (Game.getCurrPlayerTiles().length == 1 && Game.getOtherPlayerTiles().length == 0)
                    Game.winner = 'Draw! Tiles Over!';
                else
                    Game.winner = Game.currPlayer;
            } 
            Game.currState = nextState;
            Game.prologResponse = null;

            //commit play part
            let play = Game.getCurrPlay();
            play.currPlayer = Game.currPlayer;
            play.nextPlayer = nextPlayer;
            play.nextState = Game.currState;
            Game.commitPlayAndRememberIt(play);
        }
    }
}