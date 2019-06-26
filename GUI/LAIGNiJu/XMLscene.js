var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 * @constructor
 */
function XMLscene(interface)
{
    CGFscene.call(this);

    this.interface = interface;
    this.game;

    this.lightValues = {};
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
 */
XMLscene.prototype.init = function (application, CameraController)
{
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearColor(51 / 256, 51 / 256, 51 / 256, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

    this.setPickEnabled(true);
}

XMLscene.prototype.setCameraController = function (cameraController)
{
    this.cameraController = cameraController;
}

/**
 * Prepare the sahders that can be used in the scene, creating instance of the class CGFshader.
 */
XMLscene.prototype.prepareShaders = function ()
{
    this.timeFactor = 1;
    this.tileShader = new CGFshader(this.gl, "shaders/varying.vert", "shaders/varying.frag");
}

/**
 * Set game instance, received as parameter. Set the camera controller instance that comes from game.
 */
XMLscene.prototype.setGame = function (game)
{
    this.game = game;
    this.cameraController = this.game.cameraController;
}

/**
 * Initializes the scene lights with the values read from the LSX file.
 */
XMLscene.prototype.initLights = function ()
{
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights)
    {
        if (i >= 8)
            break;              // Only eight lights allowed by WebGL.

        if (this.graph.lights.hasOwnProperty(key))
        {
            var light = this.graph.lights[key];

            this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
            this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
            this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            i++;
        }
    }

}


/*
 *	Get nodes selectable info
 */
XMLscene.prototype.setNodesSelectableInfo = function ()
{
    for (var i = 0; i < this.graph.selectableNodesIds.length; i++)
        this.selectableNodes[this.graph.selectableNodesIds[i]] = true;
}

/**
 * Initializes the scene cameras.
 */
XMLscene.prototype.initCameras = function ()
{
    this.camera = this.cameraController.camera;
}

/* Handler called when the graph is finally loaded. 
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function ()
{
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.setGlobalAmbientLight(this.graph.ambientIllumination[0], this.graph.ambientIllumination[1],
            this.graph.ambientIllumination[2], this.graph.ambientIllumination[3]);

    this.initLights();

    this.prepareShaders();

    var date = new Date();
    this.lastCurrTime = date.getTime(); //time in milliseconds
    this.setUpdatePeriod(10);
}

/**
 * Log of the picking. When a tile is picked it set game variables, the flag indicating that the object is picked, and the object instance. This is done in a different way to box tiles and board tiles.
 */
XMLscene.prototype.logPicking = function ()
{
    if (this.pickMode == false) {
        if (this.pickResults != null && this.pickResults.length > 0) {
            for (var i = 0; i < this.pickResults.length; i++) {
                var obj = this.pickResults[i][0]; // o objeto seleccionado
                if (obj && !this.game.isPaused)
                {
                    var customId = this.pickResults[i][1];	//id do objeto seleccionado			
                    console.log("Picked object: " + obj + ", with pick id " + customId);
                    console.log(this.pickResults[i]);
                    if (obj.placeThatBelongsTo == 'box')
                    {
                        this.game.tilePicked = true;
                        this.game.tilePickedObj = obj;
                    } else
                    {
                        this.game.dropCellPicked = true;
                        this.game.dropCellPickedObj = obj;
                    }
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }
}

/**
 * Displays the scene.
 */
XMLscene.prototype.display = function ()
{
    //support for picking
    this.logPicking();
    this.clearPickRegistration();

    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.graph.loadedOk) {
        // Applies initial transformations.
        this.multMatrix(this.graph.initialTransforms);

        var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                } else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        // Displays the scene.
        this.graph.displayScene();

    } else
    {
        // Draw axis
        this.axis.display();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup

}

/**
 * Function called by the CGF lib every x ms. Responsible for the update of the object in the scene, like the shaders and the animations.
 */
XMLscene.prototype.update = function (currTime)
{
    var elapsedTime = currTime - this.lastCurrTime;
    this.lastCurrTime = currTime;

    //shaders update
    this.updateShaders(currTime);

    //game logic update
    if(this.game != null)
        this.game.update(elapsedTime);
        
    if (this.game != null)
        if (!this.game.isPaused)
            this.cameraController.update(elapsedTime);
};

/**
 * This function makes an update to the shaders passing the value timeFactor (generated by a sin function based on time). That value is then used in the shaders rendering values.
 */
XMLscene.prototype.updateShaders = function (currTime)
{
    let timeFactor = (1 + Math.sin(currTime / 400)) / 4;
    this.tileShader.setUniformsValues({timeFactor: timeFactor});
    this.tileShader.setUniformsValues({scaleFactor: this.ScaleFactor});

    this.tileShader.setUniformsValues({RGBcolor: vec3.fromValues(1, 0, 0)});
}