/**
 * ComputerComputer. This class represents the game between 2 IA's, is derived from class Game. It contains the state machine that handling this type of game.
 * @constructor
 */
function ComputerComputer(scene, selectedScene, level)
{
    this.level = level;
    Game.call(this, scene, selectedScene);
};
ComputerComputer.prototype = Object.create(Game.prototype);
ComputerComputer.prototype.constructor = ComputerComputer;

/**
 * This function has the state machine of computer computer game, responsable for calling the apropriate functions in each state.
 */
ComputerComputer.prototype.stateMachine = function ()
{
    switch (this.currState)
    {
        case 1:
            Computer.sendRequestToProlog(this, 2);
            break;
        case 2:
            Computer.OnPrologResponse(this, 2, 3);
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