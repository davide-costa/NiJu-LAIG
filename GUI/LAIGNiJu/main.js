let level = 1; //default level as hard
let selectedScene = 'Christmas'; //default scene as Christmas
let player1Score = 0;
let player2Score = 0;
let gameMode;
let myScene;

//From https://github.com/EvanHahn/ScriptInclude
include = function ()
{
    function f()
    {
        var a = this.readyState;
        (!a || /ded|te/.test(a)) && (c--,
                !c && e && d())
    }
    var a = arguments
            , b = document
            , c = a.length
            , d = a[c - 1]
            , e = d.call;
    e && c--;
    for (var g, h = 0; c > h; h++)
        g = b.createElement("script"),
                g.src = arguments[h],
                g.async = !0,
                g.onload = g.onerror = g.onreadystatechange = f,
                (b.head || b.getElementsByTagName("head")[0]).appendChild(g)
};

serialInclude = function (a)
{
    var b = console
            , c = serialInclude.l;
    if (a.length > 0)
        c.splice(0, 0, a);
    else
        b.log("Done!");
    if (c.length > 0)
    {
        if (c[0].length > 1) {
            var d = c[0].splice(0, 1);
            b.log("Loading " + d + "...");
            include(d, function ()
            {
                serialInclude([]);
            });
        }

    } else
        b.log("Finished.");
};
serialInclude.l = new Array();


function getUrlVars()
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function (m, key, value)
            {
                vars[decodeURIComponent(key)] = decodeURIComponent(value);
            });
    return vars;
}

/**
 * Include of all necessary files.
 */
serialInclude(['../lib/CGF.js', 'XMLscene.js', 'Table.js', 'MySceneGraph.js',
    'MyNodeInfo.js', 'MyCylinder.js', 'MyRectangle.js',
    'MyTriangle.js', 'MySphere.js', 'MySemiSphere.js',
    'MyBase.js', 'MyPatch.js', 'Vectors.js',
    'MyGraphNode.js', 'MyInterface.js', 'Animation.js',
    'LinearAnimation.js', 'CircularAnimation.js', 'BezierAnimation.js',
    'ComboAnimation.js', 'MyQuad.js', 'MyUnitCubeQuad.js',
    'Tile.js', 'Game.js', 'HumanHuman.js', 'HumanComputer.js',
    'ComputerComputer.js', 'TileAnimationCreator.js', 'Computer.js',
    'Human.js', 'Play.js', 'CameraController.js', 'Board.js']);


/**
 * Function responsable for start a new game, including the scene, interface, camera and application where the game is inserted.
 * The scene create is loaded from XML file based on the selected scene name.
 */
function play(event = null)
{
    if(event != null)
        gameMode = event.target.innerText;

    this.setGameStyle();


    // Standard application, scene and interface setup
    this.app = new CGFapplication(document.body);

    var filename;
    let pointLookingAt;
    if (selectedScene == 'Classic')
    {
        tableWidth = 8;
        tableLength = 6;
        filename = 'Classic.xml';
		pointLookingAt = [1, 2, 1.85];
    } 
    else if (selectedScene == 'Christmas')
    {
        tableWidth = 9;
        tableLength = 8;
        filename = 'Christmas.xml';
		pointLookingAt = [1, 2, 2.135];
    } 
    else
        this.backToMenu();

    //camera start
    let tableCenter = [tableWidth / 2, tableLength / 2];
    let cameraElevation = 3;
    let cameraRotationRadius = -5;
    let cameraRotationSpeed = 0.5;
    let cameraController = new CameraController(pointLookingAt, cameraElevation, cameraRotationRadius, cameraRotationSpeed);
    this.myInterface = new MyInterface();
    if(myScene == null)
        myScene = new XMLscene(this.myInterface);

    myScene.setCameraController(cameraController);

    this.app.init();

    this.app.setScene(myScene);
    this.app.setInterface(this.myInterface);

    //creates game
    let game = createGameGivenGameMode(gameMode);

    game.cameraController = cameraController;
    myScene.setGame(game);
    myScene.cameraController = cameraController;

    // create and load graph, and associate it to scene. 
    // Check console for loading errors
    var myGraph = new MySceneGraph(filename, myScene, game);

    // start
    this.app.run();
}

