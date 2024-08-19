// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const fetchData = async () => {
    try {
        const response = await fetch('http://localhost:3000/data', {
            mode: 'cors'
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
};

document.addEventListener('DOMContentLoaded', fetchData);

// Restante do código do cliente
const board = document.querySelectorAll('#gameBoard div');
let vBoard = [];
let turnPlayer = '';
let playWithAI = false;
let difficulty = 'easy';
const labelContainer = document.getElementById('labelContainer');
const boardContainer = document.getElementById('boardContainer');

const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const difficultySelect = document.getElementById('difficulty');

const themeButton = document.getElementById('themeButton');

if (localStorage.theme == "Dark") {
    themeButton.checked = true;
    document.body.classList.add('darkMode');
} else if (localStorage.theme == "Light") {
    themeButton.checked = false;
    document.body.classList.remove('darkMode');
}

themeButton.addEventListener('change', function(){
    if (themeButton.checked) {
        document.body.classList.add('darkMode');
        localStorage.theme = "Dark";
    } else {
        document.body.classList.remove('darkMode');
        localStorage.theme = "Light";
    }
});

function updateTittle() {
    const playerInput = document.getElementById(turnPlayer);
    document.getElementById('turnPlayer').innerText = playerInput.value;
}

function initializeGame() {
    console.log('initializeGame chamada');
    if (player1.value === '' || (player2.value === '' && !playWithAI)) {
        document.getElementById('noName').style.display = 'block';
        document.getElementById('sameName').style.display = 'none';
        return;
    }
    if (player1.value === player2.value && !playWithAI) {
        document.getElementById('sameName').style.display = 'block';
        document.getElementById('noName').style.display = 'none';
        return;
    }
    if (player1.value !== '' && (player2.value !== '' || playWithAI)) {
        labelContainer.style.display = 'none';
        boardContainer.style.display = 'flex';
        vBoard = [["","",""], ["","",""], ["","",""]];
        turnPlayer = "player1";
        document.querySelector('h2').innerHTML = 'Vez de: <span id="turnPlayer"></span>';
        updateTittle();
        board.forEach(function (element) {
            element.classList.remove('win');
            element.classList.add('cursor-pointer');
            element.innerText = '';
            element.addEventListener('click', handleBoardClick);
        });
    }
}


function restartGame() {
    vBoard = [["","",""], ["","",""], ["","",""]];
    turnPlayer = "player1";
    document.querySelector('h2').innerHTML = 'Vez de: <span id="turnPlayer"></span>';
    updateTittle();
    board.forEach(function (element) {
        element.classList.remove('win');
        element.classList.add('cursor-pointer');
        element.innerText = '';
        element.addEventListener('click', handleBoardClick);
    });
}

function getWinRegion() {
    const winRegion = [];
    if (vBoard[0][0] === vBoard[0][1] && vBoard[0][1] === vBoard[0][2] && vBoard[0][0] !== '') {
        winRegion.push('0.0', '0.1', '0.2');
    }
    if (vBoard[1][0] === vBoard[1][1] && vBoard[1][1] === vBoard[1][2] && vBoard[1][0] !== '') {
        winRegion.push('1.0', '1.1', '1.2');
    }
    if (vBoard[2][0] === vBoard[2][1] && vBoard[2][1] === vBoard[2][2] && vBoard[2][0] !== '') {
        winRegion.push('2.0', '2.1', '2.2');
    }
    if (vBoard[0][0] === vBoard[1][0] && vBoard[1][0] === vBoard[2][0] && vBoard[0][0] !== '') {
        winRegion.push('0.0', '1.0', '2.0');
    }
    if (vBoard[0][1] === vBoard[1][1] && vBoard[1][1] === vBoard[2][1] && vBoard[0][1] !== '') {
        winRegion.push('0.1', '1.1', '2.1');
    }
    if (vBoard[0][2] === vBoard[1][2] && vBoard[1][2] === vBoard[2][2] && vBoard[0][2] !== '') {
        winRegion.push('0.2', '1.2', '2.2');
    }
    if (vBoard[0][0] === vBoard[1][1] && vBoard[1][1] === vBoard[2][2] && vBoard[0][0] !== '') {
        winRegion.push('0.0', '1.1', '2.2');
    }
    if (vBoard[0][2] === vBoard[1][1] && vBoard[1][1] === vBoard[2][0] && vBoard[0][2] !== '') {
        winRegion.push('0.2', '1.1', '2.0');
    }
    return winRegion;
}

function handleWin(regions) {
    regions.forEach(function (region) {
        document.querySelector('[data-region="' + region + '"]').classList.add('win');
    });
    const playerName = document.getElementById(turnPlayer).value;
    document.querySelector('h2').innerHTML = playerName + ' venceu!';
    board.forEach(function (element) {
        element.removeEventListener('click', handleBoardClick);
        element.classList.remove('cursor-pointer');
    });
}

function handleBoardClick(ev) {
    console.log('handleBoardClick chamada');
    const span = ev.currentTarget;
    const region = span.dataset.region;
    const rowColumnPair = region.split('.');
    const row = rowColumnPair[0];
    const column = rowColumnPair[1];

    if (turnPlayer === 'player1') {
        span.innerText = 'X';
        vBoard[row][column] = 'X';
    } else {
        span.innerText = 'O';
        vBoard[row][column] = 'O';
    }

    span.classList.remove('cursor-pointer');
    span.removeEventListener('click', handleBoardClick);

    const winRegions = getWinRegion();
    if (winRegions.length > 0) {
        handleWin(winRegions);
    } else if (vBoard.flat().includes('')) {
        turnPlayer = turnPlayer === 'player1' ? 'player2' : 'player1';
        updateTittle();
        if (playWithAI && turnPlayer === 'player2') {
            disableBoard();
            console.log('Chamando aiMove');
            aiMove();
        }
    } else {
        document.querySelector('h2').innerHTML = 'Empate!';
    }
}

function disableBoard() {
    board.forEach(function (element) {
        element.classList.remove('cursor-pointer');
        element.removeEventListener('click', handleBoardClick);
    });
}

function enableBoard() {
    board.forEach(function (element) {
        if (element.innerText === '') {
            element.classList.add('cursor-pointer');
            element.addEventListener('click', handleBoardClick);
        }
    });
}


function startGameWithAI() {
    playWithAI = true;
    player2.value = 'IA'; 
    initializeGame();
}

function startGameWithHuman() {
    playWithAI = false;
    initializeGame();
}

async function aiMove() {
    console.log('aiMove chamada');
    const emptyCells = [];
    const playerMoves = [];
    const aiMoves = [];
    
    vBoard.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === '') {
                emptyCells.push({ row: rowIndex, col: colIndex });
            } else if (cell === 'X') {
                playerMoves.push({ row: rowIndex, col: colIndex });
            } else if (cell === 'O') {
                aiMoves.push({ row: rowIndex, col: colIndex });
            }
        });
    });

    function canWin(player) {
        for (let { row, col } of emptyCells) {
            vBoard[row][col] = player;
            if (getWinRegion().length > 0) {
                vBoard[row][col] = '';
                return { row, col };
            }
            vBoard[row][col] = '';
        }
        return null;
    }

    let move;
    if (difficulty === 'easy') {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (difficulty === 'medium') {
        move = canWin('X');
        if (!move) {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    } else if (difficulty === 'hard') {
        move = canWin('O');
        if (!move) {
            move = canWin('X');
        }
        if (!move) {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }

    setTimeout(() => {
        const { row, col } = move;
        vBoard[row][col] = 'O';
        const cell = document.querySelector(`[data-region="${row}.${col}"]`);
        cell.innerText = 'O';
        cell.classList.remove('cursor-pointer');
        cell.removeEventListener('click', handleBoardClick);

        const winRegions = getWinRegion();
        if (winRegions.length > 0) {
            handleWin(winRegions);
        } else {
            turnPlayer = 'player1';
            updateTittle();
            enableBoard();
        }
    }, 1500);
}

difficultySelect.addEventListener('change', function() {
    difficulty = difficultySelect.value;
    console.log('Dificuldade atualizada para:', difficulty);
});



document.getElementById('start').addEventListener('click', startGameWithHuman);
document.getElementById('playWithAI').addEventListener('click', startGameWithAI);
document.getElementById('restart').addEventListener('click', restartGame);
document.getElementById('refresh').addEventListener('click', function () {
    labelContainer.style.display = 'flex';
    boardContainer.style.display = 'none';
    player1.value = '';
    player2.value = '';
    document.getElementById('noName').style.display = 'none';
});
document.getElementById('playWithAI').addEventListener('click', function () {
    playWithAI = true;
    player2.value = 'IA'
    console.log('playWithAI definido como true');
    initializeGame();
});
