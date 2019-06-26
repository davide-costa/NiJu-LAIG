/**
 * MyBase. Represents the caps of the Cylinder (MyCylinder class). It is a circle made of slices (each slices is a triangle).
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyBase(scene, slices)
{
    CGFobject.call(this, scene);
    this.scene = scene;
    this.slices = slices;

    this.initBuffers();
}
;

MyBase.prototype = Object.create(CGFobject.prototype);
MyBase.prototype.constructor = MyBase;

/**
 * Initializes the graphics buffers necessary to display the triangles that constitue the MyBase class.
 */
MyBase.prototype.initBuffers = function ()
{
    var theta = (2 * Math.PI) / this.slices; //the angle of each slice
    var sLength = 1 / this.slices;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];


    //Draw front of clock (base of cylinder)
    var v_x, v_y, v_z;
    v_z = 0 //for the base, v_z is always equal to 1

    this.vertices.push(0, 0, v_z); //middle vertice
    this.texCoords.push(0.5, 0.5);
    this.normals.push(0, 0, 1);

    //Add the vertexes that form the the circle in the form of slices (each slice is a triangle)
    for (var i = 0; i <= this.slices; i++)
    {
        v_x = Math.cos(i * theta);
        v_y = Math.sin(i * theta);

        this.vertices.push(v_x, v_y, v_z);
        this.texCoords.push(v_x / 2 + 0.5, -v_y / 2 + 0.5);
        this.normals.push(0, 0, 1);
    }

    //Connect the vertexes of the circle forming the specified slices (each slice is a triangle)
    for (var i = 1; i <= this.slices; i++)
    {
        this.indices.push(0, i, i + 1);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();

}