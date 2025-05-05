import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const zoomAnimation = keyframes`
  0% {
    transform: scale(0.1) rotate(0deg);
    opacity: 0;
  }
  40% {
    transform: scale(1.8) rotate(10deg);
    opacity: 1;
  }
  60% {
    transform: scale(1.8) rotate(-10deg);
    opacity: 1;
  }
  80% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  90% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(0) rotate(720deg);
    opacity: 0;
  }
`;

const SplashContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.5s ease-out;
  opacity: ${props => props.isVisible ? 1 : 0};
  pointer-events: ${props => props.isVisible ? 'all' : 'none'};
`;

const Logo = styled.img`
  width: 300px;
  height: auto;
  animation: ${zoomAnimation} 3s ease-in-out forwards;
`;

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <SplashContainer isVisible={isVisible}>
      <Logo src="/img/LogoSemFundo2.png" alt="Studio53 Logo" />
    </SplashContainer>
  );
};

export default SplashScreen; 