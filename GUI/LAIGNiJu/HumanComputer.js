/**
 * HumanComputer. This class represents the game between Human and IA, is derived from class Game. It contains the state machine that handling this type of game.
 * @constructor
 */
function HumanComputer(scene, selectedScene, level)
{
    Game.call(this, scene, selectedScene);
    this.level = level;
};
HumanComputer.prototype = Object.create(Game.prototype);
HumanComputer.prototype.constructor = HumanComputer;

/**
 * This function has the state machine of human computer game, responsable for calling the apropriate functions in each state.
 */
HumanComputer.prototype.stateMachine = function ()
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
            Computer.sendRequestToProlog(this, 5);
            break;
        case 5:
            Computer.OnPrologResponse(this, 1, 6);
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
 * This function is responsable for determine the next start state, i.e, the state of play start of the next player (4 in player2(IA) as next player and 1 for player1(Human) as next player).
 */
HumanComputer.prototype.nextStartState = function ()
{
    if (this.currState == 1 || this.currState == 2)
        return 4;
    else if (this.currState == 4 || this.currState == 5)
        return 1;
}