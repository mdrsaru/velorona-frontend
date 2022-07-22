import { TimeEntry } from './generated';

export type MayBe<T> = undefined | T;

export interface IGroupedTimeEntries {
  /**
   * project id
   */
  id: string; 
  name: string;
  project: string;
  project_id: string;
  entries: {
    [date: string]: TimeEntry[]
  }

}
