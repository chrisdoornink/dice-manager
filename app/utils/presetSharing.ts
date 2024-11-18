import type { Dice, DicePreset } from '../components/DiceManager/constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * Encodes a preset into a URL-safe string
 * Format: name:d6,1,2,3,4,5,6;d20,critical,hit,miss,...
 */
export const encodePreset = (preset: DicePreset): string => {
  const diceStr = preset.dice.map(die => {
    return `d${die.sides},${die.values.join(',')}`;
  }).join(';');

  const encoded = Buffer.from(`${preset.name}:${diceStr}`).toString('base64');
  return encoded;
};

/**
 * Decodes a URL-safe string into a preset
 */
export const decodePreset = (encoded: string): DicePreset | null => {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [name, diceStr] = decoded.split(':');
    
    if (!name || !diceStr) return null;

    const dice: Dice[] = diceStr.split(';').map(dieStr => {
      const [dType, valuesStr] = dieStr.split(',');
      const sides = parseInt(dType.substring(1));
      const values = valuesStr.split(',').map(value => {
        const numericValue = parseInt(value);
        return isNaN(numericValue) ? value : numericValue;
      });

      return {
        id: uuidv4(),
        name: dType.toUpperCase(),
        sides,
        values,
        currentValue: 0
      };
    });

    return {
      id: uuidv4(),
      name,
      dice
    };
  } catch (error) {
    console.error('Error decoding preset:', error);
    return null;
  }
};

/**
 * Checks if the current URL contains a shared preset
 */
export const getSharedPresetFromURL = (): DicePreset | null => {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('preset');
  
  if (!encoded) return null;
  
  return decodePreset(encoded);
};