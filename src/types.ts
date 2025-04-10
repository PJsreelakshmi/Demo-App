// src/types.ts
export interface Event {
    id: string;
    title: string;
    date: Date;
    color: string;
    duration?: number;
    isHoliday?: boolean;
  }
  
  export type ViewType = 'month' | 'week' | 'day';