let boardSize = 4;
let tiles = [];
let animations = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let gameWin = false;
let boardSizeSet = true;
let onAnimation = false;

document.addEventListener('DOMContentLoaded', function() {
    let app = document.getElementById('app');
    let container = addContainerTo(app);
    addHeaderTo(container);
    setBoardSize(app, startGame);
})

function startGame(){
    bestScore = localStorage.getItem('bestScore') || 0;
    let app = document.getElementById('app');
    app.innerHTML='';
    let container = addContainerTo(app);
    addHeaderTo(container);
    addSubHeaderTo(container, 'Press arrow keys to move tiles - Reach 2048 in any cell to win!');
    addScoreBoardTo(container);
    let board = addBoardTo(container)
    addCellsTo(board);
    initTiles();    
    tiles.map(tile => setTile(board, tile.value, tile.position));

    handleInput(board);
}

function setBoardSize(board, callback){
    let popUp = showPopUp(board)
    popUp.style.fontSize = '2rem';
    popUp.style.background = 'transparent';
    popUp.innerHTML = 'Select board size:';
    let btn4 = addButttonTo(popUp, 'board-size-btn', 'board-size-btn-4', '4x4');
    let btn5 = addButttonTo(popUp, 'board-size-btn', 'board-size-btn-5', '5x5');
    let btn6 = addButttonTo(popUp, 'board-size-btn', 'board-size-btn-6', '6x6');
    
    btn4.addEventListener('click', () => {boardSize = 4; boardSizeSet = true;callback();})
    btn5.addEventListener('click', () => {boardSize = 5; boardSizeSet = true;callback();})
    btn6.addEventListener('click', () => {boardSize = 6; boardSizeSet = true;callback();})
    
}

function addContainerTo(app)
{
    let container = document.createElement('div');
    container.classList.add('container');
    app.appendChild(container);
    return container;
}

function addHeaderTo(container)
{
    let header = document.createElement('div');
    header.classList.add('header');
    header.innerText = 'Game:2048';
    container.appendChild(header);
}

function addSubHeaderTo(container, msg=null)
{
    let subHeader = document.createElement('div');
    subHeader.classList.add('sub-header');
    subHeader.innerText = msg;
    container.appendChild(subHeader);
}

function addScoreBoardTo(container)
{
    let scoreBoard = document.createElement('div');
    scoreBoard.classList.add('scoreBoard');
    scoreBoard.style.width = boardSize*6.9+'rem';

    addButttonTo(scoreBoard, 'restart-btn', 'restart_btn', 'Restart');
    addScoreTo(scoreBoard);
    addBestScoreTo(scoreBoard);
    
    container.appendChild(scoreBoard);
}
function addButttonTo(dom, className, id, text)
{
    let button = document.createElement('button');
    button.classList.add(className);
    button.setAttribute('id', id);
    button.innerText = text;
    dom.appendChild(button);
    return button;
}
function addScoreTo(dom)
{
    let scoreDom = document.createElement('div');
    scoreDom.innerText = `SCORE: ${score}`
    scoreDom.classList.add('score');
    scoreDom.setAttribute('id', 'score');
    dom.appendChild(scoreDom);
}
function addBestScoreTo(dom)
{
    let bestScoreDom = document.createElement('div');
    bestScoreDom.innerText = `BEST: ${bestScore}`
    bestScoreDom.classList.add('best-score');
    bestScoreDom.setAttribute('id', 'best_score');
    dom.appendChild(bestScoreDom);
}

function addBoardTo(container)
{
    let board = document.createElement('div');
    board.classList.add('board');
    board.setAttribute('id', 'board');
    container.appendChild(board);
    return board;
}

function addCellsTo(board)
{
    for(let i=0; i<boardSize; i++) {
        let row = document.createElement('div');
        row.classList.add('row');
        board.appendChild(row);

        for(let j=0; j<boardSize; j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);
            row.appendChild(cell);
        }
    }
}
function setTile(board, value, position)
{   
    let x = Math.floor(position/boardSize);
    let y = position%boardSize;
    if(x>=boardSize || y>=boardSize) return
    let cell = board.querySelector(`[data-row="${x}"][data-col="${y}"]`);
    let tile = document.createElement('div');
    let backgroundLightness = (10-Math.log2(value)/1.9)*9;
    let textLightness = value > 256 ? 90 : 10;
    tile.setAttribute('data-position', position);
    tile.classList.add('tile');
    tile.style.left =(`${cell.offsetLeft}px`);
    tile.style.top =(`${cell.offsetTop}px`);
    tile.style.backgroundColor = `hsl(0, 37%, ${backgroundLightness}%)`;
    tile.style.color = `hsl(0, 37%, ${textLightness}%)`;
    tile.innerText = value;
    board.appendChild(tile)
}

