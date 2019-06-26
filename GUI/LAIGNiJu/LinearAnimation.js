/**
 * LinearAnimation. This class represents an animation. This animation corresponds to a one or more linear displacements, in which one displacement has as init point and start point given as two followed control points in the arry controlPoints. It�s also given a speed.
 * @constructor
 */
function LinearAnimation(speed, controlPoints, adjustHeading = true)
{
    Animation.call(this, speed);
    this.controlPoints = controlPoints;
    this.currStrokeIdx = 0;
    this.timeSinceStrokeStart = 0;

    this.currStrokeTime = 0; //to make sure that in the first call of UpdateAnimation the UpdateCourseValues will be called to set the first course values
    this.adjustHeading = adjustHeading;
}
;

//This function is called when a change in the linear displacement occurs, and with that some of variables used to update animation needs to be changed.
LinearAnimation.prototype.UpdateCourseValues = function ()
{
    this.currStrokeIdx++;
    if (this.currStrokeIdx >= this.controlPoints.length)
        return;

    let totalDisplacement = Vectors.GetVectorFromTwoPoints(this.controlPoints[this.currStrokeIdx - 1], this.controlPoints[this.currStrokeIdx]);
    this.currStrokeTime = Vectors.GetMagnitudeOfVector(totalDisplacement) / this.speed;
    this.velocity = Vectors.GetScaledVector(totalDisplacement, 1 / this.currStrokeTime);
    this.timeSinceStrokeStart = 0;
    this.pos = this.controlPoints[this.currStrokeIdx - 1].slice();

    if (!this.adjustHeading)
        return;
    var totalDisplacementVectorWithYZero = totalDisplacement;
    totalDisplacementVectorWithYZero[1] = 0;
    this.rotateAngle = Vectors.GetAngleBetweenVectors([1, 0, 0], totalDisplacementVectorWithYZero); //get the rotation in Y
    if (this.rotateAngle != 0 && this.rotateAngle != (180 * degToRad))
        this.rotateAxis = Vectors.CrossProduct([1, 0, 0], totalDisplacementVectorWithYZero);
    else
        this.rotateAxis = [0, 1, 0];
};

//This function must be implemented in every subclass of Animation and is responsible for updating the internal state of the animation based on time. It receives the elapsed time (since the last call to this function) and updates the internal state of the animation based on it.
LinearAnimation.prototype.UpdateAnimation = function (elapsedTimeMS)
{
    if (this.currStrokeIdx >= this.controlPoints.length)
        return "finished";
    let elapsedTime = elapsedTimeMS / 1000;
    this.timeSinceStrokeStart += elapsedTime;
    if (this.timeSinceStrokeStart >= this.currStrokeTime)
    {
        elapsedTime = this.timeSinceStrokeStart - this.currStrokeTime;
        this.UpdateCourseValues();
    }

    if (this.currStrokeIdx >= this.controlPoints.length)
        return "finished";

    this.moveValue = Vectors.GetScaledVector(this.velocity, elapsedTime)
    this.pos = Vectors.AddVectors(this.pos, this.moveValue);

    return "in progress";
};

//This function must be implemented in every subclass of Animation and is responsible for applying the animation. It receives a matrix as parameter and it must modify it, applying the transformations respecting to this animation to it.
LinearAnimation.prototype.ApplyAnimation = function (animationMatrix)
{
    mat4.translate(animationMatrix, animationMatrix, this.pos);
    if (this.adjustHeading)
        mat4.rotate(animationMatrix, animationMatrix, this.rotateAngle, this.rotateAxis);
};

//Returns the sum of the displacements of all strokes
LinearAnimation.prototype.GetTotalDisplacement = function ()
{
    let totalDistanceTraveled = 0;
    for (let i = 0; i < this.controlPoints.length - 1; i++)
    {
        let displacement = Vectors.GetVectorFromTwoPoints(this.controlPoints[i], this.controlPoints[i + 1]);
        let distance = Vectors.GetMagnitudeOfVector(displacement);
        totalDistanceTraveled += distance;
    }

    return totalDistanceTraveled;
};

//This function must be implemented in every subclass of Animation and returns the time interval that the animation takes to finish performing.
LinearAnimation.prototype.GetTotalTime = function ()
{
    return this.GetTotalDisplacement() / this.speed;
};

//This function must be implemented in every subclass of Animation and is responsible for creating a new, separate and independent copy of the animation. This is needed to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations).
LinearAnimation.prototype.getCopy = function ()
{
    return new LinearAnimation(this.speed, this.controlPoints.slice(), this.adjustHeading);
};