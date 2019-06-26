/**
 * MyPatch.  A class that represents a patch. It draws a surface with a specified number of divisions on U e V. This forms a poligonal mash with (U+1) * (V+1) control vertexes.
 * @constructor
 */
function MyPatch(scene, U_divisions, V_divisions, U_degree, V_degree)
{
    this.scene = scene;
    this.u_divisions = U_divisions;
    this.v_divisions = V_divisions;
    this.u_degree = U_degree;
    this.v_degree = V_degree;
    this.number_of_u_control_points = this.u_degree + 1;
    this.number_of_v_control_points = this.v_degree + 1;

    //create an empty a matrix with (u_divisions+1) rows and (v_divisions+1) columns
    this.controlvertexes = [];
    for (var i = 0; i < this.u_divisions + 1; i++)
        this.controlvertexes[i] = new Array(this.v_divisions + 1);
}
;

MyPatch.prototype.finalizePatch = function ()
{
    this.makeSurface(this.u_degree, this.v_degree, this.controlvertexes);
}

MyPatch.prototype.display = function ()
{
    this.nurb.display();
}

MyPatch.prototype.pushControlVertex = function (u, v, vertex)
{
    this.controlvertexes[u][v] = vertex;
}

MyPatch.prototype.setControlVertexes = function (vertexes)
{
    this.controlvertexes = vertexes;
}

//  Get Knots vectors
MyPatch.prototype.getKnotsVector = function (degree)
{
    var v = new Array();
    for (var i = 0; i <= degree; i++)
        v.push(0);

    for (var i = 0; i <= degree; i++)
        v.push(1);

    return v;
}

//This function is called to build the surface using the control vertexes previously filled and the degrees in u and v. This funtion uses the WebCGF library function to create the nurbObject 
MyPatch.prototype.makeSurface = function (u_degree, v_degree, controlvertexes)
{
    var knots_u = this.getKnotsVector(u_degree);
    var knots_v = this.getKnotsVector(v_degree);
    var nurbsSurface = new CGFnurbsSurface(u_degree, v_degree, knots_u, knots_v, controlvertexes);
    getSurfacePoint = function (u, v)
    {
        return nurbsSurface.getPoint(u, v);
    };

    this.nurb = new CGFnurbsObject(this.scene, getSurfacePoint, this.u_divisions, this.v_divisions);
}
