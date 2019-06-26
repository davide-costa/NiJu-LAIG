/**
 * Human.  This class is responsable for hadling human state gaming. It handles user inputs (pick tile and pick drop place), setting the game state accordingly. 
 * Also sends and handles Prolog response to the requested move.
 */
class Human
{
    //Responsible for apply the expecetd action when a tile is picked. It verifies if the tile was in facrt picked.
    static handlePickTile(Game, stateInCaseOfSucess)
    {
        if (Game.tilePicked)
        {
            Game.tilePickedObj.activateShader();
            Game.setTilesAsNotPickable(Game.getCurrPlayerTiles());
            Game.setTilesAsPickable(Game.getAllEmptyBoardTiles());
            Game.currState = stateInCaseOfSucess;
            Game.tilePicked = false;
        }
    }

    //Responsible for handling the prolog xhtml request on load. It prepares some play info (according to prolog response) that will be necessary in OnPrologResponse function.           
    static handlePrologResponse(Game)
    {
        let newBoardMatrix = Game.prologResponse[1];
        let placedTileBoardCoords = Game.getMatrixBoardCoordsOfCell(newBoardMatrix, Game.tilePickedObj);
        let newBoard = Game.createBoardFromMatrix(newBoardMatrix);
        Game.setTileMatrixAsInvisible(newBoard, placedTileBoardCoords);
        Game.setBoardTilesPos(newBoard);
        let destinationTableCoords = Table.boardCoordsToTableCoords3D(placedTileBoardCoords);

        //commit play part
        let currPlayersTiles = Game.getCurrPlayersTiles();
        let play = new Play(newBoard, newBoardMatrix, destinationTableCoords,
                placedTileBoardCoords, Game.tilePickedObj, currPlayersTiles,
                Game.currBoard, Game.currBoardMatrix);
        Game.prepareForPlay(play);
    }

    //Responsible for handling a tile drop. It sends a request to prolog when a drop site was picked, and after prolog response, will handle the response and set game state accordingly.
    static handlePlaceTile(Game, stateInCaseOfFail, nextPlayer, nextState)
    {
        if (Game.dropCellPicked)
        {
            let boardHeight = Game.currBoard.length;
            let boardWidth = Game.currBoard[0].length;
            Table.computeBoardStartPos(boardHeight, boardWidth);
            let coords = Table.tableCoords3DToBoardCoords(Game.dropCellPickedObj.getPos()); //[Col, Row]
            let messageToProlog = [1, Game.currBoardMatrix, Game.tilePickedObj.getMatrix(), coords[1] + 1, coords[0] + 1];
            Game.sendRequestToProlog(messageToProlog);
            Game.dropCellPicked = false;
        } else if (Game.prologResponse != null)
        {
            Game.setTilesAsNotPickable(Game.getAllEmptyBoardTiles());
            if (Game.prologResponse[0] == -1)
            {
                Game.showErrorMessage("Invalid Play!");
                Game.prologResponse = null;
                Game.currState = stateInCaseOfFail;
                Game.setTilesAsPickable(Game.getCurrPlayerTiles());
                Game.tilePickedObj.deactivateShader();
                return;
            }

            if (Game.prologResponse[2] == 1 || (Game.getCurrPlayerTiles().length == 1 && Game.getOtherPlayerTiles().length == 0)) //end of game
            {
                if (Game.getCurrPlayerTiles().length == 1 && Game.getOtherPlayerTiles().length == 0)
                    Game.winner = 'Draw! Tiles Over!';
                else
                    Game.winner = Game.currPlayer;
            } 
            
            Game.currState = nextState;

            let play = Game.getCurrPlay();
            if (Game instanceof HumanHuman)
                Game.setTilesAsPickable(Game.getPlayerTiles(nextPlayer));

            Game.prologResponse = null;
            Game.resetPlayTime();

            play.currPlayer = Game.currPlayer;
            play.nextPlayer = nextPlayer;
            play.nextState = Game.currState;
            Game.commitPlayAndRememberIt(play);
        }
    }
}