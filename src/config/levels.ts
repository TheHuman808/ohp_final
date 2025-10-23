// Конфигурация уровней партнерской программы
export interface LevelConfig {
  level: number;
  percentage: number;
  color: {
    bg: string;
    text: string;
  };
}

export const PARTNER_LEVELS: LevelConfig[] = [
  {
    level: 1,
    percentage: 1,
    color: {
      bg: "from-blue-100 to-blue-200",
      text: "text-blue-800"
    }
  },
  {
    level: 2,
    percentage: 2,
    color: {
      bg: "from-cyan-100 to-cyan-200",
      text: "text-cyan-800"
    }
  },
  {
    level: 3,
    percentage: 4,
    color: {
      bg: "from-teal-100 to-teal-200",
      text: "text-teal-800"
    }
  },
  {
    level: 4,
    percentage: 8,
    color: {
      bg: "from-green-100 to-green-200",
      text: "text-green-800"
    }
  }
];

// Функция для получения процента по уровню
export const getPercentageByLevel = (level: number): number => {
  const levelConfig = PARTNER_LEVELS.find(l => l.level === level);
  return levelConfig ? levelConfig.percentage : 0;
};

// Функция для получения конфигурации уровня
export const getLevelConfig = (level: number): LevelConfig | undefined => {
  return PARTNER_LEVELS.find(l => l.level === level);
};
