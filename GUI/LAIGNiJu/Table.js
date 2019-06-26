/**
 * MySemiSphere. Represents a the table used to play the game on top of. Acts like an interface between the game board and the table.
 * Has some methods that allow conversion between cordinates of the board and the table (relative to the table's starting position).
 * @constructor
 */

let tableWidth = 0;
let tableLength = 0;
let boardStartPosX = 0; //the starting position x of the board, relative to the table
let boardStartPosY = 0; //the starting position y of the board, relative to the table
const cellSize = 0.3;

class Table
{
    /**
     * Converts board coords to table coords.
     * Receives the board coords to be convertes as parameter. The coords are received in the form of an array with 2 elements (2D coords).
     * Returns an array representing the table coords (relative to the starting position of the table) that correspond to the board coords receives as parameter.
     * The array returned has 2 elements (2D coords).
     */
    static boardCoordsToTableCoords(boardCoords)
    {
        let x = boardStartPosX + (cellSize + cellSize / 2) * boardCoords[0];
        let y = boardStartPosY + (cellSize + cellSize / 2) * boardCoords[1];
        return [x, y];
    }

    /**
     * Converts board coords to table coords.
     * Receives the board coords to be convertes as parameter. The coords are received in the form of an array with 2 elements (2D coords).
     * Returns an array representing the table coords (relative to the starting position of the table) that correspond to the board coords receives as parameter.
     * The array returned has 3 elements (3D coords).
     */
    static boardCoordsToTableCoords3D(boardCoords)
    {
        let Coords2D = this.boardCoordsToTableCoords(boardCoords);
        return [Coords2D[0], 0, Coords2D[1]];
    }

    /**
     * Converts table coords to board coords.
     * Receives the board coords to be convertes as parameter. The coords are received in the form of an array with 2 elements (2D coords).
     * Returns an array representing the board coords (relative to the starting position of the table) that correspond to the table coords receives as parameter.
     * The array returned has 2 elements (2D coords).
     */
    static tableCoordsToBoardCoords(tableCoords)
    {
        let x = Math.round((tableCoords[0] - boardStartPosX) / (cellSize + cellSize / 2));
        let y = Math.round((tableCoords[1] - boardStartPosY) / (cellSize + cellSize / 2));
        return [x, y];
    }

    /**
     * Converts table coords to board coords.
     * Receives the board coords to be convertes as parameter. The coords are received in the form of an array with 3 elements (3D coords).
     * Returns an array representing the board coords (relative to the starting position of the table) that correspond to the table coords receives as parameter.
     * The array returned has 2 elements (2D coords).
     */
    static tableCoords3DToBoardCoords(tableCoords)
    {
        let x = Math.round((tableCoords[0] - boardStartPosX) / (cellSize + cellSize / 2));
        let y = Math.round((tableCoords[2] - boardStartPosY) / (cellSize + cellSize / 2));
        return [x, y];
    }
    
    /**
     * Converts table coords to board coords.
     * Receives the board coords to be convertes as parameter. The coords are received in the form of an array with 2 elements (2D coords).
     * Returns an array representing the board coords (relative to the starting position of the table) that correspond to the table coords receives as parameter.
     * The array returned has 3 elements (3D coords).
     */
    static tableCoordsToBoardCoords3D(tableCoords)
    {
        let Coords2D = this.tableCoordsToBoardCoords(boardCoords);
        return [Coords2D[0], 0, Coords2D[1]];
    }

    /**
     * This function computes the board start pos given boardHeight(number of board lines of tiles) and boardWidth(number of board cols of tiles).It uses the cellSize constant. 
     */
    static computeBoardStartPos(boardHeight, boardWidth)
    {
        let tableCenter = [tableWidth / 2, tableLength / 2];
        boardStartPosX = tableCenter[0] - ((boardWidth / 2) * cellSize + (boardWidth - 1) / 2 * (cellSize / 2));
        boardStartPosY = tableCenter[1] - ((boardHeight / 2) * cellSize + (boardHeight - 1) / 2 * (cellSize / 2));
    }
}