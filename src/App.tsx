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
        className={`flex items-center justify-center gap-3 text-5xl pixel-font text-indicator-red z-10 p-4 ${
          animationPhase === 'loading' 
            ? 'animate-smoothFadeInAndMove' 
            : animationPhase === 'transitioning'
            ? 'absolute left-1/2 top-8 transform -translate-x-1/2 text-2xl transition-all duration-700 ease-out'
            : 'absolute left-1/2 top-8 transform -translate-x-1/2 text-2xl'
        }`}
      >
        <img 
          src="/assets/mushroom.svg" 
          alt="mushroom" 
          className='w-12 h-12 transition-all duration-700'
        />
        yes and
        <img 
          src="/assets/mushroom.svg" 
          alt="mushroom" 
          className='w-12 h-12 transition-all duration-700'
        />
      </h1>

      {/* Main content - fades in during transition */}
      <main 
        className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 ${
          animationPhase === 'loading' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {showContent && (
          <div className="flex flex-col items-center">
            {/* Instructions */}
            <div className="mb-16 text-center animate-instructionsFadeIn max-w-md">
              <div className="text-left">
                <h3 className="text-2xl font-semibold mb-4 text-center text-rose-900">Improvise. Adapt. Build worlds.</h3>
                <div className="text-md text-center text-pink-900 leading-10">
                  Start a conversation. Build a story by responding with 'yes, and...'. Dive right into it with a topic you want to discuss. No need for pleasantries!
                </div>
              </div>
            </div>
          <VoiceCircle />
        </div>
        )}
      </main>

      {/* Footer */}
      {showContent && <footer className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end font-light text-xs text-rose-900">
        <div className="max-w-xs">
        {/* TODO: for funsies */}
        </div>
        <div className="max-w-xs text-right">
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