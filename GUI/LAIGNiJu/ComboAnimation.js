/**
 * ComboAnimation. This class represents multiple sequential animatinos. It controlls its subanimations. It stores the animations ids under its control and creates a copy of each animation under its control to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations). The constructor receives the ids of the animations it controlls.
 * @constructor
 */
function ComboAnimation(animationsIDs)
{
    this.animationsIDs = animationsIDs;
    this.currAnimationIdx = 0;
}
;

//This function must be implemented in every subclass of Animation and returns the time interval that the animation takes to finish performing.
ComboAnimation.prototype.GetTotalTime = function (animations)
{
    let totalTime = 0;
    for (let i = 0; i < this.animationsIDs.length; i++)
    {
        let id = this.animationsIDs[i];
        totalTime += animations[id].GetTotalTime();
    }

    return totalTime;
};

/**
 * Adds an animation to the node to be performed in runtime, based on time. Creates a copy of each animation under its control to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing).
 */
ComboAnimation.prototype.addAnimation = function (animationID)
{
    this.animationsIDs.push(animationID);
}

/**
 * Creates a map that associates each animation's ID with the time it takes to complete. Creates a copy
 */
ComboAnimation.prototype.ParseAnimationsTimes = function (animations)
{
    this.animationsTimes = [];
    this.animations = [];
    for (let i = 0; i < this.animationsIDs.length; i++)
    {
        let id = this.animationsIDs[i];
        let animation = animations[id].getCopy();
        this.animations[id] = animation;
        this.animationsTimes[id] = animation.GetTotalTime(animations);
        if (animation instanceof ComboAnimation)
            animation.ParseAnimationsTimes(animations);
    }
}


//This function must be implemented in every subclass of Animation and is responsible for updating the internal state of the animation based on time. It receives the elapsed time (since the last call to this function) and updates the internal state of the animation based on it.
ComboAnimation.prototype.UpdateAnimation = function (elapsedTimeMS)
{
    if (this.animationsIDs.length == 0)
        return;
    if (this.currAnimationIdx >= this.animationsIDs.length)
        return "finished";

    let currAnimationID = this.animationsIDs[this.currAnimationIdx];
    let currAnimation = this.animations[currAnimationID];
    if (currAnimation.UpdateAnimation(elapsedTimeMS) == "finished")
        return this.JumpToNextAnimation(elapsedTimeMS);

    return "in progress";
}

//This function is responsible for changing the internal state of this ComboAnimation in order to start performing the animation that comes next. If no animation comes next, it returns immediately.
ComboAnimation.prototype.JumpToNextAnimation = function (elapsedTimeMS)
{
    if (this.currAnimationIdx >= this.animationsIDs.length - 1)
        return "finished";

    let elapsedTime = elapsedTimeMS / 1000;
    let currAnimationID = this.animationsIDs[this.currAnimationIdx];
    let currAnimation = this.animations[currAnimationID];
    let currAnimationTotalTime = this.animationsTimes[currAnimationID];
    let newTimeProgressOfAnimation = this.currAnimationTimeProgress + elapsedTime;
    newTimeProgressOfAnimation = newTimeProgressOfAnimation - currAnimationTotalTime;

    this.currAnimationIdx++;
    return this.UpdateAnimation(elapsedTimeMS);
}

//This function must be implemented in every subclass of Animation and is responsible for applying the animation. It receives a matrix as parameter and it must modify it, applying the transformations respecting to this animation to it.
ComboAnimation.prototype.ApplyAnimation = function (transformMatrix)
{
    if (this.animationsIDs.length == 0)
        return;
    let currAnimationID = this.animationsIDs[this.currAnimationIdx];
    let currAnimation = this.animations[currAnimationID];
    currAnimation.ApplyAnimation(transformMatrix);
};

//This function must be implemented in every subclass of Animation and is responsible for creating a new, separate and independent copy of the animation. This is needed to ensure that the same animation id can be used in different ComboAnimation classes without referring to the same object (avoids aliasing between different animations).
ComboAnimation.prototype.getCopy = function ()
{
    return new ComboAnimation(this.animationsIDs.slice());
};
