export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  deadline?: string;
  color?: string;
  icon?: string;
  isCompleted: boolean;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  color?: string;
  icon?: string;
}
