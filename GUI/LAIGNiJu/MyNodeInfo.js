/**
 * MyNodeInfo class
 * @constructor
 **/
function MyNodeInfo(node)
{
    // The material ID.
    this.materialID = node.materialID;

    // The texture ID.
    this.textureID = node.textureID;

    // Indicates if is selectable to use shaders.
    this.selectable = node.selectable;

    // The transform matrix (always 4*4 matrix)
    this.transformMatrix = [];
    for (var i = 0; i < 4 * 4; i++)
        this.transformMatrix[i] = node.transformMatrix[i];	 //assuring separated independent copy (no aliasing)
}


function MyNodeInfo(materialID, textureID, transformMatrix, selectable, pickable)
{
    // The material ID.
    this.materialID = materialID;

    // The texture ID.
    this.textureID = textureID;

    // Indicates if is selectable to use shaders.
    this.selectable = selectable;

    // The transform matrix
    this.transformMatrix = transformMatrix;

    // Indicates if is pickable by the user.
    this.pickable = pickable;
}


function MyNodeInfo(nodeID, materialID, textureID, transformMatrix, selectable)
{
    this.nodeID = nodeID;

    // The material ID.
    this.materialID = materialID;

    // The texture ID.
    this.textureID = textureID;

    // Indicates if is selectable to use shaders.
    this.selectable = selectable;

    // The transform matrix 
    this.transformMatrix = transformMatrix;
}