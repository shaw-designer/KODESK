import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { colors } from '../../theme/modernTheme';

const GlobalGameStyle = createGlobalStyle`
  .harey-game-root {
    --bg-color: #22c55e;
    --hole-color: #1a0a02;
    --dirt-color: #78350f;
    --gold: #fcd34d;
  }

  .harey-game-root #bonus-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99;
  }

  .harey-game-root .local-lottie {
    position: absolute;
    width: 140px;
    height: 140px;
    pointer-events: none;
    z-index: 100;
    transform: translate(-50%, -50%);
  }

  .harey-game-root .game-box {
    display: grid;
    grid-template-columns: repeat(3, 110px);
    grid-template-rows: repeat(3, 110px);
    gap: 15px;
    background: var(--dirt-color);
    padding: 20px;
    border-radius: 25px;
    border: 8px solid #451a03;
    position: relative;
    z-index: 5;
  }

  .harey-game-root .hole {
    background: var(--hole-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 55px;
    position: relative;
    overflow: hidden;
    height: 110px;
    width: 110px;
    box-shadow: inset 0 8px 15px rgba(0,0,0,0.7);
  }

  .harey-game-root .mole {
    position: absolute;
    bottom: -100%;
    width: 100%;
    text-align: center;
    transition: bottom 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 5;
    cursor: pointer;
    user-select: none;
  }

  .harey-game-root .up .mole {
    bottom: 10%;
  }

  @keyframes hole-blast {
    0% { transform: scale(1); background: #ef4444; }
    50% { transform: scale(1.2); background: #f97316; }
    100% { transform: scale(1); background: var(--hole-color); }
  }

  .harey-game-root .blast-effect {
    animation: hole-blast 0.4s ease-out;
    overflow: visible !important;
  }

  @keyframes screen-flash {
    0% { background: #991b1b; }
    100% { background: var(--bg-color); }
  }

  .harey-game-root.flash-red {
    animation: screen-flash 0.4s forwards;
  }
`;

const GameContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.surface}FF 0%, ${colors.surfaceLight}FF 100%);
  padding: 20px;
  border-radius: 16px;
  gap: 20px;
  position: relative;
  min-height: 500px;
`;

const UIContainer = styled(Box)`
  display: flex;
  gap: 20px;
  background: rgba(0, 0, 0, 0.6);
  padding: 12px 30px;
  border-radius: 50px;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  font-size: 16px;
  font-weight: 600;
`;

const Stat = styled.div`
  display: flex;
  gap: 8px;
  min-width: 100px;
`;

const GameOver = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: ${props => props.$active ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 100;
  border-radius: 16px;
  gap: 20px;
`;

const GameOverTitle = styled(Typography)`
  font-size: 3rem;
  font-weight: 800;
  color: #ff6b6b;
`;

const GameOverScore = styled(Typography)`
  font-size: 1.5rem;
  color: #ffd700;
`;

const GameOverButton = styled(Button)`
  && {
    padding: 12px 32px;
    font-size: 1rem;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
    color: white;
    font-weight: 700;
    margin-top: 16px;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const BonusOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99;
`;