/**
 * Function responsable for creating a new game instance based on the game mode/type passed as argument.
 * Return the created game instance.
 */
function createGameGivenGameMode(gameMode)
{
    if (gameMode == 'Human Human')
        return new HumanHuman(myScene, selectedScene);
    else if (gameMode == 'Human Computer')
        return new HumanComputer(myScene, selectedScene, level);
    else
        return new ComputerComputer(myScene, selectedScene, level);
}

/**
 * Function responsable for removing the menu elements from the HTML/screen.
 */
function removeMenuElements()
{
    document.getElementById("niJu").remove();
    document.getElementById("optionsList").remove();
}

/**
 * Function responsable for creating a score-board element using curr player 1 and player 2 scores.
 * Return the created score-board element.
 */
function getScoreBoardHTML()
{
    let scoreBoardHTML = `<ul class="score-board">
                            <li class="player1">Player 1</li>
                            <li class="score">` + player1Score + ` - ` + player2Score + `</li>
                            <li class="player2">Player 2</li>
                            <li class="time"></li>
                        </ul>`;
    return scoreBoardHTML;
}

/**
 * Function responsable for alter the HTML in order to set game style, before entering game mode.
 */
function setGameStyle()
{
    let innerHTML = `<script id="script" src="main.js"></script>` + getScoreBoardHTML();
    let body = document.getElementsByTagName("body")[0];
    body.innerHTML = innerHTML;

    let styleElement = document.createElement("style");
    styleElement.innerHTML = `body, html 
                            {
                                overflow: hidden;
                                margin: auto;
                                border: 0px;
                                padding: 10px;
                            }`;
    document.getElementById("script").insertAdjacentElement('beforebegin', styleElement);

    //insert back arrow
    this.insertBackArrow();
}

/**
 * Function responsable for insert HTML to a back arrow (allows to back to menu) in the curr page HTML.
 */
function insertBackArrow()
{
    let backArrow = document.createElement("a");
    backArrow.addEventListener("click", backToMenuFromGame);
    backArrow.className = "backArrow";
    document.getElementById("script").insertAdjacentElement('beforebegin', backArrow);
}

/**
 * Function responsable for alter the HTML in order to show the game mode option allowed, in the game menu.
 */
function showGameModeOptions()
{
    let body = document.getElementsByTagName("body")[0];
    body.innerHTML = `<h1 id="niJu" onclick="backToMenu">NI JU</h1>
                    <script id="script" src="main.js"></script>
                    <div id="optionsList">
                        <div id="HumanHuman" onclick="play(event)"><p>Human Human</p></div>
                        <div id="ComputerHuman" onclick="play(event)"><p>Human Computer</p></div>
                        <div id="ComputerComputer" onclick="play(event)"><p>Computer Computer</p></div>
                    </div>`;

    //insert back arrow
    this.insertBackArrow();
}

/**
 * Function responsable for alter the HTML in order to show the menu options. It allows to alter the curr game scene and the curr level of IA.
 */
function showMenuOptions()
{
    //remove menu elements
    this.removeMenuElements();

    let body = document.getElementsByTagName("body")[0];
    let innerHTML = `<h1 id="niJu" onclick="backToMenu">NI JU</h1>
                    <script id="script" src="main.js"></script>
                    <label class="configLabel"> Level </label>
                    <div class="configOptions">
                        <select id="levelSelector" onchange="changeLevel()">
                            <option `;
    if (level == 0)
        innerHTML += 'selected';
    innerHTML += `>Easy</option >
                            <option `;
    if (level == 1)
        innerHTML += 'selected';
    innerHTML += `>Hard</option>
                        </select>
                    </div>
                    <label class="configLabel"> Scene </label>
                    <div class="configOptions">
                        <select id="sceneSelector" onchange="changeScene()">
                            <option `;
    if (selectedScene == 'Classic')
        innerHTML += 'selected';
    innerHTML += `>Classic</option>
                            <option `;
    if (selectedScene == 'Christmas')
        innerHTML += 'selected';
    innerHTML += `>Christmas</option>
                        </select>
                    </div>`;

    body.innerHTML = innerHTML;

    //insert back arrow
    this.insertBackArrow();
}

