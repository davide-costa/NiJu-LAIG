/**
 * MyTriangle.A class that represents a triangle. The triangle is always drawn in the xy plane and the vertices are passed in to the constructor in the form of an array with 3 pairs of coords.
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyTriangle(scene, vertices)
{
    CGFobject.call(this, scene);
    this.vertices = vertices;

    this.initBuffers();
}
;

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;
/**
 * Initializes the graphics buffers necessary to display the triangles that constitue the MyTriangle class.
 */
MyTriangle.prototype.initBuffers = function ()
{
    //The vertices are connected in the order they appear in the XML file.
    this.indices = [
        0, 1, 2
    ];

    this.computeNormals();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

//compute the normal to the vertices of the triangle ussing cross product
MyTriangle.prototype.computeNormals = function ()
{
    var P0 = [this.vertices[0], this.vertices[1], this.vertices[2]];
    var P1 = [this.vertices[3], this.vertices[4], this.vertices[5]];
    var P2 = [this.vertices[6], this.vertices[7], this.vertices[8]];

    //From 3 points obtain 2 vectors
    var v1 = Vectors.GetVectorFromTwoPoints(P0, P1);
    var v2 = Vectors.GetVectorFromTwoPoints(P0, P2);

    //Using cross product obtain a normal to the vertices
    var normalVec = Vectors.CrossProduct(v1, v2);
    Vectors.TransformVectorIntoVersor(normalVec);

    this.normals = [];
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
            this.normals.push(normalVec[j]);
}

//calculate the text coords, using the amplifications factors of the textures
MyTriangle.prototype.setAmplifFactor = function (amplif_s, amplif_t)
{

    //P0 coords
    var x1 = this.vertices[0];
    var y1 = this.vertices[1];
    var z1 = this.vertices[2];

    //P1 coords
    var x2 = this.vertices[3];
    var y2 = this.vertices[4];
    var z2 = this.vertices[5];

    //P2 coords
    var x3 = this.vertices[6];
    var y3 = this.vertices[7];
    var z3 = this.vertices[8];

    //Calculation of distance between vertices
    var a = Math.sqrt(Math.pow((x1 - x3), 2) + Math.pow((y1 - y3), 2) + Math.pow((z1 - z3), 2));  //distance between P0 e P2
    var b = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) + Math.pow((z2 - z1), 2));  //distance between P0 e P1
    var c = Math.sqrt(Math.pow((x3 - x2), 2) + Math.pow((y3 - y2), 2) + Math.pow((z3 - z2), 2));  //distance between P1 e P2

    var cosA = (-a * a + b * b + c * c) / (2 * b * c); //the cosseno of the angle between P0 E P2

    this.texCoords = []; //reset the tex coords vector to erase previous applications of textures
    this.texCoords.push(
            (b * cosA) / amplif_s, 1 - (b * Math.sin(Math.acos(cosA))) / amplif_t,
            0, 1,
            c / amplif_s, 1
            );

    this.updateTexCoordsGLBuffers();
}
