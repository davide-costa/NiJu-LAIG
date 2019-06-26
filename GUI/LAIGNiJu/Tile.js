/**
 * Tile. A class that represents a tile. Stores all necessary information necessary to represent the tile in runtime. It stores its position, an animation that it may be currently being performed, etc.
 * @constructor
 */
const quadHalfEdge = 0.5;
const tileHeight = 0.15;
const tileChecksElevation = 0.16;
const tileChecksStartCoords = 0.05;
/**
 * Constructor for Tile class. Builds an object of class Tile. Receives all the necessary information to represent a Tile and sets the respective attributes accordingly.
 * @param {*} scene 
 * @param {*} tileMatrix 
 * @param {*} pos 
 * @param {*} player1TileTexture 
 * @param {*} player2TileTexture 
 * @param {*} whiteTexture 
 * @param {*} blackTexture 
 * @param {*} selectedTileTexture 
 */
function Tile(scene, tileMatrix, pos, player1TileTexture, player2TileTexture, whiteTexture, blackTexture, selectedTileTexture)
{
    this.scene = scene;
    this.tileMatrix = tileMatrix;
    this.isPickable = false;
    this.shaderActive = false;
    Tile.currId++;
    this.id = Tile.currId;
    this.visible = true;

    this.animation = null;
    if (pos == null)
        pos = [0, 0, 0];
    this.pos = pos;

    this.unitCube = new MyUnitCubeQuad(this.scene);
    this.quad = new MyQuad(this.scene);

    this.player1TileTexture = player1TileTexture;
    this.player2TileTexture = player2TileTexture;
    this.whiteTexture = whiteTexture;
    this.blackTexture = blackTexture;
    this.selectedTileTexture = selectedTileTexture;   
}

Tile.currId = 0;
/**
 * Displays a tile. Performs all actions necessary to display a Tile in the scene it is included (the one passed as parameter to the constructor).
 * It only displays the tile if it set as visible.
 */
Tile.prototype.display = function ()
{
    if (!this.visible)
        return;
    //Place tile at its position
    this.scene.pushMatrix();
    if (this.shaderActive)
        this.scene.setActiveShader(this.scene.tileShader);
    let animationMatrix = mat4.create();
    this.applyAnimations();
    this.scene.translate(this.pos[0], this.pos[1], this.pos[2]);
    this.scene.scale(0.3, 0.3, 0.3);

    //tile base
    this.scene.pushMatrix();
    this.scene.scale(1, tileHeight, 1);
    this.scene.translate(quadHalfEdge, quadHalfEdge, quadHalfEdge);
    if (this.tileMatrix[1][1] == 1)
        this.player1TileTexture.apply();
    else if (this.tileMatrix[1][1] == 2)
        this.player2TileTexture.apply();
    else
        this.selectedTileTexture.apply();
    this.unitCube.display();
    this.scene.popMatrix();

    //tile quads
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (this.tileMatrix[i][j] == 3)  //number that represents a quad in that tile position
            {
                this.scene.pushMatrix();
                this.scene.translate(0.333333 * j, 0, 0.333333 * i);
                this.scene.scale(0.3, 1, 0.3);
                this.scene.translate(quadHalfEdge, tileChecksElevation, quadHalfEdge);
                this.scene.translate(tileChecksStartCoords, 0, tileChecksStartCoords);
                if (this.tileMatrix[1][1] == 1)
                    this.blackTexture.apply();
                else if (this.tileMatrix[1][1] == 2)
                    this.whiteTexture.apply();
                this.scene.rotate(-90 * DEGREE_TO_RAD, 1, 0, 0);
                this.quad.display();
                this.scene.popMatrix();
            }

    if (this.shaderActive)
        this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
};
/**
 * Setter for the position of the tile. The unusual naming of the parameters is to able to perform an overload of the function, by counting the number of arguments.
 * Calls the adequate function which updates the tile's internal position and sets it to the value received as parameter.
 */
