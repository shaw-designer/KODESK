const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('#score');
const highScoreBoard = document.querySelector('#highScore');
const livesBoard = document.querySelector('#lives');
const gameOverScreen = document.querySelector('#gameOver');
const finalScoreText = document.querySelector('#finalScoreText');
const bonusOverlay = document.getElementById('bonus-overlay');

let score = 0; let lives = 3; let lastHole;
let gameActive = true; let isMoleUp = false;
let topScore = localStorage.getItem('bunnyHighScore') || 0;

highScoreBoard.textContent = topScore;

// --- LOTTIE BONUS FUNCTION ---
function triggerFullScreenBonus(jsonUrl) {
    bonusOverlay.innerHTML = ''; // Clear old animations
    const anim = lottie.loadAnimation({
        container: bonusOverlay,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: jsonUrl
    });

    anim.onComplete = () => {
        anim.destroy();
        bonusOverlay.innerHTML = '';
    };
}

function randomHole() {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) return randomHole();
    lastHole = hole;
    return hole;
}

function popUp() {
    if (!gameActive || isMoleUp) return;
    isMoleUp = true;

    const speed = Math.max(450, 1050 - (score * 15)); 
    const hole = randomHole();
    const moleElement = hole.querySelector('.mole');
    const randomVal = Math.random();
    
    if (randomVal < 0.22) { 
        moleElement.textContent = '💣'; moleElement.dataset.type = 'bomb'; 
    } else if (randomVal > 0.94) { 
        moleElement.textContent = '👑'; moleElement.dataset.type = 'gold'; 
    } else { 
        moleElement.textContent = '🐹'; moleElement.dataset.type = 'bunny'; 
    }

    hole.classList.add('up');
    setTimeout(() => {
        hole.classList.remove('up');
        isMoleUp = false;
        if (gameActive) setTimeout(popUp, 100);
    }, speed);
}

function whack(e) {
    if(!gameActive) return;
    const mole = e.target;
    if (!mole.classList.contains('mole')) return;
    const hole = mole.parentNode;
    if (!hole.classList.contains('up')) return;

    const type = mole.dataset.type;
    const rect = mole.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (type === 'bunny') {
        score++;
        // Play local poof at the hole location
        playLocalLottie(x, y, 'effects/bunny.json'); 
    } 
    else if (type === 'bomb') {
        lives--;
        // Play local explosion at the hole location
        playLocalLottie(x, y, 'effects/explosion.json'); 
        
        document.body.classList.add('flash-red');
        if (navigator.vibrate) navigator.vibrate(300);
        setTimeout(() => document.body.classList.remove('flash-red'), 400);
    } 
    else if (type === 'gold') {
        score += 5;
        // Keep the big fullscreen effect for the crown
        triggerFullScreenBonus('effects/sparkle.json'); 
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    scoreBoard.textContent = score;
    hole.classList.remove('up');
    isMoleUp = false;
    updateLivesDisplay();
    if (lives <= 0) endGame();
}

function updateLivesDisplay() {
    livesBoard.textContent = '❤️'.repeat(Math.max(0, lives));
}

function endGame() {
    gameActive = false;
    if (score > topScore) {
        topScore = score;
        localStorage.setItem('bunnyHighScore', topScore);
        highScoreBoard.textContent = topScore;
    }
    finalScoreText.textContent = `Bunnies Saved: ${score}`;
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    score = 0; lives = 3; gameActive = true;
    scoreBoard.textContent = score;
    updateLivesDisplay();
    gameOverScreen.style.display = 'none';
    popUp();
}

holes.forEach(hole => {
    const mole = hole.querySelector('.mole');
    mole.addEventListener('mousedown', whack);
    mole.addEventListener('touchstart', (e) => { e.preventDefault(); whack(e); });
});

popUp();

function playLocalLottie(x, y, jsonPath) {
    const container = document.createElement('div');
    container.classList.add('local-lottie');
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    document.body.appendChild(container);

    const anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: jsonPath
    });

    anim.onComplete = () => {
        anim.destroy();
        container.remove();
    };
}