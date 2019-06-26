var degToRad = Math.PI / 180.0;

/**
 * MySphere. Represents a sphere. Internally it is built using two semispheres (represented by the class MySemiSphere). The constructor receives as parameters the radius, the number of slices and stacks.
 * @constructor
 */
function MySphere(scene, radius, slices, stacks)
{
    CGFobject.call(this, scene);

    this.scene = scene;
    this.radius = radius;
    this.semi_sphere1 = new MySemiSphere(scene, radius, slices, stacks); //the first semi sphere
    this.semi_sphere2 = new MySemiSphere(scene, radius, slices, stacks); //the second semi sphere
}
;

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.display = function ()
{
    this.scene.pushMatrix();
    this.scene.scale(this.radius, this.radius, this.radius);
    this.semi_sphere1.display();
    this.scene.rotate(180 * degToRad, 1, 0, 0); //rotate the semisphere to form an entire sphere (along with the not rotated semisphere)
    this.semi_sphere2.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.popMatrix();
};