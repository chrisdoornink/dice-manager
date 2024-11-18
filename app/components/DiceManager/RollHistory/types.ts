export interface RollHistoryItem {
  id: string;
  dieName: string;
  value: string;
  timestamp: number;
}

export interface RollGroup {
  timestamp: number;
  rolls: RollHistoryItem[];
}