
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 15;
const CELL_SIZE = 16;

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Verificar colisão com paredes
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Verificar colisão consigo mesmo
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Verificar se comeu a comida
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake, isPlaying]);

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        const isHead = snake[0]?.x === x && snake[0]?.y === y;

        grid.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-4 h-4 border border-neutral-300 dark:border-neutral-600
              ${isHead ? 'bg-green-600' : isSnake ? 'bg-green-400' : ''}
              ${isFood ? 'bg-red-500 rounded-full' : ''}
            `}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex justify-between items-center w-full">
        <div className="text-sm font-medium">
          Pontuação: {score}
        </div>
        <Button
          size="sm"
          onClick={resetGame}
          variant={gameOver ? "default" : "outline"}
        >
          {gameOver ? 'Jogar Novamente' : isPlaying ? 'Reiniciar' : 'Iniciar'}
        </Button>
      </div>

      <div 
        className="grid bg-neutral-100 dark:bg-neutral-700 p-2 rounded-lg border"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: GRID_SIZE * CELL_SIZE + 16,  
          height: GRID_SIZE * CELL_SIZE + 16
        }}
      >
        {renderGrid()}
      </div>

      {gameOver && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Game Over!
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Use as setas do teclado para jogar
          </p>
        </div>
      )}

      {!isPlaying && !gameOver && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
          Use as setas do teclado para controlar a cobra
        </p>
      )}
    </div>
  );
};