function initTiles(){
    for(let i in [0,1]) {
        generateNewTile();
    }
}

function generateNewTile(){
    if(tiles.length>=boardSize*boardSize) return;
    let value = Math.random()>0.5 ? 2 : 4;
    let position = Math.floor(Math.random()*boardSize*boardSize);

    while(tiles.filter(tile => tile.position===position).length){
        position = Math.floor(Math.random()*boardSize*boardSize);
    }
    tiles.push({value, position});
    tiles = tiles.sort((a,b) => a.position-b.position);
}

function handleInput(board){
    let restartButton = document.getElementById('restart_btn');
    restartButton.addEventListener('click', () => {
        tiles = [];
        animations = [];
        score = 0;
        gameOver = false;
        gameWin = false;
        onAnimation = false;
        initTiles();    
        updateBoard(board);
    })
    window.addEventListener('keydown', function(e) {
        if(boardSizeSet && !gameWin && !gameOver && !onAnimation){            
            switch(e.key) {
                case "ArrowUp":
                    moveUp();
                    break;
                case "ArrowDown":
                    moveDown();
                    break;
                case "ArrowLeft":
                    moveLeft();
                    break;
                case "ArrowRight":
                    moveRight();
                    break;
            }
            let animation = animateMovementsSync(board)
            if (animation) {
                onAnimation = true;
                animation.addEventListener('transitionend', () =>{
                    updateBoard(board);
                });
            }
            else{
                updateBoard(board);
            }      
        }
    })
}
function updateBoard(board){
    document.querySelectorAll('.tile').forEach(tile => board.removeChild(tile));
    tiles.map(tile => setTile(board, tile.value, tile.position));
    let popUp = document.getElementById('pop_up');
    if(popUp) popUp.remove();
    updateScore();
    checkGameWin();
    checkGameOver();
    if(gameOver) {
        showPopUp(board);
        localStorage.setItem('bestScore', bestScore);
    }
    if(gameWin) {
        showPopUp(board, "WINNER!!!");
        localStorage.setItem('bestScore', bestScore);
    }
    onAnimation = false;
}

function moveUp() {
    let colums = getColums();
    moveUpByColums(colums);
    generateNewTile();
}
function moveDown() {
    let colums = getColums();
    moveDownByColums(colums);    
    generateNewTile();
}
function moveLeft() {
    let rows = getRows();
    moveLeftByRows(rows);
    generateNewTile();
}
function moveRight() {
    let rows = getRows();
    moveRightByRows(rows);
    generateNewTile();
}

function getColums() {
    let colums = [];
    for(let i=0; i<boardSize; i++) {
        let column = tiles.filter(tile => tile.position%boardSize===i);
        if(column.length) colums.push(column);
    }
    return colums;
}

function getRows() {
    let rows = [];
    for(let i=0; i<boardSize; i++) {
        let row = tiles.filter(tile => Math.floor(tile.position/boardSize)===i);
        if(row.length) rows.push(row);
    }
    return rows;
}

function moveUpByColums(colums){
    animations = [];
    colums.map(column => {
        let prev = null;
        let prevUpdated = false;
        column.map((tile,  index) => {
            let initialPosition = tile.position;
            while(Math.floor(tile.position/boardSize)){
                if(!prev || prev.position!==tile.position-boardSize){
                    tile.position -= boardSize;
                }
                else if(prev.position===tile.position-boardSize && prev.value===tile.value){ 
                    if(prevUpdated){
                        prevUpdated =false;
                        break;
                    }
                    tile.value += prev.value
                    score= tile.value>score ? tile.value: score;
                    tiles = tiles.filter(element => element.position!==prev.position);
                    tile.position -= boardSize;
                    prevUpdated = true;
                    break;
                }
                else{
                    break;
                }
            }
            if(initialPosition!==tile.position) animations.push([initialPosition, tile.position]);
            if(index<boardSize-1) prev = prevUpdated ? column[index++] :tile;
        })
    })
}

function moveDownByColums(colums){
    animations = [];
    colums.map(column => {
        column = column.reverse();
        let prev = null;
        let prevUpdated = false;
        column.map((tile,index) => {
            let initialPosition = tile.position;
            while(Math.floor(tile.position/boardSize)<boardSize-1){
                if(!prev || prev.position!==tile.position+boardSize){
                    tile.position += boardSize;
                }
                else if(prev.position===tile.position+boardSize && prev.value===tile.value){ 
                    if(prevUpdated){
                        prevUpdated =false;
                        break;
                    }
                    tile.value += prev.value
                    score= tile.value>score ? tile.value: score;
                    tiles = tiles.filter(element => element.position!==prev.position);
                    tile.position += boardSize;
                    prevUpdated = true;
                    break;
                }
                else{
                    break;
                }
            }
            if(initialPosition!==tile.position) animations.push([initialPosition, tile.position]);
            if(index<boardSize-1) prev = prevUpdated ? column[index++] :tile;
        })
    })
}

