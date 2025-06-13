import React, { useState, useEffect } from 'react';
import VoiceCircle from './components/VoiceCircle';
import { AppProvider } from './contexts/AppContext';

const AppContent: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'transitioning' | 'complete'>('loading');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start transition phase after animation begins
    const transitionTimer = setTimeout(() => {
      setAnimationPhase('transitioning');
    }, 1800); // Start showing layout elements before animation completes

    // Complete the animation
    const completeTimer = setTimeout(() => {
      setAnimationPhase('complete');
      // Show instructions at the same time as main content
      setShowContent(true);
    }, 2500);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-custom-gradient relative overflow-hidden">
      {/* Animated title - always present but positioned differently */}
      <h1 
        className={`flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl md:text-5xl pixel-font text-indicator-red z-10 p-2 sm:p-4 ${
          animationPhase === 'loading' 
            ? 'animate-smoothFadeInAndMove' 
            : animationPhase === 'transitioning'
            ? 'absolute left-1/2 top-4 sm:top-6 md:top-8 transform -translate-x-1/2 text-lg sm:text-xl md:text-2xl transition-all duration-700 ease-out'
            : 'absolute left-1/2 top-4 sm:top-6 md:top-8 transform -translate-x-1/2 text-lg sm:text-xl md:text-2xl'
        }`}
      >
        <img 
          src="/assets/mushroom.svg" 
          alt="mushroom" 
          className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-700'
        />
        <div className="text-center">yes and</div>
        <img 
          src="/assets/mushroom.svg" 
          alt="mushroom" 
          className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-700'
        />
      </h1>

      {/* Main content - fades in during transition */}
      <main 
        className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-700 ${
          animationPhase === 'loading' ? 'opacity-0' : 'opacity-100'
        } ${showContent ? 'pt-16 sm:pt-20 md:pt-24' : ''}`}
      >
        {showContent && (
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* Instructions */}
            <div className="mb-8 sm:mb-12 md:mb-16 text-center animate-instructionsFadeIn max-w-xs sm:max-w-md md:max-w-lg px-4">
              <div className="text-left">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-center text-rose-900">Improvise. Adapt. Build worlds.</h3>
                <div className="text-sm sm:text-md text-center text-pink-900 leading-6 sm:leading-7 md:leading-8">
                  <span className="font-semibold">Yes And</span> is a classic improv game that encourages cooperative storytelling by accepting each others ideas and building on them. Start a conversation with any idea. Then, your partner will respond with 'Yes, and...', adding something new to your idea.<br /> <br /> Example: 'I'm opening a restaurant' → 'Yes, and it only serves food that glows in the dark!'
                </div>
              </div>
            </div>
          <VoiceCircle />
        </div>
        )}
      </main>

      {/* Footer */}
      {showContent && <footer className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center sm:items-end font-light text-xs text-rose-900 gap-2 sm:gap-0">
        <div className="max-w-xs order-2 sm:order-1">
        {/* TODO: for funsies */}
        </div>
        <div className="max-w-xs text-center sm:text-right order-1 sm:order-2">
        <p>Suggestions? <a href="https://mehularora.me" target="_blank" className="underline font-semibold">Reach out!</a></p>
        </div>
      </footer>}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}