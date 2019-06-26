var deg2rad = Math.PI / 180.0;

/**
 * MyUnitCubeQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyUnitCubeQuad(scene)
{
    CGFobject.call(this, scene);
    this.quad = new MyQuad(this.scene);
}
;

MyUnitCubeQuad.prototype = Object.create(CGFobject.prototype);
MyUnitCubeQuad.prototype.constructor = MyUnitCubeQuad;
/**
 * Displays the MyUnitCubeQuas instance.
 */
MyUnitCubeQuad.prototype.display = function ()
{
    //Face frente
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    //face tras
    this.scene.pushMatrix();
    this.scene.translate(0, 0, -0.5);
    this.scene.rotate(180 * deg2rad, 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face direita
    this.scene.pushMatrix();
    this.scene.translate(0.5, 0, 0);
    this.scene.rotate(90 * deg2rad, 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face esquerda
    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0, 0);
    this.scene.rotate(-90 * deg2rad, 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face baixo
    this.scene.pushMatrix();
    this.scene.translate(0, -0.5, 0);
    this.scene.rotate(90 * deg2rad, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face cima
    this.scene.pushMatrix();
    this.scene.translate(0, 0.5, 0);
    this.scene.rotate(-90 * deg2rad, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();

}