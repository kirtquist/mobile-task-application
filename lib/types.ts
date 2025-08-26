export interface Task {
    id: number;
    description: string;
    expanded_description: string;
    due_date: string;
    completed: boolean;
    completed_at: string | null;
    recurrence?: number | null;
  }

export type NewTask = {
  description: string;
  expanded_description: string | null;
  due_date: string;
  recurrence: number | null;
};

  export interface TaskCounts {
    all: number;
    today: number;
    upcoming: number;
    completed: number;
    overdue: number;
  }

export type FilterType = 'all' | 'completed' | 'incomplete' | 'today' | 'upcoming' | 'overdue';