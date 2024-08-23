// The following variables below are all the sound variables and mute/unmute fucntions 
let backgroundMusic = new Audio();
backgroundMusic.src = "sounds/bg-music.mp3";
let backgroundMusicStatus = 0;
let backgroundMusicInterval;

function playBackgroundMusic() {
    backgroundMusic.play();
    if (backgroundMusicStatus == 1) {
        backgroundMusic.volume = 0;
    } else {
        backgroundMusic.volume = 0.5;
    }
}

function muteBackgroundMusic() {
    const muteBtnImg = document.getElementById("mute-btn-img");
    if (backgroundMusicStatus == 0) {
        muteBtnImg.setAttribute("src", "assets/header/mute.png");
        backgroundMusic.volume = 0;
        backgroundMusicStatus++;
    } else {
        muteBtnImg.setAttribute("src", "assets/header/unmute.png");
        backgroundMusic.volume = 0.5;
        backgroundMusicStatus--;
    }
}

document.getElementById("mute-header-btn").addEventListener("click", muteBackgroundMusic)
//END HERE

// Timer Functions
let timer = 180;
let timeRemaining = timer;

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startCountdown() {
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            endGame();
            return;
        }
        updateTimerDisplay();
    }, 1000);
}

// Card Slot and Swipe Handling
const cardSlot = document.querySelector('.card-slot');
const swipeCard = document.getElementById('swipe-card');
let startX = 0;
let currentX = 0;
let isSwiping = false;
let cardSlotWidth = cardSlot.offsetWidth; 

// Event Listeners for Swipe Actions
swipeCard.addEventListener('mousedown', startSwipe);
swipeCard.addEventListener('touchstart', startSwipe);
swipeCard.addEventListener('mousemove', swipeMove);
window.addEventListener('touchmove', swipeMove);
window.addEventListener('mouseup', endSwipe);
swipeCard.addEventListener('touchend', endSwipe);
window.addEventListener('resize', updateCardSlotWidth);

// Swipe Functions
function updateCardSlotWidth() {
    cardSlotWidth = cardSlot.offsetWidth;
}

function startSwipe(event) {
    isSwiping = true;
    startX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
}

function swipeMove(event) {
    if (!isSwiping) 
        {
            return
        } else if (isSwiping) {
            currentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
            const deltaX = currentX - startX;
        
            // Check if swipe reached the threshold
            if (Math.abs(deltaX) > (cardSlotWidth/1.8) && isSwiping == true) {
                isSwiping = false;
                swipeCard.style.transitionDuration = `.5s`
                swipeCard.style.transform = `translateX(${cardSlotWidth}px)`;
                swipeCard.style.opacity = `0`
                startCardInterval();
            }
            else if (deltaX > 1)
            {
                swipeCard.style.transitionDuration = `0s`;
                swipeCard.style.transform = `translateX(${deltaX}px)`;
            }
        }


}

function endSwipe() {
    if (isSwiping) {
        isSwiping = false;
        swipeCard.style.transform = 'translateX(0)';
    }
}
//END HERE

// The following lines of codes include all of the functions and variables needed for you to transition from the start screen to the game board
let startScreenTimer

function startCardInterval() {
    startScreenTimer = setInterval(startGame, 500);
    startCountdown();
    loadNextSet();
}

function hideStartScreen() {
    document.getElementById("start-screen").style.display = "none";
    playBackgroundMusic();
    backgroundMusicInterval = setInterval(playBackgroundMusic, 120000);
    clearInterval(startScreenTimer);
}
// END HERE

// The following lines of codes hides all the header and gameboard elements, and shows the end message
function endGame(){
    document.getElementById("game-board").style.display = "none"
    document.getElementById("header").style.display = "none"
    clearInterval(backgroundMusicInterval)
    backgroundMusic.volume = 0
    backgroundMusicStatus = 1
    if (currentSetIndex > 3){
        document.getElementById("pass-end-screen").style.display = "flex"
    } else {
        document.getElementById("fail-end-screen").style.display = "flex"
    }
}
// END HERE

// GAME FUNCTIONS PROPER

function startGame(){
    hideStartScreen()
}

let currentSetIndex = 0;
let round = document.getElementById("round");
let questionPrompt = document.getElementById("question");
let selectedCells = [];

// Update the grid with the current set of items
function loadNextSet() {
    if (currentSetIndex < itemSets.length) {
        grid = itemSets[currentSetIndex];
        shuffle(grid);
        currentSetIndex++;
        timeRemaining = timer;
        resetMistakes();
        renderGrid();
    } else {
        currentSetIndex++;
        endGame();
    }
}

document.getElementById('group-btn').addEventListener('click', checkConnection);

// Shuffle function to randomize grid positions
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getColumnWidth() {
    if (window.innerWidth > 730) {
        return '250px';
    } else if (window.innerWidth > 430) {
        return '130px';
    } else {
        return '80px';
    }
}

function renderGrid() {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    selectedCells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];

    // Get the column width based on screen size
    const columnWidth = getColumnWidth();

    // Update grid-template-columns for the last round
    if (currentSetIndex === itemSets.length) {
        gridContainer.style.gridTemplateColumns = `repeat(4, ${columnWidth})`;
    } else {
        gridContainer.style.gridTemplateColumns = `repeat(3, ${columnWidth})`;
    }

    grid.forEach((item) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('id', item.id);
        cell.textContent = item.name;

        cell.addEventListener('click', handleCellClick);

        round.innerHTML = questions[currentSetIndex - 1][0];
        questionPrompt.innerHTML = questions[currentSetIndex - 1][1];
        gridContainer.appendChild(cell);
    });
}

