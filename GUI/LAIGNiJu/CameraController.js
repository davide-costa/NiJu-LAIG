/**
 * CameraController. This class is responsible for controlling the camera. It has methods that allow the Game class to turn the camera appropriate for each player's turn, providing an abstraction to the CGFcamera class.
 * @constructor
 */

function CameraController(camera)
{
    this.camera = camera;
}
/**
 * Constructor for class CameraController. Receives all the necessary info stored in the camera controller, except the camera it controlls, which will be set later.
 */
function CameraController(pointLookingAt, elevation, radius, angSpeed)
{
    this.pointLookingAt = pointLookingAt;
    this.elevation = elevation;
    this.radius = radius;
    this.angSpeed = angSpeed;
    let position = vec3.fromValues(pointLookingAt[0] + radius, pointLookingAt[1] + elevation, pointLookingAt[2]);
    let target = vec3.fromValues(pointLookingAt[0], pointLookingAt[1], pointLookingAt[2]);
    this.camera = new CGFcamera(0.4, 0.1, 500, position, target);
    this.currAng = 0;
    this.remainingAng = 0;
}
/**
 * Updates the CameraController's internal state based on time. It receives, in milliseconds, the elapsed time since the last time the function was called.
 * The time must be relative to the last time the function was called and can be any value as long as it is in milliseconds.
 * It is used to move the camera (performing an animation) based on time, smoothly, instead of jumping to the final pos right away.
 */
CameraController.prototype.update = function (elapsedTime)
{
    if (!this.inMotion)
        return;
    let currAngStep = this.angSpeed * elapsedTime/1000;
    this.currAng += currAngStep;
    this.remainingAng -= currAngStep;
    if (this.remainingAng <= 0)
    {
        currAngStep += this.remainingAng;
        this.remainingAng = 0;
        this.inMotion = false;
    }
    
    this.camera.orbit([0,1,0], currAngStep);
    if (!this.inMotion)
    {
        this.currAng = 0;
        this.remainingAng = 0;
    }
}
/**
 * Starts moving the camera 180 degress. The movement is performed like an animation, smoothly and based on time thanks to the update function.
 * If the function is called a lot of times in a row, it will never rotate more than 360 degrees (a remainder calculation is made).
 */
CameraController.prototype.startMovingCamera180Degrees = function ()
{
    this.inMotion = true
    this.remainingAng += 180 * degToRad;
    this.remainingAng %= 360 * degToRad;
}