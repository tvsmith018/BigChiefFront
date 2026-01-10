import { useState, useEffect,useRef } from "react";

interface CountdownOptions {
  initialMinutes?: number;
  onComplete?: () => void;
}

export const useCountdown = ({ initialMinutes = 5, onComplete }: CountdownOptions = {}) => {
  const initialSeconds = initialMinutes * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current!);
          onComplete?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onComplete]); // Re-run effect if onComplete changes

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return { minutes, seconds, timeRemaining };
};