function HareyException({ onScore, onBack }) {
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('hareyHighScore') || '0');
  });
  const [gameActive, setGameActive] = useState(true);
  const [isMoleUp, setIsMoleUp] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [holes, setHoles] = useState([]);

  const lastHoleRef = useRef(null);
  const bonusOverlayRef = useRef(null);

  // Load Lottie
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize holes
  useEffect(() => {
    if (containerRef.current) {
      const holeElements = containerRef.current.querySelectorAll('.hole');
      setHoles(Array.from(holeElements));
    }
  }, []);

  const randomHole = () => {
    if (holes.length === 0) return null;
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHoleRef.current) return randomHole();
    lastHoleRef.current = hole;
    return hole;
  };

  const popUp = () => {
    if (!gameActive || isMoleUp) return;
    setIsMoleUp(true);

    const speed = Math.max(450, 1050 - score * 15);
    const hole = randomHole();
    if (!hole) return;

    const moleElement = hole.querySelector('.mole');
    const randomVal = Math.random();

    if (randomVal < 0.22) {
      moleElement.textContent = '💣';
      moleElement.dataset.type = 'bomb';
    } else if (randomVal > 0.94) {
      moleElement.textContent = '👑';
      moleElement.dataset.type = 'gold';
    } else {
      moleElement.textContent = '🐹';
      moleElement.dataset.type = 'bunny';
    }

    hole.classList.add('up');
    setTimeout(() => {
      hole.classList.remove('up');
      setIsMoleUp(false);
      if (gameActive) setTimeout(popUp, 100);
    }, speed);
  };

  const playLocalLottie = (x, y, animationUrl) => {
    const container = document.createElement('div');
    container.classList.add('local-lottie');
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    if (containerRef.current) {
      containerRef.current.appendChild(container);
    }

    if (window.lottie) {
      const anim = window.lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: animationUrl,
      });

      anim.onComplete = () => {
        anim.destroy();
        container.remove();
      };
    }
  };

  const triggerFullScreenBonus = (animationUrl) => {
    if (!window.lottie || !bonusOverlayRef.current) return;
    bonusOverlayRef.current.innerHTML = '';
    const anim = window.lottie.loadAnimation({
      container: bonusOverlayRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: animationUrl,
    });

    anim.onComplete = () => {
      anim.destroy();
      bonusOverlayRef.current.innerHTML = '';
    };
  };

  const whack = (e) => {
    if (!gameActive) return;
    const mole = e.target;
    if (!mole.classList.contains('mole')) return;
    const hole = mole.parentNode;
    if (!hole.classList.contains('up')) return;

    const type = mole.dataset.type;
    const rect = mole.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    let newScore = score;

    if (type === 'bunny') {
      newScore = score + 1;
      setScore(newScore);
      playLocalLottie(x, y, '/assets/bunny.json');
    } else if (type === 'bomb') {
      setLives(lives - 1);
      playLocalLottie(x, y, '/assets/explosion.json');
      
      if (containerRef.current) {
        containerRef.current.classList.add('flash-red');
        if (navigator.vibrate) navigator.vibrate(300);
        setTimeout(() => containerRef.current?.classList.remove('flash-red'), 400);
      }

      if (lives - 1 <= 0) {
        endGame(score);
      }
    } else if (type === 'gold') {
      newScore = score + 5;
      setScore(newScore);
      triggerFullScreenBonus('/assets/sparkle.json');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    hole.classList.remove('up');
    setIsMoleUp(false);
  };

  const endGame = (finalScore) => {
    setGameActive(false);
    setGameOver(true);

    let newHighScore = highScore;
    if (finalScore > highScore) {
      newHighScore = finalScore;
      setHighScore(newHighScore);
      localStorage.setItem('hareyHighScore', newHighScore);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameActive(true);
    setGameOver(false);
    setIsMoleUp(false);
    lastHoleRef.current = null;
    setTimeout(popUp, 100);
  };

  // Start game on mount
  useEffect(() => {
    if (gameActive && holes.length > 0) {
      const timer = setTimeout(popUp, 100);
      return () => clearTimeout(timer);
    }
  }, [gameActive, holes.length]);

  const handleGameOver = () => {
    onScore(score);
  };

  return (
    <GameContainer className="harey-game-root" ref={containerRef}>
      <GlobalGameStyle />
      <BonusOverlay ref={bonusOverlayRef} />

      <UIContainer>
        <Stat>Score: <span>{score}</span></Stat>
        <Stat>Best: <span>{highScore}</span></Stat>
        <Stat>
          Health:{' '}
          <span>
            {Array.from({ length: Math.max(0, lives) }, () => '❤️').join('')}
          </span>
        </Stat>
      </UIContainer>

      <Box className="game-box">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="hole">
            <span
              className="mole"
              onMouseDown={whack}
              onTouchStart={(e) => {
                e.preventDefault();
                whack(e);
              }}
              style={{ userSelect: 'none' }}
            />
          </div>
        ))}
      </Box>

      <GameOver $active={gameOver}>
        <GameOverTitle>BOOM!</GameOverTitle>
        <GameOverScore>Bunnies Saved: {score}</GameOverScore>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <GameOverButton onClick={resetGame}>Play Again</GameOverButton>
          <GameOverButton onClick={handleGameOver} variant="contained">
            Finish & Score
          </GameOverButton>
        </Box>
      </GameOver>
    </GameContainer>
  );
}

export default HareyException;
