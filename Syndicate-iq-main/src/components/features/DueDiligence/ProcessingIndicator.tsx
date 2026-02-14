import { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Progress } from '../../ui/Progress';
import { Spinner } from '../../ui/Progress';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  onComplete: () => void;
}

const statusMessages = [
  { progress: 0, message: 'Uploading document...' },
  { progress: 20, message: 'Extracting terms and conditions...' },
  { progress: 40, message: 'Analyzing covenants and amendments...' },
  { progress: 60, message: 'Calculating cross-border factors...' },
  { progress: 80, message: 'Assessing settlement risk...' },
  { progress: 95, message: 'Finalizing report...' },
];

export function ProcessingIndicator({ isProcessing, onComplete }: ProcessingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(statusMessages[0].message);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setElapsedTime(0);
      setCurrentMessage(statusMessages[0].message);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Update progress (0-100% over 4-5 seconds)
      const targetProgress = Math.min((elapsed / 5) * 100, 100);
      setProgress(targetProgress);

      // Update status message
      const currentStatus = statusMessages.find((s) => targetProgress >= s.progress);
      if (currentStatus) {
        setCurrentMessage(currentStatus.message);
      }

      if (targetProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, onComplete]);

  if (!isProcessing && progress === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Processing Document</h3>
          <div className="text-sm font-mono text-accent-gold">{formatTime(elapsedTime)}</div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} showLabel variant="default" />
          <p className="text-sm text-gray-400">{currentMessage}</p>
        </div>

        <div className="flex items-center justify-center py-4">
          <Spinner />
        </div>
      </div>
    </Card>
  );
}
