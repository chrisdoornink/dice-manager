import type { StorageItem } from './index';
import type { Dice, DicePreset } from '../../app/components/DiceManager/constants';
import type { RollHistoryItem } from '../../app/components/DiceManager/RollHistory';

export const STORAGE_KEYS = {
  CURRENT_DICE: 'currentDice',
  DICE_PRESETS: 'dicePresets',
  ROLL_HISTORY: 'rollHistory',
} as const;

export const StorageItems = {
  currentDice: {
    key: STORAGE_KEYS.CURRENT_DICE,
    defaultValue: [] as Dice[],
  } as StorageItem<Dice[]>,

  dicePresets: {
    key: STORAGE_KEYS.DICE_PRESETS,
    defaultValue: [] as DicePreset[],
  } as StorageItem<DicePreset[]>,

  rollHistory: {
    key: STORAGE_KEYS.ROLL_HISTORY,
    defaultValue: [] as RollHistoryItem[],
  } as StorageItem<RollHistoryItem[]>,
};
