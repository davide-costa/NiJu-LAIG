/**
 * MyInterface class, creating a GUI interface.
 * @constructor
 */

const C_ASCIICODE1 = 67;
const C_ASCIICODE2 = 99;
const R_ASCIICODE1 = 82;
const R_ASCIICODE2 = 114;
const U_ASCIICODE1 = 85;
const U_ASCIICODE2 = 117;
const M_ASCIICODE1 = 77;
const M_ASCIICODE2 = 109;
const P_ASCIICODE1 = 80;
const P_ASCIICODE2 = 112;
const SPACEBAR_ASCIICODE = 32;


function MyInterface()
{
    //call CGFinterface constructor 
    CGFinterface.call(this);
}
;

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * Initializes the interface.
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function (application)
{
    // call CGFinterface init
    CGFinterface.prototype.init.call(this, application);

    return true;
};

/**
 * Function resposable for handling keyboard interrupts. At some keys it call game function.
 * @param event from keyboard.
 */
MyInterface.prototype.processKeyboard = function (event)
{
    CGFinterface.prototype.processKeyboard.call(this, event);

    var key_pressed = (ch = event.which) || (ch = event.keyCode);

    if (key_pressed == SPACEBAR_ASCIICODE)
        if(this.scene != null && this.scene.game != null)
            this.scene.game.finishCurrMovingTileAnimation();

    if (key_pressed == C_ASCIICODE1 || key_pressed == C_ASCIICODE2)
        if(this.scene != null && this.scene.game != null)
            this.scene.game.cancelLastPick();

    if (key_pressed == R_ASCIICODE1 || key_pressed == R_ASCIICODE2)
        if(this.scene != null && this.scene.game != null)
            this.scene.game.rotateTile();

    if (key_pressed == U_ASCIICODE1 || key_pressed == U_ASCIICODE2)
        if(this.scene != null && this.scene.game != null)
            this.scene.game.undoLastPlay();

    if (key_pressed == M_ASCIICODE1 || key_pressed == M_ASCIICODE2)
        if(this.scene != null && this.scene.game != null)
            this.scene.game.startPlayingGameMovie();

    if (key_pressed == P_ASCIICODE1 || key_pressed == P_ASCIICODE2)
    if(this.scene != null && this.scene.game != null)
        this.scene.game.togglePause();
};