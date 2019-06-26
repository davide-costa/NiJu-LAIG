var BEZIER_STEPS = 25;   //number of iterations to calculate the aproximate distance of the bezier curve, using Casteljau Algorithm.

/**
 * BezierAnimation. This class represents an animation. This animation corresponds to a bezier curve in 3D space, given speed and the 4 control points (P1, P2, P3, P4).
 * @constructor
 */
function BezierAnimation(speed, controlPoints, adjustHeading = true)
{
    this.speed = speed;
    this.P1 = controlPoints[0];
    this.P2 = controlPoints[1];
    this.P3 = controlPoints[2];
    this.P4 = controlPoints[3];
    var curveDistance = this.BezierLength();
    this.timeOfAnimation = curveDistance / speed; // in ms

    this.timeSinceAnimationStart = 0;
    this.pos = this.P1.slice();
    this.rotateAngle = 0;
    this.rotateAxis = [0, 1, 0];
    this.adjustHeading = adjustHeading;
}


//This function must be implemented in every subclass of Animation and is responsible for updating the internal state of the animation based on time. It receives the elapsed time (since the last call to this function) and updates the internal state of the animation based on it.
BezierAnimation.prototype.UpdateAnimation = function (elapsedTimeMS)
{
    if (this.timeSinceAnimationStart >= this.timeOfAnimation)
        return "finished";
    this.timeSinceAnimationStart += elapsedTimeMS / 1000;
    var previous_pos = this.pos.slice();
    if (this.timeSinceAnimationStart > this.timeOfAnimation)
        this.timeSinceAnimationStart = this.timeOfAnimation;
    let progress_t = this.timeSinceAnimationStart / this.timeOfAnimation;
    this.pos[0] = this.BezierPoint(progress_t, this.P1[0], this.P2[0], this.P3[0], this.P4[0]);
    this.pos[1] = this.BezierPoint(progress_t, this.P1[1], this.P2[1], this.P3[1], this.P4[1]);
    this.pos[2] = this.BezierPoint(progress_t, this.P1[2], this.P2[2], this.P3[2], this.P4[2]);

    if (this.adjustHeading)
    {
        var curr_pos = this.pos.slice();
        curr_pos[1] = 0;
        previous_pos[1] = 0;
        let velocity = Vectors.GetVectorFromTwoPoints(previous_pos, curr_pos);
        this.rotateAngle = Vectors.GetAngleBetweenVectors([1, 0, 0], velocity); //get the rotation in Y
        this.rotateAxis = Vectors.CrossProduct([1, 0, 0], velocity);
        Vectors.TransformVectorIntoVersor(this.rotateAxis);
    }

    if (this.timeSinceAnimationStart >= this.timeOfAnimation)
        return "finished";
    else
        return "in progress";
}


//This function must be implemented in every subclass of Animation and is responsible for applying the animation. It receives a matrix as parameter and it must modify it, applying the transformations respecting to this animation to it.
BezierAnimation.prototype.ApplyAnimation = function (animationMatrix)
{
    mat4.translate(animationMatrix, animationMatrix, this.pos);
    if (this.adjustHeading)
        mat4.rotate(animationMatrix, animationMatrix, this.rotateAngle, this.rotateAxis);
}


// Adapted from https://www.lemoda.net/maths/bezier-length/index.html,   Copyright � Ben Bullock 2009-2017.
//Calculates the aproximate distance of a bezier curve given its 4 control points. Uses the Casteljau Algorithm with BEZIER_STEPS iterations.
BezierAnimation.prototype.BezierLength = function ()
{
    var t = 0.0
            , dot_x = 0.0
            , dot_y = 0.0
            , dot_z = 0.0
            , previous_dot_x = 0.0
            , previous_dot_y = 0.0
            , previous_dot_z = 0.0
            , length = 0.0;
    var steps = BEZIER_STEPS;

    for (let i = 0; i <= steps; i++)
    {
        t = i / steps;
        dot_x = this.BezierPoint(t, this.P1[0], this.P2[0], this.P3[0], this.P4[0]);
        dot_y = this.BezierPoint(t, this.P1[1], this.P2[1], this.P3[1], this.P4[1]);
        dot_z = this.BezierPoint(t, this.P1[2], this.P2[2], this.P3[2], this.P4[2]);
        if (i > 0)
        {
            var x_diff = dot_x - previous_dot_x;
            var y_diff = dot_y - previous_dot_y;
            var z_diff = dot_z - previous_dot_z;
            length += Math.sqrt(x_diff * x_diff + y_diff * y_diff + z_diff * z_diff);
        }

        previous_dot_x = dot_x;
        previous_dot_y = dot_y;
        previous_dot_z = dot_z;
    }

    return length;
}

//This function gives a poiit of the bezier curve given the four control points of the curve and the curr t. Uses the bezier formula.
BezierAnimation.prototype.BezierPoint = function (t, P1, P2, P3, P4)
{
    var bezier_point = P1 * (1.0 - t) * (1.0 - t) * (1.0 - t) + 3.0 * P2 * (1.0 - t) * (1.0 - t) * t + 3.0 * P3 * (1.0 - t) * t * t + P4 * t * t * t;

    return bezier_point;
}

//This function must be implemented in every subclass of Animation and returns the time interval that the animation takes to finish performing.
BezierAnimation.prototype.GetTotalTime = function ()
{
    return this.timeOfAnimation;
};

//This function must be implemented in every subclass of Animation and is responsible for creating a new, separate and independent copy of the animation. This is needed to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations).
BezierAnimation.prototype.getCopy = function ()
{
    let controlPoints = [this.P1.slice(), this.P2.slice(), this.P3.slice(), this.P4.slice()]
    return new BezierAnimation(this.speed, controlPoints);
};