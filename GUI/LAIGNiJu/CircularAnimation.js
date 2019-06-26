/**
 * CircularAnimation. Represents a Circular Animation. Stores all necessary info to remember its internal state.
 * @constructor
 */
function CircularAnimation(linSpeed, center, radius, startAng, rotAng)  //args is an array with the arguments of the object (in this case slices and stacks)
{
    this.linSpeed = linSpeed;
    this.angSpeed = linSpeed / radius;
    this.center = center;
    this.radius = radius;
    this.startAng = startAng;
    this.currAng = startAng;
    this.rotAng = rotAng;
    if (this.rotAng < 0)
        this.angSpeed = -this.angSpeed;
    this.currTime = 0;
    this.totalTime = Math.abs(this.rotAng / this.angSpeed);
}
;

//This function must be implemented in every subclass of Animation and is responsible for applying the animation. It receives a matrix as parameter and it must modify it, applying the transformations respecting to this animation to it.
CircularAnimation.prototype.ApplyAnimation = function (animationMatrix)
{
    if (this.currTime > this.totalTime)
        return "finished";
    else
    {
        mat4.translate(animationMatrix, animationMatrix, this.center);
        mat4.rotate(animationMatrix, animationMatrix, this.currAng, [0, 1, 0]);
        mat4.translate(animationMatrix, animationMatrix, [0, 0, this.radius]);
        return "in progress";
    }
};

//This function must be implemented in every subclass of Animation and is responsible for updating the internal state of the animation based on time. It receives the elapsed time (since the last call to this function) and updates the internal state of the animation based on it.
CircularAnimation.prototype.UpdateAnimation = function (elapsedTimeMS)
{
    let elapsedTime = elapsedTimeMS / 1000;
    this.currTime += elapsedTime;
    if (this.currTime > this.totalTime)
        this.currTime = this.totalTime;
    this.currAng = this.startAng + this.angSpeed * this.currTime;
    if (this.currTime >= this.totalTime)
        return "finished";
};

//This function must be implemented in every subclass of Animation and returns the time interval that the animation takes to finish performing.
CircularAnimation.prototype.GetTotalTime = function ()
{
    return this.totalTime;
};

//This function must be implemented in every subclass of Animation and is responsible for creating a new, separate and independent copy of the animation. This is needed to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations).
CircularAnimation.prototype.getCopy = function ()
{
    return new CircularAnimation(this.linSpeed, this.center.slice(), this.radius, this.startAng, this.rotAng);
};