Tile.prototype.setPos = function (arg1, arg2)
{
    if (arguments.length === 1)
        return this.setPosByArray.apply(this, arguments);

    if (arguments.length === 2)
        return this.setPosByValues.apply(this, arguments);
}
/**
 * Setter for the position of the tile.
 * Updates the tile's internal position and sets it to the value received as parameter.
 * Receives the new position in the form of an array with two elements (2D coords).
 */
Tile.prototype.setPosByArray = function (pos)
{
    this.pos[0] = pos[0];
    this.pos[2] = pos[1];
}
/**
 * Setter for the position of the tile.
 * Updates the tile's internal position and sets it to the value received as parameter.
 * Receives the new position in the form two parameters: the first one represents the x coord; the second represents the y coord. (2D coords).
 */
Tile.prototype.setPosByValues = function (x, y)
{
    this.pos[0] = x;
    this.pos[2] = y;
}
/**
 * Getter for the position of the tile.
 * Returns the tile's internal position.
 * Returns the new position in the form of an array with two elements (2D coords).
 */
Tile.prototype.getPos = function ()
{
    return this.pos;
}
/**
 * Getter for the matrix representation of the tile.
 * Returns the matrix representation of the tile.
 * The matrix is returned in the form of a bidimensional array.
 */
Tile.prototype.getMatrix = function ()
{
    let tileMatrixCopy = [];
    for (let i = 0; i < this.tileMatrix.length; i++)
        tileMatrixCopy.push(this.tileMatrix[i].slice());

    return tileMatrixCopy;
}
/**
 * Setter for the matrix representation of the tile.
 * Receives the new matrix representation of the tile.
 * The matrix should be passed as parameter in the form of a bidimensional array.
 */
Tile.prototype.setMatrix = function (matrix)
{
    this.tileMatrix = matrix.slice();
};
/**
 * Setter for the pickable attribute of the Tile.
 * Is used to inform the Tile that it is pickable. This pickable attribute indicates the Game wether the Tile is pickable by the user or not.
 * By calling this function, the Tile becomes pickable.
 */
Tile.prototype.setAsPickable = function ()
{
    this.isPickable = true;
};
/**
 * Setter for the pickable attribute of the Tile.
 * Is used to inform the Tile that it is not pickable. This pickable attribute indicates the Game wether the Tile is pickable by the user or not.
 * By calling this function, the Tile becomes not pickable.
 */
Tile.prototype.setAsNotPickable = function ()
{
    this.isPickable = false;
};
/**
 * Getter for the pickable attribute of the Tile.
 * The attribute used to inform the Tile if it is pickable. This pickable attribute indicates the Game wether the Tile is pickable by the user or not.
 * If the tile is pickable, this function return true; if it is not pickable, returns false.
 */
Tile.prototype.isTilePickable = function ()
{
    return this.isPickable;
};
/**
 * Getter for the shader active indicator attribute of the Tile.
 * The attribute used to inform the Tile if it has the shader active (so it knows it must activate it on display).
 * If the tile has the shader active, this function return true; if it doesn't have the shader active, returns false.
 */
Tile.prototype.hasShaderActive = function ()
{
    return this.shaderActive;
};
/**
 * Performs all the actions necessary to start moving a tile to a destination position. Updates all internal information accordingly and creates the necessary animation.
 * Does not remember the position before the animation starts. If that is intended, the function startMovingAnimationTo should be called.
 */
Tile.prototype.startMovingAnimationToAux = function (dstPos)
{
    this.animation = TileAnimationCreator.createAnimationBetweenTwoPoints(this.pos, dstPos);
    this.currAnimationLastPos = dstPos;
    return this.animation;
};
/**
 * Performs all the actions necessary to start moving a tile to a destination position. Updates all internal information accordingly and creates the necessary animation.
 * Remembers the position before the animation starts. So that, the animation can be replayed and reversed (starting an animation moving backwards).
 */