/**
 * Function responsable for alter the curr selected scene based on user input.
 */
function changeScene()
{
    let optionSelected = document.getElementById("sceneSelector");
    let valueSelected = optionSelected.options[optionSelected.selectedIndex].text;
    selectedScene = valueSelected;
}

/**
 * Function responsable for alter the curr level based on user input.
 */
function changeLevel()
{
    let optionSelected = document.getElementById("levelSelector");
    let valueSelected = optionSelected.options[optionSelected.selectedIndex].text;
    if (valueSelected == 'Easy')
        level = 0;
    else if (valueSelected == 'Hard')
        level = 1;
}

/**
 * Function responsable for backing to game menu. It insert the HTML code for the game menu.
 */
function backToMenu()
{
    let body = document.getElementsByTagName("body")[0];
    body.innerHTML = `<h1 id="niJu">NI JU</h1>
                    <script id="script" src="main.js"></script>
                    <div id="optionsList">
                        <div id="play" onclick="showGameModeOptions()"><p>PLAY</p></div>
                        <div id="options" onclick="showMenuOptions()"><p>OPTIONS</p></div>
                        <div id="credits" onclick="credits()"><p>CREDITS</p></div>
                    </div>`;
}

/**
 * Function responsable for backing to game menu but that destroys the curr game instance when leaving game. It call backToMenu function to insert the HTML code for the game menu.
 */
function backToMenuFromGame()
{     
    backToMenu();
    if(myScene != null)
    {
        if(myScene.game != null)
            if(myScene.game.serverError == true)
                displayServerError();
        myScene.game = null;
    }
    player1Score = 0;
    player2Score = 0;
}

/**
 * Function responsable for display a server error message when an error comunicating with server occures during game. 
 */
function displayServerError()
{     
    let invalidPlayMessage = document.createElement("div");
    invalidPlayMessage.id = "errorMessage";
    invalidPlayMessage.innerHTML = `<p> Server Error! </p>`;
    document.getElementById('script').insertAdjacentElement('beforebegin', invalidPlayMessage);
}

/**
 * Function responsable for showing game credits. It's part of menu options.
 */
function credits()
{
    //remove menu elements
    this.removeMenuElements();

    //insert back arrow
    this.insertBackArrow();

    //credits elements
    let creditsElement = document.createElement("div");
    creditsElement.id = "credits";
    creditsElement.innerHTML = `<p>Project done to LAIG and PLOG UC´s by Davide Costa e Dinis Silva </p>`;
    document.getElementById("script").insertAdjacentElement('afterend', creditsElement);
}

/**
 * Function responsable for incrementing player's score in case of victory and creating a new game instance to start a rematch game, if user tells.
 */
function playAgain()
{
    //handle the last game results
    if (myScene.game.winner == 1)
        player1Score++;
    else if (myScene.game.winner == 2)
        player2Score++;

    //create new game instance
    play();
}

/**
 * Function responsable for showing game movie, if user tells, when end of game has occurred.
 */
function playGameMovie()
{
    myScene.game.backToGameStyle();
    myScene.game.startPlayingGameMovie();
}

/**
 * Function responsable for showing end of game HTML. It displays the messages over canvas element.
 */
function endOfGameStyle(winner)
{
    let innerHTML = `<h1 id="endOfGameTitle" class="endOfGameStyle">End of Game</h1>
    <h1 id="endOfGameTitle" class="endOfGameStyle">`;
    if (winner == 'Draw! Tiles Over!')
    innerHTML += 'Draw! Tiles Over!';
    else
    innerHTML += 'Player ' + winner + ' Wins!';

    innerHTML += `</h1>
        <div class="endOfGameStyle" id="optionsList">
            <div class="endOfGameStyle" id="playAgain" onclick="playAgain()"><p>Play Again</p></div>
            <div class="endOfGameStyle" id="gameMovie" onclick="playGameMovie()"><p>Game Movie</p></div>
        </div>`;

    let body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML('afterbegin', innerHTML);

    //remove scoreBoard
    let scoreBoard = document.getElementsByClassName('score-board')[0];
    if(scoreBoard != null)
        scoreBoard.remove();
}