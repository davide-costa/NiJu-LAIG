/**
 * MyRectangle. A class that represents a rectangle. The rectangle is always drawn in the xy plane and the vertices are passed in to the constructor in the form of an array with two pairs of coords. The first pair represents the (x, y) coords of the left top vertex and the second pair represents the (x, y) coords of the right bottom vertex.
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyRectangle(scene, vertices)
{

    CGFobject.call(this, scene);
    this.vertices = vertices;

    this.initBuffers();
}
;

MyRectangle.prototype = Object.create(CGFobject.prototype);
MyRectangle.prototype.constructor = MyRectangle;

MyRectangle.prototype.initBuffers = function ()
{
    var left = this.vertices[0];
    var top = this.vertices[1];
    var right = this.vertices[2];
    var bottom = this.vertices[3];

    var topLeft = [left, top];
    var topRight = [right, top];
    var bottomLeft = [left, bottom];
    var bottomRight = [right, bottom];

    this.vertices = [
        right, top, 0,
        left, top, 0,
        right, bottom, 0,
        left, bottom, 0
    ];

    //The vertices are connected in way so that the rectangle in visible in the direction of the z axis (direction where the z coords increase)
    this.indices = [
        0, 1, 2,
        1, 3, 2
    ];

    //The normal vectors (they all are in the direction of the z axis because the rectangle is the xy plane and visible in the direction of the z axis, according to the project specification)
    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyRectangle.prototype.setAmplifFactor = function (amplif_s, amplif_t)
{
    var dist_s = Math.abs(this.vertices[0] - this.vertices[2]); //The distance between the two vertices of the rectangle in s direction
    var dist_t = Math.abs(this.vertices[1] - this.vertices[3]); //The distance between the two vertices of the rectangle in t direction
    this.texCoords = []; //reset the tex coords vector to erase previous applications of textures
    this.texCoords.push(
            dist_s / amplif_s, 1 - dist_t / amplif_t,
            0, 1 - dist_t / amplif_t,
            dist_s / amplif_s, 1,
            0, 1
            );

    this.updateTexCoordsGLBuffers();

}
