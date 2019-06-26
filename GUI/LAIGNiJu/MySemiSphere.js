/**
 * MySemiSphere. Represents a semisphere (half of a sphere). The constructor receives the radius, slices and stacks as parameters. It is built using triangles. The number of triangles increases as the slices and stacks increse.
 * @constructor
 */
function MySemiSphere(scene, radius, slices, stacks)
{
    //save all parameters it receives as field for later application
    CGFobject.call(this, scene);

    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
}
;

MySemiSphere.prototype = Object.create(CGFobject.prototype);
MySemiSphere.prototype.constructor = MySemiSphere;

MySemiSphere.prototype.initBuffers = function ()
{
    //Create empty vectors of vertices,indices, normals and texCoords for later filling (with push method from arrays in javascript)
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var sLength = 1 / this.slices;
    var tLength = 1 / this.stacks;

    var theta = (2 * Math.PI) / this.slices; //The angle of each slice
    var alpha = (Math.PI / 2) / this.stacks; //The angle of each stack

    var v_x, v_y, v_z;

    //Add the vertexes that form the semisphere in the form of slices and stacks (using triangles)
    for (var j = 0; j <= this.stacks; j++)
    {
        for (var i = 0; i <= this.slices; i++)
        {
            v_x = Math.cos(j * alpha) * Math.cos(i * theta);
            v_y = Math.cos(j * alpha) * Math.sin(i * theta);
            v_z = Math.sin(j * alpha);

            this.vertices.push(v_x, v_y, v_z);
            this.normals.push(v_x, v_y, v_z);
        }
    }

    //Connect the vertexes of the body of the semisphere forming the specified slices and stacks (forming triangles as the most basic primitive)
    for (var j = 0; j < this.stacks; j++)
    {
        for (var i = 0; i < this.slices; i++)
        {
            this.indices.push(j * (this.slices + 1) + i, j * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i);
            this.indices.push(j * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i);
        }
    }

    //Apply texture to the body of the semisphere (the texture is rolled up arround the semisphere)
    for (var t = 0; t <= this.stacks; t++)
    {
        for (var s = 0; s <= this.slices; s++)
        {
            this.texCoords.push(sLength * s, tLength * t);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

//Changes the size of the SemiSphere (can be called in runtime to make animations)
MySemiSphere.prototype.SetSize = function (size)
{
    this.size = size
};
