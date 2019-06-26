/**
 * MyGraphNode class, representing an intermediate node in the scene graph.
 * @constructor
 **/

function MyGraphNode(graph, nodeID)
{
    this.graph = graph;

    this.nodeID = nodeID;

    // IDs of child nodes.
    this.children = [];

    // list of leaves.
    this.leaves = [];

    // The material ID.
    this.materialID = null;

    // The texture ID.
    this.textureID = null;

    this.animations = new ComboAnimation([]);

    //The index (respecting to the vector animationsIDs) of the animation currently being performed
    this.currAnimationIdx = 0;

    //This variable is used to regulate animations, it represents the time since the current animation has started performing
    this.currAnimationTimeProgress = 0;

    //The transform matrix, initialized as the identity matrix
    this.transformMatrix = mat4.create();
    mat4.identity(this.transformMatrix);

    this.pickable = false;
}

/**
 * Adds the reference (ID) of another node to this node's children array.
 */
MyGraphNode.prototype.addChild = function (nodeID)
{
    this.children.push(nodeID);
}

/**
 * Adds a leaf to this node's leaves array.
 */
MyGraphNode.prototype.addLeaf = function (leaf)
{
    this.leaves.push(leaf);
}

/**
 * Adds an animation to the node to be performed in runtime, based on time.
 */
MyGraphNode.prototype.addAnimation = function (animationID)
{
    this.animations.addAnimation(animationID);
}

/**
 * Updates the animation based on time passed since last update.
 */
MyGraphNode.prototype.updateAnimations = function (animations, elapsedTimeMS)
{
    this.animations.UpdateAnimation(animations, elapsedTimeMS);
}

/**
 * Apply the animations to the scene objects.
 */
MyGraphNode.prototype.applyAnimations = function (animations, transformMatrix)
{
    this.animations.ApplyAnimation(animations, transformMatrix);
}