/**
 * HumanHuman. This class represents an animation. This animation corresponds to a bezier curve in 3D space, given speed and the 4 control points (P1, P2, P3, P4).
 * @constructor
 */
function HumanHuman(scene, selectedScene)
{
    Game.call(this, scene, selectedScene);
}
HumanHuman.prototype = Object.create(Game.prototype);
HumanHuman.prototype.constructor = HumanHuman;

/**
 * This function has the state machine of human human game, responsable for calling the apropriate functions in each state.
 */
HumanHuman.prototype.stateMachine = function ()
{
    switch (this.currState)
    {
        case 1:
            Human.handlePickTile(this, 2);
            break;
        case 2:
            Human.handlePlaceTile(this, 1, 2, 3);
            break;
        case 3:
            this.waitForEndOfAnimation(4, 7);
            break;
        case 4:
            Human.handlePickTile(this, 5);
            break;
        case 5:
            Human.handlePlaceTile(this, 4, 1, 6);
            break;
        case 6:
            this.waitForEndOfAnimation(1, 7);
            break;
        case 7:
            this.setEndOfGameStyle(this.winner);
            break;
        case 8:
            this.waitForEndOfGameMovie(); //auxiliar state called when the game movie is being presented, after end of game movie it back to the state where it was before.
            break;
        default:
            break;
    }
};

/**
 * This function is responsable for determine the next start state, i.e, the state of play start of the next player (4 in player2 as next player and 1 for player1 as next player).
 */
HumanHuman.prototype.nextStartState = function ()
{
    if (this.currState == 1 || this.currState == 2)
        return 4;
    else if (this.currState == 4 || this.currState == 5)
        return 1;
}