import { useState, useEffect } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';

interface LevelConfig {
  level: number;
  percentage: number;
  color: {
    bg: string;
    text: string;
  };
}

export const useLevelsConfig = () => {
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLevelsConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await googleSheetsService.getLevelsConfig();
        
        if (result.success && result.levels) {
          setLevels(result.levels);
          console.log('Levels config loaded successfully:', result.levels);
        } else {
          console.error('Failed to load levels config:', result.error);
          setError(result.error || 'Failed to load levels config');
        }
      } catch (err) {
        console.error('Error in useLevelsConfig:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLevelsConfig();
  }, []);

  return { levels, loading, error };
};
