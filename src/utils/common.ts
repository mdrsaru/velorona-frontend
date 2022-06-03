import moment from 'moment';

export const round = (value: number, decimals: number): number => {
  const temp = parseFloat(value + `e+${decimals}`);
  const result = Math.round(temp)  + `e-${decimals}`;
  return parseFloat(result);
}   

export const getWeekDays = (date: string | Date): string[] => {
  const dates: string[] = [];
  const current = moment(date);

  for(let i = 0; i < 7; i++) {
    dates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'days');
  }

  return dates;
}

export const getTimeFormat = (seconds: any) => {
  let second = parseInt(seconds, 10);
  let sec_num = Math.abs(second);
  let hours: any = Math.floor(sec_num / 3600);
  let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
  let secs: any = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (secs < 10) { secs = "0" + secs; }
  return hours + ':' + minutes + ':' + secs;
};

export const _cs = (names: string[]) => {
  return names.join(' ');
}


export type CheckRoleArgs = {
  expectedRoles: string[];
  userRoles: string[];
}

export const checkRoles = (args: CheckRoleArgs) => {
  const expectedRoles = args.expectedRoles;
  const userRoles: string[] = args.userRoles;

  return expectedRoles.some((role) => userRoles.includes(role));
};

