/**
 * Play. This class represents a play. It contains the changes in the Game internal state necessary to effectivate a play. The constructor receives all the information  regarding a play and sets all the respective attributes accordingly.
 * This is simply a storage class (it stores informations). Has no actions and, therefore, no methods.
 * @constructor
 */
function Play(newBoard, newBoardMatrix, destinationTableCoords,
        destinationBoardCoords, tilePlayed, playersTilesBoxesBeforePlay)
{
    this.newBoard = newBoard.slice();
    this.newBoardMatrix = JSON.parse(JSON.stringify(newBoardMatrix));
    this.destinationTableCoords = destinationTableCoords.slice();
    this.destinationBoardCoords = destinationBoardCoords.slice();
    this.tilePlayed = tilePlayed;
    this.playersTilesBoxesBeforePlay = playersTilesBoxesBeforePlay.slice();
};