Tile.prototype.startMovingAnimationTo = function (dstPos)
{
    this.posBeforeAnimation = this.pos.slice();
    this.lastAnimation = this.startMovingAnimationToAux(dstPos);
};
/**
 * Performs all the actions necessary to start moving a tile to the starting point of the last animation (which may have already been a reverse animation or not). Updates all internal information accordingly and creates the necessary animation.
 * Remembers the position before the animation starts. So that, the animation can be replayed and reversed (starting an animation moving backwards), just like any animation.
 */
Tile.prototype.startReverseAnimation = function ()
{
    if (this.posBeforeAnimation != null)
        this.startMovingAnimationTo(this.posBeforeAnimation.slice());
};
/**
 * Performs all the actions necessary to replay the last animation (which may have already been a replay animation or not). Updates all internal information accordingly and creates the necessary animation.
 * Sets the positions of the tile to the starting position of the last animation (if it is not already there the Tile instantly teleports to it (in the case of the this project it is always already there, so no instant teleports are made)).
 */
Tile.prototype.replayLastAnimation = function ()
{
    this.startMovingAnimationToAux(this.currAnimationLastPos);
};
/**
 * Updates the Tile's internal state based on time. It receives, in milliseconds, the elapsed time since the last time the function was called.
 * The time must be relative to the last time the function was called and can be any value as long as it is in milliseconds.
 * It is used to control the animation of the Tile based on time, so it performs smoothly without instant jumps (teleports).
 */
Tile.prototype.update = function (elapsedTimeMS)
{
    if (this.animation != null)
    {
        if (this.animation.UpdateAnimation(elapsedTimeMS) == "finished")
        {
            this.finishCurrAnimation();
            return "finished";
        }
        //this.applyAnimations();
        return "in progress";
    }
    return null;
};
/**
 * Performs all the necessary actions to terminate the animation that this Tile is currently performing.
 */
Tile.prototype.finishCurrAnimation = function ()
{
    this.animation = null;
    this.pos = this.currAnimationLastPos;
};

/**
 * This function applies the animations effect to the tile, by multiplying the scene matrix by the animations matrix.
 */
Tile.prototype.applyAnimations = function (transformMatrix)
{
    if (this.animation != null)
    {
        let animationMatrix = mat4.create();
        mat4.identity(animationMatrix);
        this.animation.ApplyAnimation(animationMatrix);
        this.scene.multMatrix(animationMatrix);
    }
}

/**
 * This function sets tile shader as active. That way when display is called, the tile is displayed with shader effect.
 */
Tile.prototype.activateShader = function ()
{
    this.shaderActive = true;
}

/**
 * This function sets tile shader as inactive. That way when display is called, the tile is displayed without shader effect.
 */
Tile.prototype.deactivateShader = function ()
{
    this.shaderActive = false;
}

/**
 * This function sets tile as visble. That way when display is called, the tile is displayed.
 */
Tile.prototype.setVisible = function ()
{
    this.visible = true;
}

/**
 * This function sets tile as invisble. That way when display is called, the tile is not displayed.
 */
Tile.prototype.setInvisible = function ()
{
    this.visible = false;
}

/**
 * This function rotate tile matrix by 90 degrees in non clock-wise movement.
 */
Tile.prototype.rotate = function ()
{
    let numCols = this.tileMatrix[0].length;
    for (let i = 0; i < numCols / 2; i++)
        for (let j = i; j < numCols - i - 1; j++)
        {
            let temp = this.tileMatrix[i][j];
            this.tileMatrix[i][j] = this.tileMatrix[j][numCols - i - 1];
            this.tileMatrix[j][numCols - i - 1] = this.tileMatrix[numCols - i - 1][numCols - j - 1];
            this.tileMatrix[numCols - i - 1][numCols - j - 1] = this.tileMatrix[numCols - j - 1][i];
            this.tileMatrix[numCols - j - 1][i] = temp;
        }
}