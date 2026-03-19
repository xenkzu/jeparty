import { useState } from 'react';
import Setup from './screens/Setup/Setup';
import GameBoard from './screens/GameBoard/GameBoard';
import QuestionModal from './screens/QuestionModal/QuestionModal';
import EndScreen from './screens/EndScreen/EndScreen';
import Title from './components/ui/Title';

type Screen = 'SETUP' | 'GAME' | 'QUESTION' | 'END';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SETUP');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);

  const navigateTo = (screen: Screen) => {
    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SETUP':
        return <Setup onStart={() => navigateTo('GAME')} />;
      case 'GAME':
        return (
          <GameBoard 
            onQuestionSelect={() => navigateTo('QUESTION')} 
            onEndGame={() => navigateTo('END')} 
          />
        );
      case 'QUESTION':
        return (
          <QuestionModal 
            onClose={() => navigateTo(prevScreen || 'GAME')} 
            onAnswerCorrect={() => navigateTo('GAME')}
            onAnswerIncorrect={() => navigateTo('GAME')}
          />
        );
      case 'END':
        return <EndScreen onRestart={() => navigateTo('SETUP')} />;
      default:
        return <div>Error loading game state.</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#1c1c1c] text-white">
      <div className="max-w-7xl w-full px-4 pt-12">
        <Title className="text-center mb-16">JEPARTY!</Title>
        <main className="w-full flex flex-col items-center">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default App;
