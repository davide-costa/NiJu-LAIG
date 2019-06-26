/**
 * TileAnimationCreator. This class is responsible for creating an animation, programmatically.
 * All animations used on the game are not loaded from the XML file. They are all created programmatically since the starting and destination positions change with each play.
 * There are way too much possible combinations of animations that may be needed for the game to be loaded from the XML.
 * Therefore, all animations used in the game are created programtically and using this class.
 * The constructor receives the starting and destination positions of the animation, creates and returns an animation that moves an object from the starting to the destination positions.
 * The animation returned can be either a Bezier or a Linear animation, chosen randomly with equal probability.
 * The speed and elevation of the animations can be controlled just be changing the constants bellow.
 */
const animation1ElevationAmount = 0.7;
const animation1Speed = 0.8;

const animation2ElevationAmount = 0.7;
const animation2Speed = 0.8;

class TileAnimationCreator
{
    //Returns a animation that moves an object from initPos to LastPos
    static createAnimationBetweenTwoPoints(initPos, lastPos)
    {
        let animNumber = Math.floor(Math.random() * 2) + 1;
        let animationElevationAmount;
        let animationSpeed;
        switch (animNumber)
        {
            case 1:
                animationElevationAmount = animation1ElevationAmount;
                animationSpeed = animation1Speed;
                break;
            case 2:
                animationElevationAmount = animation2ElevationAmount;
                animationSpeed = animation2Speed;
                break;
        }

        return this.createAnimation(animNumber, initPos, lastPos, animationElevationAmount, animationSpeed);
    }

    /**
     * Function repsonsable for creating an animation.
     * All animations used on the game are not loaded from the XML file. They are all created programmatically since the starting and destination positions change with each play.
     * There are way too much possible combinations of animations that may be needed for the game to be loaded from the XML.
     * Therefore, all animations used in the game are created programtically and using this class.
    */
    static createAnimation(animationNumber, initPos, lastPos, animationElevationAmount, animationSpeed)
    {
        let lastPosY = lastPos[1];
        let p1 = [0, initPos[1], 0];
        let p2 = [0, lastPosY + animationElevationAmount, 0];
        let p3 = Vectors.GetVectorFromTwoPoints(initPos, lastPos);
        p3[1] = lastPosY + animationElevationAmount; //no elevation on this stroke
        let p4 = p3.slice();
        p4[1] = lastPos[1];
        let animation;
        switch (animationNumber)
        {
            case 1:
                animation = new LinearAnimation(animationSpeed, [p1, p2, p3, p4], false);
                break;
            case 2:
                animation = new BezierAnimation(animationSpeed, [p1, p2, p3, p4], false);
                break;
        }
        return animation;
    }
}
