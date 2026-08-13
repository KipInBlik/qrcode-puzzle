
"use strict";

const BOARD = [
    [2, 4, 8, 3, 5, 9, 3, 1],
    [8, 3, 2, 8, 5, 7, 3, 4],
    [1, 7, 1, 6, 8, 4, 5, 3],
    [9, 5, 9, 6, 6, 8, 1, 8],
    [6, 2, 7, 2, 3, 3, 7, 6],
    [4, 5, 9, 6, 9, 2, 9, 8],
    [4, 7, 3, 8, 8, 4, 6, 6],
    [1, 7, 2, 3, 2, 9, 3, 6]
];

const SIZE = BOARD.length;

const START = {
    row: 0,
    col: 0
};

const GOAL = {
    row: 7,
    col: 7
};

const gridElement = document.getElementById("grid");
const stepCounterElement = document.getElementById("stepCounter");
const statusTextElement = document.getElementById("statusText");
const resetButton = document.getElementById("resetButton");
const successPanel = document.getElementById("successPanel");
const successStepsElement = document.getElementById("successSteps");

let player;
let visited;
let steps;
let locked;


/* =========================================
   POSITION HELPERS
========================================= */

function positionKey(row, col) {
    return `${row},${col}`;
}

function samePosition(a, b) {
    return a.row === b.row && a.col === b.col;
}

function getDistance(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function isStraightLine(a, b) {
    return a.row === b.row || a.col === b.col;
}


/* =========================================
   PUZZLE RULE
========================================= */

function isValidMove(targetRow, targetCol) {

    if (locked) {
        return false;
    }

    const target = {
        row: targetRow,
        col: targetCol
    };

    // Je kunt niet naar hetzelfde vakje.
    if (samePosition(player, target)) {
        return false;
    }

    // Alleen horizontaal of verticaal.
    if (!isStraightLine(player, target)) {
        return false;
    }

    // Een landingsvak mag maar één keer gebruikt worden.
    if (visited.has(positionKey(targetRow, targetCol))) {
        return false;
    }

    const currentValue = BOARD[player.row][player.col];
    const targetValue = BOARD[targetRow][targetCol];

    /*
     * Bereken de werkelijke afstand.
     *
     * Omdat we alleen horizontaal of verticaal bewegen,
     * is dit gewoon het verschil in rij OF kolom.
     */
    let actualDistance;

    if (player.row === targetRow) {
        actualDistance = Math.abs(
            player.col - target.col
        );
    } else {
        actualDistance = Math.abs(
            player.row - target.row
        );
    }

    /*
     * De verborgen puzzelregel:
     *
     * afstand === verschil tussen de getallen
     */
    const requiredDistance = Math.abs(
        currentValue - targetValue
    );

    return actualDistance === requiredDistance;
}


/* =========================================
   BOARD RENDERING
========================================= */

function renderBoard() {

    // Verwijder het oude bord.
    gridElement.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const cell = document.createElement("button");

            cell.type = "button";
            cell.className = "grid-cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            // Toon het getal.
            cell.textContent = BOARD[row][col];

            cell.setAttribute(
                "aria-label",
                `Rij ${row + 1}, kolom ${col + 1}, getal ${BOARD[row][col]}`
            );

            // Startvak.
            if (
                row === START.row &&
                col === START.col
            ) {
                cell.classList.add("start");
            }

            // Exitvak.
            if (
                row === GOAL.row &&
                col === GOAL.col
            ) {
                cell.classList.add("goal");
            }

            // Eerder bezocht.
            if (
                visited.has(
                    positionKey(row, col)
                )
            ) {
                cell.classList.add("visited");
            }

            // Huidige positie.
            if (
                row === player.row &&
                col === player.col
            ) {
                cell.classList.add("player");
            }

            // Kliklistener.
            cell.addEventListener(
                "click",
                () => handleCellClick(row, col)
            );

            gridElement.appendChild(cell);
        }
    }

    // Update het aantal stappen.
    stepCounterElement.textContent = steps;
}


/* =========================================
   CELL CLICK
========================================= */

function handleCellClick(row, col) {

    // Na het oplossen kan er niets meer worden gedaan.
    if (locked) {
        return;
    }

    // Controleer of de zet geldig is.
    if (!isValidMove(row, col)) {

        showInvalidMove(row, col);

        return;
    }

    /*
     * De speler springt direct naar het gekozen vak.
     *
     * Alleen het doelvak wordt als bezocht gemarkeerd.
     * De vakjes waaroverheen wordt gesprongen worden
     * dus NIET bezocht.
     */

    visited.add(
        positionKey(row, col)
    );

    player = {
        row: row,
        col: col
    };

    steps++;

    renderBoard();

    // Heeft de speler de uitgang bereikt?
    if (
        samePosition(player, GOAL)
    ) {
        win();
    }
    else {
        statusTextElement.textContent =
            "INPUT ACCEPTED";
    }
}


/* =========================================
   INVALID MOVE
========================================= */

function showInvalidMove(row, col) {

    const cell = gridElement.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

    if (!cell) {
        return;
    }

    /*
     * Verwijder eerst de bestaande animatie.
     * Daardoor kan dezelfde animatie opnieuw worden
     * afgespeeld als de speler meerdere keren klikt.
     */
    cell.classList.remove("invalid");

    // Forceer een browser reflow.
    void cell.offsetWidth;

    // Speel de foutanimatie.
    cell.classList.add("invalid");

    statusTextElement.textContent =
        "INVALID";

    // Na korte tijd weer normale status.
    window.setTimeout(() => {

        if (!locked) {
            statusTextElement.textContent =
                "AWAITING INPUT";
        }

    }, 350);
}


/* =========================================
   WIN
========================================= */

function win() {

    locked = true;

    statusTextElement.textContent =
        "EXIT FOUND";

    successStepsElement.textContent =
        steps;

    successPanel.hidden = false;
}


/* =========================================
   RESET
========================================= */

function resetGame() {

    // Speler terug naar start.
    player = {
        row: START.row,
        col: START.col
    };

    // Start telt als bezocht.
    visited = new Set([
        positionKey(
            START.row,
            START.col
        )
    ]);

    steps = 0;

    locked = false;

    successPanel.hidden = true;

    statusTextElement.textContent =
        "AWAITING INPUT";

    renderBoard();
}


/* =========================================
   START GAME
========================================= */

resetButton.addEventListener(
    "click",
    resetGame
);

resetGame();