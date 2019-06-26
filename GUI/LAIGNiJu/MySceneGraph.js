var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ILLUMINATION_INDEX = 1;
var LIGHTS_INDEX = 2;
var TEXTURES_INDEX = 3;
var MATERIALS_INDEX = 4;
var ANIMATIONS_INDEX = 5;
var LEAVES_INDEX = 6;
var NODES_INDEX = 7;

/**
 * MySceneGraph class, representing the scene graph.
 * @constructor
 */
function MySceneGraph(filename, scene, game)
{
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null;                    // The id of the root element.

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading 
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open('scenes/' + filename, this);

    //game instance
    this.game = game;
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function ()
{
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseLSXFile(rootElement);

    if (error != null)
    {
        this.onXMLError(error);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
}

/**
 * Parses the LSX file, processing each block.
 */
MySceneGraph.prototype.parseLSXFile = function (rootElement)
{
    if (rootElement.nodeName != "SCENE")
        return "root tag <SCENE> missing";

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++)
    {
        nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    // <INITIALS>
    var index;
    if ((index = nodeNames.indexOf("INITIALS")) == -1)
        return "tag <INITIALS> missing";
    else
    {
        if (index != INITIALS_INDEX)
            this.onXMLMinorError("tag <INITIALS> out of order");

        if ((error = this.parseInitials(nodes[index])) != null)
            return error;
    }

    // <ILLUMINATION>
    if ((index = nodeNames.indexOf("ILLUMINATION")) == -1)
        return "tag <ILLUMINATION> missing";
    else
    {
        if (index != ILLUMINATION_INDEX)
            this.onXMLMinorError("tag <ILLUMINATION> out of order");

        if ((error = this.parseIllumination(nodes[index])) != null)
            return error;
    }

    // <LIGHTS>
    if ((index = nodeNames.indexOf("LIGHTS")) == -1)
        return "tag <LIGHTS> missing";
    else
    {
        if (index != LIGHTS_INDEX)
            this.onXMLMinorError("tag <LIGHTS> out of order");

        if ((error = this.parseLights(nodes[index])) != null)
            return error;
    }

    // <TEXTURES>
    if ((index = nodeNames.indexOf("TEXTURES")) == -1)
        return "tag <TEXTURES> missing";
    else
    {
        if (index != TEXTURES_INDEX)
            this.onXMLMinorError("tag <TEXTURES> out of order");

        if ((error = this.parseTextures(nodes[index])) != null)
            return error;
    }

    // <MATERIALS>
    if ((index = nodeNames.indexOf("MATERIALS")) == -1)
        return "tag <MATERIALS> missing";
    else
    {
        if (index != MATERIALS_INDEX)
            this.onXMLMinorError("tag <MATERIALS> out of order");

        if ((error = this.parseMaterials(nodes[index])) != null)
            return error;
    }

    // <ANIMATIONS>
    if ((index = nodeNames.indexOf("ANIMATIONS")) != -1)
    {
        if (index != ANIMATIONS_INDEX)
            this.onXMLMinorError("tag <ANIMATIONS> out of order");

        if ((error = this.parseAnimations(nodes[index])) != null)
            return error;
    }

    // <NODES>
    if ((index = nodeNames.indexOf("NODES")) == -1)
        return "tag <NODES> missing";
    else
    {
        if (index != NODES_INDEX)
            this.onXMLMinorError("tag <NODES> out of order");

        if ((error = this.parseNodes(nodes[index])) != null)
            return error;
    }

    //Make a pre processing of the animation times for better efficiency at repetitive tasks on runtime
    for (let nodeID in this.nodes)
    {
        let node = this.nodes[nodeID];
        node.animations.ParseAnimationsTimes(this.animations);
    }

}

/**
 * Parses the <INITIALS> block.
 */
MySceneGraph.prototype.parseInitials = function (initialsNode)
{

    var children = initialsNode.children;

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Frustum planes.
    this.near = 0.1;
    this.far = 500;
    var indexFrustum = nodeNames.indexOf("frustum");
    if (indexFrustum == -1)
    {
        this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
    } else
    {
        this.near = this.reader.getFloat(children[indexFrustum], 'near');
        this.far = this.reader.getFloat(children[indexFrustum], 'far');

        if (this.near == null)
        {
            this.near = 0.1;
            this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
        } else if (this.far == null)
        {
            this.far = 500;
            this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
        } else if (isNaN(this.near))
        {
            this.near = 0.1;
            this.onXMLMinorError("non-numeric value found for near plane; assuming 'near = 0.1'");
        } else if (isNaN(this.far))
        {
            this.far = 500;
            this.onXMLMinorError("non-numeric value found for far plane; assuming 'far = 500'");
        } else if (this.near <= 0)
        {
            this.near = 0.1;
            this.onXMLMinorError("'near' must be positive; assuming 'near = 0.1'");
        }

        if (this.near >= this.far)
            return "'near' must be smaller than 'far'";
    }

    // Checks if at most one translation, three rotations, and one scaling are defined.
    if (initialsNode.getElementsByTagName('translation').length > 1)
        return "no more than one initial translation may be defined";

    if (initialsNode.getElementsByTagName('rotation').length > 3)
        return "no more than three initial rotations may be defined";

    if (initialsNode.getElementsByTagName('scale').length > 1)
        return "no more than one scaling may be defined";

    // Initial transforms.
    this.initialTranslate = [];
    this.initialScaling = [];
    this.initialRotations = [];

    // Gets indices of each element.
    var translationIndex = nodeNames.indexOf("translation");
    var thirdRotationIndex = nodeNames.indexOf("rotation");
    var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
    var firstRotationIndex = nodeNames.lastIndexOf("rotation");
    var scalingIndex = nodeNames.indexOf("scale");

    // Checks if the indices are valid and in the expected order.
    // Translation.
    this.initialTransforms = mat4.create();
    mat4.identity(this.initialTransforms);
    if (translationIndex == -1)
        this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
    else
    {
        var tx = this.reader.getFloat(children[translationIndex], 'x');
        var ty = this.reader.getFloat(children[translationIndex], 'y');
        var tz = this.reader.getFloat(children[translationIndex], 'z');

        if (tx == null)
        {
            tx = 0;
            this.onXMLMinorError("failed to parse x-coordinate of initial translation; assuming tx = 0");
        } else if (isNaN(tx))
        {
            tx = 0;
            this.onXMLMinorError("found non-numeric value for x-coordinate of initial translation; assuming tx = 0");
        }

        if (ty == null)
        {
            ty = 0;
            this.onXMLMinorError("failed to parse y-coordinate of initial translation; assuming ty = 0");
        } else if (isNaN(ty))
        {
            ty = 0;
            this.onXMLMinorError("found non-numeric value for y-coordinate of initial translation; assuming ty = 0");
        }

        if (tz == null)
        {
            tz = 0;
            this.onXMLMinorError("failed to parse z-coordinate of initial translation; assuming tz = 0");
        } else if (isNaN(tz))
        {
            tz = 0;
            this.onXMLMinorError("found non-numeric value for z-coordinate of initial translation; assuming tz = 0");
        }

        if (translationIndex > thirdRotationIndex || translationIndex > scalingIndex)
            this.onXMLMinorError("initial translation out of order; result may not be as expected");

        mat4.translate(this.initialTransforms, this.initialTransforms, [tx, ty, tz]);
    }

    // Rotations.
    var initialRotations = [];
    initialRotations['x'] = 0;
    initialRotations['y'] = 0;
    initialRotations['z'] = 0;

    var rotationDefined = [];
    rotationDefined['x'] = false;
    rotationDefined['y'] = false;
    rotationDefined['z'] = false;

    var axis;
    var rotationOrder = [];

    // Third rotation (first rotation defined).
    if (thirdRotationIndex != -1)
    {
        axis = this.reader.getItem(children[thirdRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null)
        {
            var angle = this.reader.getFloat(children[thirdRotationIndex], 'angle');
            if (angle != null && !isNaN(angle))
            {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else
                this.onXMLMinorError("failed to parse third initial rotation 'angle'");
        }
    }

    // Second rotation.
    if (secondRotationIndex != -1)
    {
        axis = this.reader.getItem(children[secondRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null)
        {
            var angle = this.reader.getFloat(children[secondRotationIndex], 'angle');
            if (angle != null && !isNaN(angle))
            {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else
                this.onXMLMinorError("failed to parse second initial rotation 'angle'");
        }
    }

    // First rotation.
    if (firstRotationIndex != -1)
    {
        axis = this.reader.getItem(children[firstRotationIndex], 'axis', ['x', 'y', 'z']);
        if (axis != null)
        {
            var angle = this.reader.getFloat(children[firstRotationIndex], 'angle');
            if (angle != null && !isNaN(angle))
            {
                initialRotations[axis] += angle;
                if (!rotationDefined[axis])
                    rotationOrder.push(axis);
                rotationDefined[axis] = true;
            } else
                this.onXMLMinorError("failed to parse first initial rotation 'angle'");
        }
    }

    // Checks for undefined rotations.
    if (!rotationDefined['x'])
        this.onXMLMinorError("rotation along the Ox axis undefined; assuming Rx = 0");
    else if (!rotationDefined['y'])
        this.onXMLMinorError("rotation along the Oy axis undefined; assuming Ry = 0");
    else if (!rotationDefined['z'])
        this.onXMLMinorError("rotation along the Oz axis undefined; assuming Rz = 0");

    // Updates transform matrix.
    for (var i = 0; i < rotationOrder.length; i++)
        mat4.rotate(this.initialTransforms, this.initialTransforms, DEGREE_TO_RAD * initialRotations[rotationOrder[i]], this.axisCoords[rotationOrder[i]]);

    // Scaling.
    if (scalingIndex == -1)
        this.onXMLMinorError("initial scaling undefined; assuming S = (1, 1, 1)");
    else
    {
        var sx = this.reader.getFloat(children[scalingIndex], 'sx');
        var sy = this.reader.getFloat(children[scalingIndex], 'sy');
        var sz = this.reader.getFloat(children[scalingIndex], 'sz');

        if (sx == null)
        {
            sx = 1;
            this.onXMLMinorError("failed to parse x parameter of initial scaling; assuming sx = 1");
        } else if (isNaN(sx))
        {
            sx = 1;
            this.onXMLMinorError("found non-numeric value for x parameter of initial scaling; assuming sx = 1");
        }

        if (sy == null)
        {
            sy = 1;
            this.onXMLMinorError("failed to parse y parameter of initial scaling; assuming sy = 1");
        } else if (isNaN(sy))
        {
            sy = 1;
            this.onXMLMinorError("found non-numeric value for y parameter of initial scaling; assuming sy = 1");
        }

        if (sz == null)
        {
            sz = 1;
            this.onXMLMinorError("failed to parse z parameter of initial scaling; assuming sz = 1");
        } else if (isNaN(sz))
        {
            sz = 1;
            this.onXMLMinorError("found non-numeric value for z parameter of initial scaling; assuming sz = 1");
        }

        if (scalingIndex < firstRotationIndex)
            this.onXMLMinorError("initial scaling out of order; result may not be as expected");

        mat4.scale(this.initialTransforms, this.initialTransforms, [sx, sy, sz]);
    }

    // ----------
    // Reference length.
    this.referenceLength = 1;

    var indexReference = nodeNames.indexOf("reference");
    if (indexReference == -1)
        this.onXMLMinorError("reference length undefined; assuming 'length = 1'");
    else
    {
        // Reads the reference length.
        var length = this.reader.getFloat(children[indexReference], 'length');

        if (length != null)
        {
            if (isNaN(length))
                this.onXMLMinorError("found non-numeric value for reference length; assuming 'length = 1'");
            else if (length <= 0)
                this.onXMLMinorError("reference length must be a positive value; assuming 'length = 1'");
            else
                this.referenceLength = length;
        } else
            this.onXMLMinorError("unable to parse reference length; assuming 'length = 1'");

    }

    console.log("Parsed initials");

    return null;
}

/**
 * Parses the <ILLUMINATION> block.
 */
MySceneGraph.prototype.parseIllumination = function (illuminationNode)
{

    // Reads the ambient and background values.
    var children = illuminationNode.children;
    var nodeNames = [];
    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Retrieves the global ambient illumination.
    this.ambientIllumination = [0, 0, 0, 1];
    var ambientIndex = nodeNames.indexOf("ambient");
    if (ambientIndex != -1)
    {
        // R.
        var r = this.reader.getFloat(children[ambientIndex], 'r');
        if (r != null)
        {
            if (isNaN(r))
                return "ambient 'r' is a non numeric value on the ILLUMINATION block";
            else if (r < 0 || r > 1)
                return "ambient 'r' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[0] = r;
        } else
            this.onXMLMinorError("unable to parse R component of the ambient illumination; assuming R = 0");

        // G.
        var g = this.reader.getFloat(children[ambientIndex], 'g');
        if (g != null)
        {
            if (isNaN(g))
                return "ambient 'g' is a non numeric value on the ILLUMINATION block";
            else if (g < 0 || g > 1)
                return "ambient 'g' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[1] = g;
        } else
            this.onXMLMinorError("unable to parse G component of the ambient illumination; assuming G = 0");

        // B.
        var b = this.reader.getFloat(children[ambientIndex], 'b');
        if (b != null)
        {
            if (isNaN(b))
                return "ambient 'b' is a non numeric value on the ILLUMINATION block";
            else if (b < 0 || b > 1)
                return "ambient 'b' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[2] = b;
        } else
            this.onXMLMinorError("unable to parse B component of the ambient illumination; assuming B = 0");

        // A.
        var a = this.reader.getFloat(children[ambientIndex], 'a');
        if (a != null)
        {
            if (isNaN(a))
                return "ambient 'a' is a non numeric value on the ILLUMINATION block";
            else if (a < 0 || a > 1)
                return "ambient 'a' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.ambientIllumination[3] = a;
        } else
            this.onXMLMinorError("unable to parse A component of the ambient illumination; assuming A = 1");
    } else
        this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0, 0, 0, 1)");

    // Retrieves the background clear color.
    this.background = [0, 0, 0, 1];
    var backgroundIndex = nodeNames.indexOf("background");
    if (backgroundIndex != -1)
    {
        // R.
        var r = this.reader.getFloat(children[backgroundIndex], 'r');
        if (r != null)
        {
            if (isNaN(r))
                return "background 'r' is a non numeric value on the ILLUMINATION block";
            else if (r < 0 || r > 1)
                return "background 'r' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[0] = r;
        } else
            this.onXMLMinorError("unable to parse R component of the background colour; assuming R = 0");

        // G.
        var g = this.reader.getFloat(children[backgroundIndex], 'g');
        if (g != null)
        {
            if (isNaN(g))
                return "background 'g' is a non numeric value on the ILLUMINATION block";
            else if (g < 0 || g > 1)
                return "background 'g' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[1] = g;
        } else
            this.onXMLMinorError("unable to parse G component of the background colour; assuming G = 0");

        // B.
        var b = this.reader.getFloat(children[backgroundIndex], 'b');
        if (b != null)
        {
            if (isNaN(b))
                return "background 'b' is a non numeric value on the ILLUMINATION block";
            else if (b < 0 || b > 1)
                return "background 'b' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[2] = b;
        } else
            this.onXMLMinorError("unable to parse B component of the background colour; assuming B = 0");

        // A.
        var a = this.reader.getFloat(children[backgroundIndex], 'a');
        if (a != null)
        {
            if (isNaN(a))
                return "background 'a' is a non numeric value on the ILLUMINATION block";
            else if (a < 0 || a > 1)
                return "background 'a' must be a value between 0 and 1 on the ILLUMINATION block"
            else
                this.background[3] = a;
        } else
            this.onXMLMinorError("unable to parse A component of the background colour; assuming A = 1");
    } else
        this.onXMLMinorError("background clear colour undefined; assuming (R, G, B, A) = (0, 0, 0, 1)");

    console.log("Parsed illumination");

    return null;
}

/**
 * Parses the <LIGHTS> node.
 */
MySceneGraph.prototype.parseLights = function (lightsNode)
{

    var children = lightsNode.children;

    this.lights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++)
    {

        if (children[i].nodeName != "LIGHT")
        {
            this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current light.
        var lightId = this.reader.getString(children[i], 'id');
        if (lightId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        grandChildren = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++)
            nodeNames.push(grandChildren[j].nodeName);

        // Gets indices of each element.
        var enableIndex = nodeNames.indexOf("enable");
        var positionIndex = nodeNames.indexOf("position");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        // Light enable/disable
        var enableLight = true;
        if (enableIndex == -1)
        {
            this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
        } else
        {
            var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
            if (aux == null)
            {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
            } else if (isNaN(aux))
                return "'enable value' is a non numeric value on the LIGHTS block";
            else if (aux != 0 && aux != 1)
                return "'enable value' must be 0 or 1 on the LIGHTS block"
            else
                enableLight = aux == 0 ? false : true;
        }

        // Retrieves the light position.
        var positionLight = [];
        if (positionIndex != -1)
        {
            // x
            var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
            if (x != null)
            {
                if (isNaN(x))
                    return "'x' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(x);
            } else
                return "unable to parse x-coordinate of the light position for ID = " + lightId;

            // y
            var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
            if (y != null)
            {
                if (isNaN(y))
                    return "'y' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(y);
            } else
                return "unable to parse y-coordinate of the light position for ID = " + lightId;

            // z
            var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
            if (z != null)
            {
                if (isNaN(z))
                    return "'z' is a non numeric value on the LIGHTS block";
                else
                    positionLight.push(z);
            } else
                return "unable to parse z-coordinate of the light position for ID = " + lightId;

            // w
            var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
            if (w != null)
            {
                if (isNaN(w))
                    return "'w' is a non numeric value on the LIGHTS block";
                else if (w < 0 || w > 1)
                    return "'w' must be a value between 0 and 1 on the LIGHTS block"
                else
                    positionLight.push(w);
            } else
                return "unable to parse w-coordinate of the light position for ID = " + lightId;
        } else
            return "light position undefined for ID = " + lightId;

        // Retrieves the ambient component.
        var ambientIllumination = [];
        if (ambientIndex != -1)
        {
            // R
            var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
            if (r != null)
            {
                if (isNaN(r))
                    return "ambient 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "ambient 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(r);
            } else
                return "unable to parse R component of the ambient illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
            if (g != null)
            {
                if (isNaN(g))
                    return "ambient 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "ambient 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(g);
            } else
                return "unable to parse G component of the ambient illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
            if (b != null)
            {
                if (isNaN(b))
                    return "ambient 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "ambient 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    ambientIllumination.push(b);
            } else
                return "unable to parse B component of the ambient illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
            if (a != null)
            {
                if (isNaN(a))
                    return "ambient 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "ambient 'a' must be a value between 0 and 1 on the LIGHTS block"
                ambientIllumination.push(a);
            } else
                return "unable to parse A component of the ambient illumination for ID = " + lightId;
        } else
            return "ambient component undefined for ID = " + lightId;

        // Retrieves the diffuse component
        var diffuseIllumination = [];
        if (diffuseIndex != -1)
        {
            // R
            var r = this.reader.getFloat(grandChildren[diffuseIndex], 'r');
            if (r != null)
            {
                if (isNaN(r))
                    return "diffuse 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "diffuse 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(r);
            } else
                return "unable to parse R component of the diffuse illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[diffuseIndex], 'g');
            if (g != null)
            {
                if (isNaN(g))
                    return "diffuse 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "diffuse 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(g);
            } else
                return "unable to parse G component of the diffuse illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[diffuseIndex], 'b');
            if (b != null)
            {
                if (isNaN(b))
                    return "diffuse 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "diffuse 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(b);
            } else
                return "unable to parse B component of the diffuse illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[diffuseIndex], 'a');
            if (a != null)
            {
                if (isNaN(a))
                    return "diffuse 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "diffuse 'a' must be a value between 0 and 1 on the LIGHTS block"
                else
                    diffuseIllumination.push(a);
            } else
                return "unable to parse A component of the diffuse illumination for ID = " + lightId;
        } else
            return "diffuse component undefined for ID = " + lightId;

        // Retrieves the specular component
        var specularIllumination = [];
        if (specularIndex != -1)
        {
            // R
            var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
            if (r != null)
            {
                if (isNaN(r))
                    return "specular 'r' is a non numeric value on the LIGHTS block";
                else if (r < 0 || r > 1)
                    return "specular 'r' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(r);
            } else
                return "unable to parse R component of the specular illumination for ID = " + lightId;

            // G
            var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
            if (g != null)
            {
                if (isNaN(g))
                    return "specular 'g' is a non numeric value on the LIGHTS block";
                else if (g < 0 || g > 1)
                    return "specular 'g' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(g);
            } else
                return "unable to parse G component of the specular illumination for ID = " + lightId;

            // B
            var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
            if (b != null)
            {
                if (isNaN(b))
                    return "specular 'b' is a non numeric value on the LIGHTS block";
                else if (b < 0 || b > 1)
                    return "specular 'b' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(b);
            } else
                return "unable to parse B component of the specular illumination for ID = " + lightId;

            // A
            var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
            if (a != null)
            {
                if (isNaN(a))
                    return "specular 'a' is a non numeric value on the LIGHTS block";
                else if (a < 0 || a > 1)
                    return "specular 'a' must be a value between 0 and 1 on the LIGHTS block"
                else
                    specularIllumination.push(a);
            } else
                return "unable to parse A component of the specular illumination for ID = " + lightId;
        } else
            return "specular component undefined for ID = " + lightId;

        // Light global information.
        this.lights[lightId] = [enableLight, positionLight, ambientIllumination, diffuseIllumination, specularIllumination];
        numLights++;
    }

    if (numLights == 0)
        return "at least one light must be defined";
    else if (numLights > 8)
        this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

    console.log("Parsed lights");

    return null;
}

/**
 * Parses the <TEXTURES> block.
 */
MySceneGraph.prototype.parseTextures = function (texturesNode)
{

    this.textures = [];

    // Each texture.
    var eachTexture = texturesNode.children;

    var oneTextureDefined = false;

    for (var i = 0; i < eachTexture.length; i++)
    {
        var nodeName = eachTexture[i].nodeName;
        if (nodeName == "TEXTURE")
        {
            // Retrieves texture ID.
            var textureID = this.reader.getString(eachTexture[i], 'id');
            if (textureID == null)
                return "failed to parse texture ID";
            // Checks if ID is valid.
            if (this.textures[textureID] != null)
                return "texture ID must unique (conflict with ID = " + textureID + ")";

            var texSpecs = eachTexture[i].children;
            var filepath = null;
            var amplifFactorS = null;
            var amplifFactorT = null;
            // Retrieves texture specifications.
            for (var j = 0; j < texSpecs.length; j++)
            {
                var name = texSpecs[j].nodeName;
                if (name == "file")
                {
                    if (filepath != null)
                        return "duplicate file paths in texture with ID = " + textureID;

                    filepath = this.reader.getString(texSpecs[j], 'path');
                    if (filepath == null)
                        return "unable to parse texture file path for ID = " + textureID;
                } else if (name == "amplif_factor")
                {
                    if (amplifFactorS != null || amplifFactorT != null)
                        return "duplicate amplification factors in texture with ID = " + textureID;

                    amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
                    amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

                    if (amplifFactorS == null || amplifFactorT == null)
                        return "unable to parse texture amplification factors for ID = " + textureID;
                    else if (isNaN(amplifFactorS))
                        return "'amplifFactorS' is a non numeric value";
                    else if (isNaN(amplifFactorT))
                        return "'amplifFactorT' is a non numeric value";
                    else if (amplifFactorS <= 0 || amplifFactorT <= 0)
                        return "value for amplifFactor must be positive";
                } else
                    this.onXMLMinorError("unknown tag name <" + name + ">");
            }

            if (filepath == null)
                return "file path undefined for texture with ID = " + textureID;
            else if (amplifFactorS == null)
                return "s amplification factor undefined for texture with ID = " + textureID;
            else if (amplifFactorT == null)
                return "t amplification factor undefined for texture with ID = " + textureID;

            var texture = new CGFtexture(this.scene, "./scenes/" + filepath);

            this.textures[textureID] = [texture, amplifFactorS, amplifFactorT];
            oneTextureDefined = true;
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName + ">");
    }

    if (!oneTextureDefined)
        return "at least one texture must be defined in the TEXTURES block";

    console.log("Parsed textures");
}

/**
 * Parses the <MATERIALS> node.
 */
MySceneGraph.prototype.parseMaterials = function (materialsNode)
{

    var children = materialsNode.children;
    // Each material.

    this.materials = [];

    var oneMaterialDefined = false;


    for (var i = 0; i < children.length; i++)
    {
        if (children[i].nodeName != "MATERIAL")
        {
            this.onXMLMinorError("unknown tag name <" + children[i].nodeName + ">");
            continue;
        }

        var materialID = this.reader.getString(children[i], 'id');
        if (materialID == null)
            return "no ID defined for material";

        if (this.materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";

        var materialSpecs = children[i].children;

        var nodeNames = [];

        for (var j = 0; j < materialSpecs.length; j++)
            nodeNames.push(materialSpecs[j].nodeName);

        // Determines the values for each field.
        // Shininess.
        var shininessIndex = nodeNames.indexOf("shininess");
        if (shininessIndex == -1)
            return "no shininess value defined for material with ID = " + materialID;
        var shininess = this.reader.getFloat(materialSpecs[shininessIndex], 'value');
        if (shininess == null)
            return "unable to parse shininess value for material with ID = " + materialID;
        else if (isNaN(shininess))
            return "'shininess' is a non numeric value";
        else if (shininess <= 0)
            return "'shininess' must be positive";

        // Specular component.
        var specularIndex = nodeNames.indexOf("specular");
        if (specularIndex == -1)
            return "no specular component defined for material with ID = " + materialID;
        var specularComponent = [];
        // R.
        var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');
        if (r == null)
            return "unable to parse R component of specular reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "specular 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
        specularComponent.push(r);
        // G.
        var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');
        if (g == null)
            return "unable to parse G component of specular reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "specular 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(g);
        // B.
        var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');
        if (b == null)
            return "unable to parse B component of specular reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "specular 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(b);
        // A.
        var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
        if (a == null)
            return "unable to parse A component of specular reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "specular 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(a);

        // Diffuse component.
        var diffuseIndex = nodeNames.indexOf("diffuse");
        if (diffuseIndex == -1)
            return "no diffuse component defined for material with ID = " + materialID;
        var diffuseComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');
        if (r == null)
            return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "diffuse 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
        if (g == null)
            return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "diffuse 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');
        if (b == null)
            return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "diffuse 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
        if (a == null)
            return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "diffuse 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(a);

        // Ambient component.
        var ambientIndex = nodeNames.indexOf("ambient");
        if (ambientIndex == -1)
            return "no ambient component defined for material with ID = " + materialID;
        var ambientComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
        if (r == null)
            return "unable to parse R component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "ambient 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');
        if (g == null)
            return "unable to parse G component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "ambient 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');
        if (b == null)
            return "unable to parse B component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "ambient 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
        if (a == null)
            return "unable to parse A component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "ambient 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(a);

        // Emission component.
        var emissionIndex = nodeNames.indexOf("emission");
        if (emissionIndex == -1)
            return "no emission component defined for material with ID = " + materialID;
        var emissionComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
        if (r == null)
            return "unable to parse R component of emission for material with ID = " + materialID;
        else if (isNaN(r))
            return "emisson 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
        if (g == null)
            return "unable to parse G component of emission for material with ID = " + materialID;
        if (isNaN(g))
            return "emisson 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
        if (b == null)
            return "unable to parse B component of emission for material with ID = " + materialID;
        else if (isNaN(b))
            return "emisson 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
        if (a == null)
            return "unable to parse A component of emission for material with ID = " + materialID;
        else if (isNaN(a))
            return "emisson 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(a);

        // Creates material with the specified characteristics.
        var newMaterial = new CGFappearance(this.scene);
        newMaterial.setShininess(shininess);
        newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
        newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
        newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
        newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
        this.materials[materialID] = newMaterial;
        oneMaterialDefined = true;
    }

    if (!oneMaterialDefined)
        return "at least one material must be defined on the MATERIALS block";

    // Generates a default material.
    this.generateDefaultMaterial();

    console.log("Parsed materials");
}


/**
 * Parses the <ANIMATIONS> node.
 */
MySceneGraph.prototype.parseAnimations = function (animationsNode)
{

    var children = animationsNode.children;

    // Each animation.
    this.animations = [];

    var oneAnimationDefined = false;


    for (var i = 0; i < children.length; i++)
    {
        if (children[i].nodeName != "ANIMATION")
        {
            this.onXMLMinorError("unknown tag name <" + children[i].nodeName + ">");
            continue;
        }

        var animationSpecs = children[i].children;

        var animationID = this.reader.getString(children[i], 'id');
        if (animationID == null)
            return "no ID defined for animation";

        if (this.animations[animationID] != null)
            return "ID must be unique for each animation (conflict: ID = " + animationID + ")";

        var animationSpecs = children[i].children;

        var nodeNames = [];
        var type = this.reader.getItem(children[i], 'type', ['linear', 'circular', 'bezier', 'combo']);

        if (type != null)
            this.log("   Animation: " + type);
        else
            this.warn("Error in animiation");

        var animation;

        switch (type)
        {
            case 'linear':
                var speed = Number(this.reader.getString(children[i], 'speed'));

                var cpoints = this.parseControlPoints(animationSpecs);
                animation = new LinearAnimation(speed, cpoints);
                break;

            case 'circular':

                var speed = Number(this.reader.getString(children[i], 'speed'));
                var centerx = Number(this.reader.getString(children[i], 'centerx'));
                var centery = Number(this.reader.getString(children[i], 'centery'));
                var centerz = Number(this.reader.getString(children[i], 'centerz'));
                var radius = Number(this.reader.getString(children[i], 'radius'));
                var startang = Number(this.reader.getString(children[i], 'startang'));
                var rotang = Number(this.reader.getString(children[i], 'rotang'));
                startang = startang * DEGREE_TO_RAD;
                rotang = rotang * DEGREE_TO_RAD;

                animation = new CircularAnimation(speed, [centerx, centery, centerz],
                        radius, startang, rotang);
                break;

            case 'bezier':
                var speed = Number(this.reader.getString(children[i], 'speed'));
                if (animationSpecs.length != 4)
                    return "Number of points in a bezier curve must be 4, representing P1, P2, P3, P4, but was " + animationSpecs.length;
                var cpoints = this.parseControlPoints(animationSpecs);
                animation = new BezierAnimation(speed, cpoints);
                break;

            case 'combo':
                var oneAnimationDefinedInCombo = false;
                var animationsIDs = [];
                var id;
                for (var j = 0; j < animationSpecs.length; j++)
                {

                    if ((id = this.reader.getString(animationSpecs[j], 'id')) == null)
                        throw new Error("No id found for subanimation of a combo animation. A subanimation of a combo anmation must be referred to through its id.");

                    animationsIDs.push(id);
                    oneAnimationDefinedInCombo = true;
                }

                if (!oneAnimationDefinedInCombo)
                    return "at least one animation must defined inside a combo animation when a combo animation is declared.";

                animation = new ComboAnimation(animationsIDs);

                break;
        }

        this.animations[animationID] = animation;
        oneAnimationDefined = true;
    }

    if (!oneAnimationDefined)
        return "at least one animation must be defined on the ANIMATIONS block";

    for (let animationID in this.animations)
    {
        let animation = this.animations[animationID];
        if (animation instanceof ComboAnimation)
        {
            let animationsOfComboAnimation = animation.animationsIDs;
            for (let i = 0; i < animationsOfComboAnimation.length; i++)
            {
                let animationIDOfComboAnimation = animationsOfComboAnimation[i];
                let animationOfComboAnimation = this.animations[animationIDOfComboAnimation];
                if (animationOfComboAnimation instanceof ComboAnimation)
                    return "A ComboAnimation cannot be defined inside another ComboAnimation.";
            }
        }
    }

    console.log("Parsed animations");
}

/**
 * Parses the control points of the XML file for both linear and bezier animations.
 */
MySceneGraph.prototype.parseControlPoints = function (cpointsNode)
{

    var cpoints = [];
    var point;
    for (var i = 0; i < cpointsNode.length; i++)
    {
        point = [];
        //X value
        var xx_value;
        if ((xx_value = this.reader.getString(cpointsNode[i], 'xx')) == null)
            throw new Error("Arguments of patch error: point_value for xx undeclared");
        point.push(xx_value);

        //Y value
        var yy_value;
        if ((yy_value = this.reader.getString(cpointsNode[i], 'yy')) == null)
            throw new Error("Arguments of patch error: point_value for yy undeclared");
        point.push(yy_value);

        //Z value
        var zz_value;
        if ((zz_value = this.reader.getString(cpointsNode[i], 'zz')) == null)
            throw new Error("Arguments of patch error: point_value for zz undeclared");
        point.push(zz_value);
        point = point.map(Number); //convert all array elements (strings) to numbers

        cpoints.push(point);
    }
    return cpoints;
}


/**
 * Parses the <NODES> block.
 */
MySceneGraph.prototype.parseNodes = function (nodesNode)
{
    this.selectableNodesIds = [];

    // Traverses nodes.
    var children = nodesNode.children;
    for (var i = 0; i < children.length; i++)
    {
        var nodeName;
        if ((nodeName = children[i].nodeName) == "ROOT")
        {
            // Retrieves root node.
            if (this.idRoot != null)
                return "there can only be one root node";
            else
            {
                var root = this.reader.getString(children[i], 'id');
                if (root == null)
                    return "failed to retrieve root node ID";
                this.idRoot = root;
            }
        } else if (nodeName == "NODE")
        {
            // Retrieves node ID.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "failed to retrieve node ID";
            // Checks if ID is valid.
            if (this.nodes[nodeID] != null)
                return "node ID must be unique (conflict: ID = " + nodeID + ")";

            // Creates node.
            this.nodes[nodeID] = new MyGraphNode(this, nodeID);
            this.log("Processing node " + nodeID);

            // Get selectable if exists
            var nodeSelectable = this.reader.getBoolean(children[i], 'selectable', 0);
            if (nodeSelectable == null)
                nodeSelectable = false;
            if (nodeSelectable == true)
                this.selectableNodesIds[nodeID] = true;

            // Gathers child nodes.
            var nodeSpecs = children[i].children;
            var specsNames = [];
            var possibleValues = ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "DESCENDANTS"];
            for (var j = 0; j < nodeSpecs.length; j++)
            {
                var name = nodeSpecs[j].nodeName;
                specsNames.push(nodeSpecs[j].nodeName);

                // Warns against possible invalid tag names.
                if (possibleValues.indexOf(name) == -1)
                    this.onXMLMinorError("unknown tag <" + name + ">");
            }

            // Retrieves material ID.
            var materialIndex = specsNames.indexOf("MATERIAL");
            if (materialIndex == -1)
                return "material must be defined (node ID = " + nodeID + ")";
            var materialID = this.reader.getString(nodeSpecs[materialIndex], 'id');
            if (materialID == null)
                return "unable to parse material ID (node ID = " + nodeID + ")";
            if (materialID != "null" && this.materials[materialID] == null)
                return "ID does not correspond to a valid material (node ID = " + nodeID + ")";

            this.nodes[nodeID].materialID = materialID;

            // Retrieves texture ID.
            var textureIndex = specsNames.indexOf("TEXTURE");
            if (textureIndex == -1)
                return "texture must be defined (node ID = " + nodeID + ")";
            var textureID = this.reader.getString(nodeSpecs[textureIndex], 'id');
            if (textureID == null)
                return "unable to parse texture ID (node ID = " + nodeID + ")";
            if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null)
                return "ID does not correspond to a valid texture (node ID = " + nodeID + ")";

            this.nodes[nodeID].textureID = textureID;

            // Retrieves possible transformations.
            for (var j = 0; j < nodeSpecs.length; j++)
            {
                switch (nodeSpecs[j].nodeName)
                {
                    case "TRANSLATION":
                        // Retrieves translation parameters.
                        var x = this.reader.getFloat(nodeSpecs[j], 'x');
                        if (x == null)
                        {
                            this.onXMLMinorError("unable to parse x-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(x))
                            return "non-numeric value for x-coordinate of translation (node ID = " + nodeID + ")";

                        var y = this.reader.getFloat(nodeSpecs[j], 'y');
                        if (y == null)
                        {
                            this.onXMLMinorError("unable to parse y-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(y))
                            return "non-numeric value for y-coordinate of translation (node ID = " + nodeID + ")";

                        var z = this.reader.getFloat(nodeSpecs[j], 'z');
                        if (z == null)
                        {
                            this.onXMLMinorError("unable to parse z-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(z))
                            return "non-numeric value for z-coordinate of translation (node ID = " + nodeID + ")";

                        mat4.translate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [x, y, z]);
                        break;
                    case "ROTATION":
                        // Retrieves rotation parameters.
                        var axis = this.reader.getItem(nodeSpecs[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null)
                        {
                            this.onXMLMinorError("unable to parse rotation axis; discarding transform");
                            break;
                        }
                        var angle = this.reader.getFloat(nodeSpecs[j], 'angle');
                        if (angle == null)
                        {
                            this.onXMLMinorError("unable to parse rotation angle; discarding transform");
                            break;
                        } else if (isNaN(angle))
                            return "non-numeric value for rotation angle (node ID = " + nodeID + ")";

                        mat4.rotate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                    case "SCALE":
                        // Retrieves scale parameters.
                        var sx = this.reader.getFloat(nodeSpecs[j], 'sx');
                        if (sx == null)
                        {
                            this.onXMLMinorError("unable to parse x component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sx))
                            return "non-numeric value for x component of scaling (node ID = " + nodeID + ")";

                        var sy = this.reader.getFloat(nodeSpecs[j], 'sy');
                        if (sy == null)
                        {
                            this.onXMLMinorError("unable to parse y component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sy))
                            return "non-numeric value for y component of scaling (node ID = " + nodeID + ")";

                        var sz = this.reader.getFloat(nodeSpecs[j], 'sz');
                        if (sz == null)
                        {
                            this.onXMLMinorError("unable to parse z component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sz))
                            return "non-numeric value for z component of scaling (node ID = " + nodeID + ")";

                        mat4.scale(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [sx, sy, sz]);
                        break;
                    default:
                        break;
                }
            }

            // Retrieves information about animations.
            var animationsIndex = specsNames.indexOf("ANIMATIONREFS");
            if (animationsIndex != -1)
            {
                var animations = nodeSpecs[animationsIndex].children;
                var sizeAnimations = 0;
                for (var j = 0; j < animations.length; j++)
                {
                    if (animations[j].nodeName == "ANIMATIONREF")
                    {

                        var curId = this.reader.getString(animations[j], 'id');

                        this.log("   Animation: " + curId);

                        if (curId == null)
                            this.onXMLMinorError("unable to parse animation id");
                        else if (this.animations[curId] == null)
                            return "Reference to non existant node id: " + curId;
                        else
                        {
                            this.nodes[nodeID].addAnimation(curId);
                            sizeAnimations++;
                        }
                    } else
                        this.onXMLMinorError("unknown tag <" + animations[j].nodeName + ">");

                }
                if (sizeAnimations == 0)
                    return "at least one animationref must be defined for the ANIMATIONREFS of a node";
            }

            // Retrieves information about children.
            var descendantsIndex = specsNames.indexOf("DESCENDANTS");
            if (descendantsIndex == -1)
                return "an intermediate node must have descendants";

            var descendants = nodeSpecs[descendantsIndex].children;

            var sizeChildren = 0;
            for (var j = 0; j < descendants.length; j++)
            {
                if (descendants[j].nodeName == "NODEREF")
                {

                    var curId = this.reader.getString(descendants[j], 'id');

                    this.log("   Descendant: " + curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse descendant id");
                    else if (curId == nodeID)
                        return "a node may not be a child of its own";
                    else
                    {
                        this.nodes[nodeID].addChild(curId);
                        sizeChildren++;
                    }
                } else
                if (descendants[j].nodeName == "LEAF")
                {
                    var type = this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'patch']);

                    if (type != null)
                        this.log("   Leaf: " + type);
                    else
                        this.warn("Error in leaf");

                    //this will separate the eleents of the args in an array
                    var args_str = this.reader.getString(descendants[j], 'args');
                    var args = args_str.split(' ').map(Number);

                    var object;
                    switch (type)
                    {
                        case 'rectangle':
                            object = new MyRectangle(this.scene, args);
                            break;
                        case 'cylinder':
                            object = new MyCylinder(this.scene, args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                            break;
                        case 'sphere':
                            object = new MySphere(this.scene, args[0], args[1], args[2]);
                            break;
                        case 'triangle':
                            object = new MyTriangle(this.scene, args);
                            break;
                        case 'patch':

                            //validation
                            var cplines = descendants[j].children;
                            if (cplines.length < 0)
                                throw new Error("A patch must have at least a CPLINE.");

                            object = new MyPatch(this.scene, args[0], args[1], cplines.length - 1, cplines[0].children.length - 1);

                            //iterate over cplines
                            for (var u = 0; u < cplines.length; u++)
                            {

                                //validation
                                if (cplines[u].nodeName != "CPLINE")
                                    throw new Error("LEAF of type Patch must have CPLINE tag");

                                var cpoints = cplines[u].children;

                                //validation
                                if (cpoints.length != cplines[0].children.length) //all must have the same number of CPOINTS as the first one
                                    throw new Error("The number of CPOINTS must have the same in all CPLINES.");

                                //iterate over cpoints
                                for (var v = 0; v < cpoints.length; v++)
                                {

                                    //validation
                                    if (cpoints[v].nodeName != "CPOINT")
                                        throw new Error("LEAF of type Patch must have CPOINT tag");

                                    var point = [];

                                    //X value
                                    var xx_value;
                                    if ((xx_value = this.reader.getString(cpoints[v], 'xx')) == null)
                                        throw new Error("Arguments of patch error: point_value for xx undeclared");
                                    point.push(xx_value);

                                    //Y value
                                    var yy_value;
                                    if ((yy_value = this.reader.getString(cpoints[v], 'yy')) == null)
                                        throw new Error("Arguments of patch error: point_value for yy undeclared");
                                    point.push(yy_value);

                                    //Z value
                                    var zz_value;
                                    if ((zz_value = this.reader.getString(cpoints[v], 'zz')) == null)
                                        throw new Error("Arguments of patch error: point_value for zz undeclared");
                                    point.push(zz_value);

                                    //W value
                                    var ww_value;
                                    if ((ww_value = this.reader.getString(cpoints[v], 'ww')) == null)
                                        throw new Error("Arguments of patch error: point_value for ww undeclared");
                                    point.push(ww_value);

                                    point = point.map(Number);
                                    object.pushControlVertex(u, v, point);
                                }
                            }
                            object.finalizePatch();
                            break;
                    }

                    this.nodes[nodeID].addLeaf(object);
                    sizeChildren++;
                } else
                    this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName);
    }

    console.log("Parsed nodes");
    return null;
}

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function (message)
{
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
}

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 */
MySceneGraph.prototype.onXMLMinorError = function (message)
{
    console.warn("Warning: " + message);
}

MySceneGraph.prototype.log = function (message)
{
    console.log("   " + message);
}

/**
 * Generates a default material, with a random name. This material will be passed onto the root node, which
 * may override it.
 */
MySceneGraph.prototype.generateDefaultMaterial = function ()
{
    var materialDefault = new CGFappearance(this.scene);
    materialDefault.setShininess(1);
    materialDefault.setSpecular(0, 0, 0, 1);
    materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
    materialDefault.setAmbient(0, 0, 0, 1);
    materialDefault.setEmission(0, 0, 0, 1);

    // Generates random material ID not currently in use.
    this.defaultMaterialID = null;
    do
        this.defaultMaterialID = MySceneGraph.generateRandomString(5);
    while (this.materials[this.defaultMaterialID] != null);

    this.materials[this.defaultMaterialID] = materialDefault;
}

/**
 * Generates a random string of the specified length.
 */
MySceneGraph.generateRandomString = function (length)
{
    // Generates an array of random integer ASCII codes of the specified length
    // and returns a string of the specified length.
    var numbers = [];
    for (var i = 0; i < length; i++)
        numbers.push(Math.floor(Math.random() * 256));          // Random ASCII code.

    return String.fromCharCode.apply(null, numbers);
}

/**
 * Displays the scene, processing each node, starting in the root node.
 * It´s called in infinite loop
 */
MySceneGraph.prototype.displayScene = function ()
{
    //display graph elements, the envolving scene
    this.scene.pushMatrix();
    this.dfsVisit(this.nodes[this.idRoot], this.nodes[this.idRoot]);
    this.scene.popMatrix();

    //display game elements
    this.scene.pushMatrix();

        this.scene.translate(3.5, 3.5, 4.5);

        //display player1 tiles box
        this.scene.pushMatrix();
        this.game.displayPlayer1Tiles();
        this.scene.popMatrix();

        //display player2 tiles box
        this.scene.pushMatrix();
        this.game.displayPlayer2Tiles();
        this.scene.popMatrix();

        //display board
        this.scene.pushMatrix();
        this.game.displayBoard();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.game.displayMovingTiles();
        this.scene.popMatrix();

    this.scene.popMatrix();
}

//This function makes a depth search to the scene graph, iterating over the nodes ,calling itself recursively. When finds a leaf calls the drawLeaf function.
MySceneGraph.prototype.dfsVisit = function (node, parentNodeInfo)
{
    var materialID, textureID, selectable, pickable, transformMatrix = node.transformMatrix;

    //define material of the node using the XML info to find out if has it own material or if gets the material of the father
    if (node.materialID == "null")
        materialID = parentNodeInfo.materialID;
    else
        materialID = node.materialID;

    //define texture of the node using the XML info to find out if has it own texture, if gets the texture of the father, or if it has no texture
    if (node.textureID == "null")
        textureID = parentNodeInfo.textureID;
    else if (node.textureID == "clear")
        textureID = "null";
    else
        textureID = node.textureID;

    //define selectable info of the node using the XML info to find out if it is selectable or if the father is selectable
    if (this.selectableNodesIds[node.nodeID] == true)
        selectable = true;
    else
        selectable = parentNodeInfo.selectable;

    //define pickable info of the node using the XML info to find out if it is pickable or if the father is selectable
    if (node.pickable == true)
        pickable = true;
    else
        pickable = parentNodeInfo.pickable;

    //define the transform matrix of the node multiplying its own transform matrix for the transform matrix of the father
    transformMatrix = this.asMul(transformMatrix, parentNodeInfo.transformMatrix);
    node.applyAnimations(transformMatrix);

    //this variable stores the info (material, texture and tranform matrix) of the node being analised
    var nodeInfo = new MyNodeInfo(node.nodeID, materialID, textureID, transformMatrix, selectable, pickable);

    //iterates over its child nodes, calling dfsVisit recursively for each one
    if (node.children != null)
    {
        for (var i = 0; i < node.children.length; i++)
        {
            if (this.nodes[node.children[i]] == null)
                throw new Error("Error referencing a not existent node using nodeID " + node.children[i] + ". PLease verify the XML file validity.")

            this.dfsVisit(this.nodes[node.children[i]], nodeInfo);
        }
    }

    //iterates over its child leafs, calling drawLeaf to display them
    if (node.leaves != null)
        for (var i = 0; i < node.leaves.length; i++)
            this.drawLeaf(node.leaves[i], nodeInfo, parentNodeInfo);
}

/**
 * This function is responsable for drawing a leaf (a primitive object). Its called by the dfsVisit.
 */
MySceneGraph.prototype.drawLeaf = function (leaf, parentNodeInfo)
{

    //if a node is currently marked as selectable, his display should be done with shaders active, in order to the shader being applied to him.
    if (parentNodeInfo.selectable)
        this.scene.setActiveShader(this.scene.shader);

    this.scene.pushMatrix();
    this.scene.multMatrix(parentNodeInfo.transformMatrix); //applies the transform matrix
    this.materials[parentNodeInfo.materialID].apply();//applies the material
    if (parentNodeInfo.textureID != "null")
    {
        if (leaf instanceof MyTriangle || leaf instanceof MyRectangle) //To MyTriangle and MyRectangle the amplifications factors need to be taken in account before applying the texture
            leaf.setAmplifFactor(this.textures[parentNodeInfo.textureID][1], this.textures[parentNodeInfo.textureID][2]);
        this.textures[parentNodeInfo.textureID][0].bind(); //applies the texture if it has a texture (parentNodeInfo.textureID != null)
    }

    leaf.display();
    this.scene.popMatrix();

    if (parentNodeInfo.selectable)
        this.scene.setActiveShader(this.scene.defaultShader);
}

//Multiplies 2 one dimensional matrixes (a*b) and returns a one dimensional matrix with the result.
MySceneGraph.prototype.asMul = function (a, b)
{

    //transform the a matrix represented in one dimensional array in a two - dimensional array.
    var a_bid = [];
    a_bid[0] = [];
    a_bid[1] = [];
    a_bid[2] = [];
    a_bid[3] = [];

    var idx = 0;
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++, idx++)
            a_bid[i][j] = a[idx];


    //transform the b matrix represented in one dimensional array in a two - dimensional array.
    var b_bid = [];
    b_bid[0] = [];
    b_bid[1] = [];
    b_bid[2] = [];
    b_bid[3] = [];

    var idx = 0;
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++, idx++)
            b_bid[i][j] = b[idx];


    //calculate the result of the a*b matrixes
    var result = [];
    result[0] = [0, 0, 0, 0];
    result[1] = [0, 0, 0, 0];
    result[2] = [0, 0, 0, 0];
    result[3] = [0, 0, 0, 0];
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++)
            for (var k = 0; k < 4; k++)
                result[i][j] += a_bid[i][k] * b_bid[k][j];

    var result_uni = [];
    var idx = 0;
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++, idx++)
            result_uni[idx] = result[i][j];


    return result_uni;
};


/**
 * This function is called by the update of the scene in order to update the internal information of the animations based on time. Receives the time passed since last update as argument. 
 */
MySceneGraph.prototype.updateAnimations = function (elapsedTime)
{
    for (let nodeID in this.nodes)
    {
        let node = this.nodes[nodeID];
        node.updateAnimations(elapsedTime);
    }
    this.game.update(elapsedTime);
};