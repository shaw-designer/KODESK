import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../theme/modernTheme';

const glowPulse = keyframes`
  0% { text-shadow: 0 0 20px rgba(0, 217, 255, 0.3), 0 0 50px rgba(57, 255, 20, 0.15); }
  50% { text-shadow: 0 0 35px rgba(0, 217, 255, 0.9), 0 0 80px rgba(57, 255, 20, 0.4); }
  100% { text-shadow: 0 0 20px rgba(0, 217, 255, 0.3), 0 0 50px rgba(57, 255, 20, 0.15); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const sweep = keyframes`
  0% { transform: translateX(-110%); }
  100% { transform: translateX(110%); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, rgba(8, 12, 33, 0.82), rgba(8, 12, 33, 0.92)),
    url('/assets/Arcade.gif') center center / cover no-repeat;
  backdrop-filter: blur(10px);
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top left, rgba(0, 217, 255, 0.2), transparent 28%),
      radial-gradient(circle at bottom right, rgba(57, 255, 20, 0.15), transparent 24%);
    pointer-events: none;
  }
`;

const TextCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 900px;
  width: min(92%, 980px);
  padding: 48px 42px;
  border-radius: 28px;
  border: 1px solid rgba(0, 217, 255, 0.18);
  background: rgba(10, 14, 40, 0.92);
  box-shadow: 0 0 80px rgba(0, 217, 255, 0.08), inset 0 0 2px rgba(255, 255, 255, 0.05);
  animation: ${fadeIn} 0.8s ease forwards;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  text-align: center;
  line-height: 1.05;
  letter-spacing: 0.18em;
  color: ${colors.primary};
  text-transform: uppercase;
  font-weight: 900;
  animation: ${glowPulse} 2.8s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
    transform: translateX(-110%);
    animation: ${sweep} 2.5s ease-in-out 0.8s both;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.35rem);
  text-align: center;
  max-width: 720px;
  color: rgba(224, 224, 224, 0.88);
  letter-spacing: 0.04em;
  line-height: 1.7;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

const ContinueButton = styled.button`
  border: 2px solid ${colors.primary};
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.16), rgba(57, 255, 20, 0.16));
  color: ${colors.text};
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 14px 30px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  backdrop-filter: blur(16px);
  text-transform: uppercase;
  min-width: 180px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 28px rgba(0, 217, 255, 0.45), inset 0 0 8px rgba(0, 217, 255, 0.22);
    background: linear-gradient(135deg, rgba(0, 217, 255, 0.24), rgba(57, 255, 20, 0.24));
  }
`;

function OpeningSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('kodeskOpeningSplashShown');
  });

  useEffect(() => {
    if (!visible) return undefined;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('kodeskOpeningSplashShown', 'true');
      setVisible(false);
    }, 3800);

    return () => window.clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem('kodeskOpeningSplashShown', 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Overlay>
      <TextCard>
        <Title>WHERE PLAY BEGINS, CODE FOLLOWS</Title>
        <Subtitle>
          Enter the arena with a gamified welcome experience that sets the tone for every challenge, quest, and coding adventure ahead.
        </Subtitle>
        <ButtonGroup>
          <ContinueButton onClick={dismiss}>Skip Intro</ContinueButton>
        </ButtonGroup>
      </TextCard>
    </Overlay>
  );
}

export default OpeningSplash;
