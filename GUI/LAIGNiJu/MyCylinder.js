/**
 * MyCylinder. This class represents a cylinder and has variable height, radius of the bottom and top circles, stacks, slices and is capable of having or not the top and bottom caps (according to the parameters it receives as parameter)
 * @constructor
 */
function MyCylinder(scene, height, bottomRadius, topRadius, stacks, slices, hasTopCap, hasBottomCap)  //args is an array with the arguments of the object (in this case slices and stacks)
{
    //Stores the arguments it receieves as parameter as fields for later application
    CGFobject.call(this, scene);

    this.height = height;
    this.radius = bottomRadius;
    this.bottomRadius = bottomRadius;
    this.topRadius = topRadius;

    this.slices = slices;
    this.stacks = stacks;

    this.bottomBase = new MyBase(this.scene, this.slices);
    this.topBase = new MyBase(this.scene, this.slices);
    this.hasTopCap = hasTopCap;
    this.hasBottomCap = hasBottomCap;

    this.initBuffers();
}
;

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;
/**
 * Initializes the graphics buffers necessary to display the triangles that constitue the MyCylinder class.
 */
MyCylinder.prototype.initBuffers = function ()
{
    var sLength = 1 / this.slices;
    var tLength = 1 / this.stacks;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];


    var theta = (2 * Math.PI) / this.slices;

    var v_x, v_y, v_z;
    var higher_radius;
    var delta_radius = this.bottomRadius - this.topRadius;

    //Add the vertexes that form the body of the cylinder in the form of slices and stacks (using triangles)
    for (var j = 0; j <= this.stacks; j++)
    {
        var j_progress = j / this.stacks;
        var mult = this.bottomRadius - j_progress * delta_radius;
        for (var i = 0; i <= this.slices; i++)
        {
            v_x = Math.cos(i * theta) * mult;
            v_y = Math.sin(i * theta) * mult;
            v_z = j / this.stacks;

            this.vertices.push(v_x, v_y, v_z);
            this.normals.push(v_x, v_y, v_z);
        }
    }

    //Connect the vertexes of the body of the cylinder forming the specified slices and stacks (forming triangles as the most basic primitive)
    for (var j = 0; j < this.stacks; j++)
    {
        for (var i = 0; i < this.slices; i++)
        {
            this.indices.push(j * (this.slices + 1) + i, j * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i);
            this.indices.push(j * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i + 1, (j + 1) * (this.slices + 1) + i);
        }
    }

    //Apply texture to the body of the cylinder (the texture is rolled up arround the cylinder)
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


MyCylinder.prototype.display = function ()
{
    //Display the top base (only if the parameter of the constructor demand it), applying the necessary trasnformations
    if (this.hasTopCap)
    {
        this.scene.pushMatrix();
        this.scene.scale(this.topRadius, this.topRadius, 1);
        this.scene.translate(0, 0, this.height);
        this.topBase.display();
        this.scene.popMatrix();
    }

    //Display the bottom base (only if the parameter of the constructor demand it), applying the necessary trasnformations
    if (this.hasBottomCap)
    {
        this.scene.pushMatrix();
        this.scene.scale(this.bottomRadius, this.bottomRadius, 1);
        this.scene.rotate(180 * degToRad, 0, 1, 0);
        this.topBase.display();
        this.scene.popMatrix();
    }

    //Display the body of the cylinder, applying the necessary trasnformations
    this.scene.pushMatrix();
    this.scene.scale(1, 1, this.height);
    CGFobject.prototype.display.call(this);
    this.scene.popMatrix();
};
