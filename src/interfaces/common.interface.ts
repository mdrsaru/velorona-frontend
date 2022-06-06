import { TimeEntry } from './generated';

export type MayBe<T> = undefined | T;

export interface IGroupedTimeEntries {
  /**
   * task id
   */
  id: string; 
  name: string;
  project: string;
  project_id: string;
  entries: {
    [date: string]: TimeEntry[]
  }

}
