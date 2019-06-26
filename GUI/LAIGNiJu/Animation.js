const MIN_ANIM_SPEED = 0.01;
const MAX_ANIM_SPEED = 5;

/**
 * Animation. This class represents an animation. It is an abstract class. Each derived classes implements the logic of every individual animation. Every derived class must implement the core functions that are declared here.
 * @constructor
 */
function Animation(speed)
{
    this.pos = [0, 0, 0];
    this.speed = speed;
}
;

//This function must be implemented in every subclass of Animation and is responsible for applying the animation. It receives a matrix as parameter and it must modify it, applying the transformations respecting to this animation to it.
Animation.prototype.ApplyAnimation;

//This function must be implemented in every subclass of Animation and is responsible for updating the internal state of the animation based on time. It receives the elapsed time (since the last call to this function) and updates the internal state of the animation based on it.
Animation.prototype.UpdateAnimation;

//This function must be implemented in every subclass of Animation and returns the time interval that the animation takes to finish performing.
Animation.prototype.GetTotalTime;

//This function must be implemented in every subclass of Animation and is responsible for creating a new, separate and independent copy of the animation. This is needed to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations).
Animation.prototype.getCopy;