function moveLeftByRows(rows){
    animations = [];
    rows.map(row => {
        let prev = null;
        let prevUpdated = false;
        row.map((tile,  index) => {
            let initialPosition = tile.position;
            while(tile.position%boardSize){
                if(!prev || prev.position!==tile.position-1){
                    tile.position--;
                }
                else if(prev.position===tile.position-1 && prev.value===tile.value){ 
                    if(prevUpdated){
                        prevUpdated =false;
                        break;
                    } 
                    tile.value += prev.value
                    score= tile.value>score ? tile.value: score;
                    tiles = tiles.filter(element => element.position!==prev.position);
                    tile.position--;
                    prevUpdated = true;
                    break;
                }
                else{
                    break;
                }
            }
            if(initialPosition!==tile.position) animations.push([initialPosition, tile.position]);
            if(index<boardSize-1) prev = prevUpdated ? row[index++] :tile;
        })
    })
}

function moveRightByRows(rows){
    animations = [];
    rows.map(row => {
        row = row.reverse();
        let prev = null;
        let prevUpdated = false;
        row.map((tile,  index) => {
            let initialPosition = tile.position;
            while(tile.position%boardSize<boardSize-1){
                if(!prev || prev.position!==tile.position+1){
                    tile.position++;
                }
                else if(prev.position===tile.position+1 && prev.value===tile.value){
                    if(prevUpdated){
                        prevUpdated =false;
                        break;
                    } 
                    tile.value += prev.value
                    score= tile.value>score ? tile.value: score;
                    tiles = tiles.filter(element => element.position!==prev.position);
                    tile.position++;
                    prevUpdated = true;
                    break;
                }
                else{
                    break;
                }
            }
            if(initialPosition!==tile.position) animations.push([initialPosition, tile.position]);
            if(index<boardSize-1) prev = prevUpdated ? row[index++] :tile;
        })
    })
}

function updateScore() {
    if(score>bestScore) bestScore = score;
    document.getElementById('score').innerText = `SCORE: ${score}`
    document.getElementById('best_score').innerText = `BEST: ${bestScore}`
}

function checkGameWin(){
    if(score>=2048){
        gameWin = true;
    }
}

function checkGameOver(board){
    if(tiles.length===boardSize*boardSize){
        for(let i=0; i<boardSize; i++){
            for(let j=0; j<boardSize; j++){
                if(i>0 && tiles[i*boardSize+j].value===tiles[(i-1)*boardSize+j].value){
                    return;
                }
                if(j>0 && tiles[i*boardSize+j].value===tiles[i*boardSize+j-1].value){
                    return;                       
                }
                if(i<boardSize-1 && tiles[i*boardSize+j].value===tiles[(i+1)*boardSize+j].value){
                    return;
                }
                if(j<boardSize-1 && tiles[i*boardSize+j].value===tiles[i*boardSize+j+1].value){
                    return;                       
                }
            }
        }
        gameOver = true
    }
}

function showPopUp(board, msg="Game Over!!!") {
    let popUp = document.createElement('div');
    popUp.classList.add('pop-up');
    popUp.setAttribute('id', 'pop_up');
    popUp.style.height = `${board.offsetHeight-23}px`;
    popUp.style.width = `${board.offsetWidth-23}px`;
    popUp.innerText = msg;
    board.appendChild(popUp);
    return popUp;
}

function animateMovementsSync(board){
    let lastTile = null;
    animations.map(animation => {
        let positions = [
            {x: Math.floor(animation[0]/boardSize), y: animation[0]%boardSize},
            {x: Math.floor(animation[1]/boardSize), y: animation[1]%boardSize},
        ];
        let cells = [
            board.querySelector(`[data-row="${positions[0].x}"][data-col="${positions[0].y}"]`),
            board.querySelector(`[data-row="${positions[1].x}"][data-col="${positions[1].y}"]`)
        ];
        let tile = board.querySelector(`[data-position="${animation[0]}"]`)

        let axisX = cells[1].offsetLeft - cells[0].offsetLeft;
        let axisY = cells[1].offsetTop - cells[0].offsetTop;

        tile.style.transform = `translate(${axisX}px, ${axisY}px)`;
        lastTile = tile;
    })
    return lastTile;
}