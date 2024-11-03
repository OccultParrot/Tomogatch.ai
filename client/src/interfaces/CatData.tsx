export interface CatData {
  id: number | null;
  name: string;
  avatar: string;
  skin: string | null;
  personality: string | null;
  mood: number | null;
  patience: number | null;
  lastFeedDate: Date | null;
  deathFlag: number | null;
  isAlive: boolean | null;
  userId: number | null;
}