window.addEventListener('resize', renderGrid);

function handleCellClick(event) {
    const clickedCell = event.target;

    if (selectedCells.includes(clickedCell)) {
        selectedCells = selectedCells.filter(cell => cell !== clickedCell);
        clickedCell.classList.remove('selected');
    } else if (selectedCells.length < 1 + currentSetIndex) {
        selectedCells.push(clickedCell);
        clickedCell.classList.add('selected');
    }
}

let mistakeCount = 0; // Initialize the mistake counter

function checkConnection() {
    const selectedIds = selectedCells.map(cell => cell.id);
    const mistakeBoxes = document.querySelectorAll('.mistake-box');

    // Check if the selected items form a correct group
    const isCorrect = validGroups.some(group => 
        selectedIds.every(item => group.includes(item))
    );

    if (isCorrect && selectedCells.length == 1 + currentSetIndex) {
        // Remove all selected cells
        selectedCells.forEach(cell => cell.remove());
        selectedCells = [];

        // Check if there are no cells left to ensure transition
        const remainingCells = document.querySelectorAll('.cell');
        if (remainingCells.length === 0) {
            loadNextSet();
        }
    } else {
        selectedCells.forEach(cell => cell.classList.remove('selected'));
        selectedCells = [];

        // Update the mistake counter
        if (mistakeCount < mistakeBoxes.length) {
            mistakeBoxes[mistakeCount].classList.add('red');
            mistakeCount++;
        }
    }

    if (mistakeCount == mistakeBoxes.length)
    {
        endGame();
    }
}

function resetMistakes() {
    const mistakeBoxes = document.querySelectorAll('.mistake-box');
    mistakeBoxes.forEach(box => box.classList.remove('red'));

    mistakeCount = 0;
}

// Define the valid groups that can be in any column
const validGroups = [
    ['Asynchronous', 'Synchronous'],
    ['30 minutes', '20 minutes'],
    ['Full-online', 'Blended'],

    ['BenildeMail (BMail)', 'Student Enrollment Record (SER)', 'Student Information System (SIS)'], 
    ['Unstable Internet Connection', 'Reasonable Accommodation', 'Class Suspensions'], 
    ['Midterm Exams Week', 'Final Exams Week', 'Free Day'],

    ['BigSky', 'Zoom', 'Facebook', 'Google Meet'], 
    ['Reliable Internet', 'Course-specific Requirements', 'Document and Presentation Tools', 'Laptop or Tablet'], 
    ['Learning Outcomes', 'Course Description', 'Structure', 'Course Plan'],
    ['6 absences', 'Classes 3x a Week', '3 absences', 'Classes 2x a Week']
];

const itemSets = [
    [
        { id: "Asynchronous", name: "Asynchronous" },
        { id: "Synchronous", name: "Synchronous" },
        { id: "30 minutes", name: "30 minutes" },
        { id: "20 minutes", name: "20 minutes" },
        { id: "Full-online", name: "Full-online" },
        { id: "Blended", name: "Blended" }
    ],

    [
        { id: "BenildeMail (BMail)", name: "BenildeMail (BMail)" },
        { id: "Student Enrollment Record (SER)", name: "Student Enrollment Record (SER)" },
        { id: "Student Information System (SIS)", name: "Student Information System (SIS)" },
        { id: "Unstable Internet Connection", name: "Unstable Internet Connection" },
        { id: "Reasonable Accommodation", name: "Reasonable Accommodation" },
        { id: "Class Suspensions", name: "Class Suspensions" },
        { id: "Midterm Exams Week", name: "Midterm Exams Week" },
        { id: "Final Exams Week", name: "Final Exams Week" },
        { id: "Free Day", name: "Free Day" }
    ],

    [
        { id: "BigSky", name: "BigSky" },
        { id: "Zoom", name: "Zoom" },
        { id: "Facebook", name: "Facebook" },
        { id: "Google Meet", name: "Google Meet" },
        { id: "Reliable Internet", name: "Reliable Internet" },
        { id: "Course-specific Requirements", name: "Course-specific Requirements" },
        { id: "Document and Presentation Tools", name: "Document and Presentation Tools" },
        { id: "Laptop or Tablet", name: "Laptop or Tablet" },
        { id: "Learning Outcomes", name: "Learning Outcomes" },
        { id: "Course Description", name: "Course Description" },
        { id: "Structure", name: "Structure" },
        { id: "Course Plan", name: "Course Plan" },
        { id: "6 absences", name: "6 absences" },
        { id: "Classes 3x a Week", name: "Classes 3x a Week" },
        { id: "3 absences", name: "3 absences" },
        { id: "Classes 2x a Week", name: "Classes 2x a Week" }
    ]
];

//Hints and questions for the game
const questions = [
    ["ROUND 1", "Cluster the related concepts into 3 pairs!"],
    ["ROUND 2", "Cluster the concepts into 3 groups of 3!"],
    ["ROUND 3", "Cluster the concepts into 4 groups of 4!"]
]