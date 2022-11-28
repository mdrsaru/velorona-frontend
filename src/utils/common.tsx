import moment from 'moment';
import { Button, notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification';
import routes from '../config/routes';
import { authVar } from '../App/link';
import { Company } from '../interfaces/generated';

export const round = (value: number, decimals: number): number => {
  const temp = parseFloat(value + `e+${decimals}`);
  const result = Math.round(temp) + `e-${decimals}`;
  return parseFloat(result);
}

export const getWeekDays = (date: string | Date): string[] => {
  const dates: string[] = [];
  const current = moment(date);

  for (let i = 0; i < 7; i++) {
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

export type CheckSubscriptionArgs = {
  expectedSubscription: string[];
  userSubscription: string;
}

export const checkRoles = (args: CheckRoleArgs) => {
  const expectedRoles = args.expectedRoles;
  const userRoles: string[] = args.userRoles;

  return expectedRoles.some((role) => userRoles.includes(role));
};

export const checkSubscriptions = (args: CheckSubscriptionArgs) => {
  const userSubscription = args.userSubscription;
  const expectedSubscription: string[] = args.expectedSubscription;

  return expectedSubscription.includes(userSubscription);
};
const arrayToCsv = (jsonData: any, csvHeader: any) => {
  let csvRows = [];
  let data = jsonData ?? []

  const headerValues = csvHeader.map((header: any) => header.label);
  csvRows.push(headerValues.join(','));
  data.forEach((row: any) => {
    const rowValues = csvHeader.map((header: { key: string, label: string, subKey?: string }) => {
      const escaped = header?.subKey ? ('' + row[header.key][header?.subKey] ?? '').replace(/"/g, '\\"') :
        ('' + row[header.key] ?? '').replace(/"/g, '\\"')
      return `"${escaped}"`;
    });
    csvRows.push(rowValues.join(','));
  })
  return csvRows.join('\n');
}

export const downloadCSV = (jsonData: any, csvHeader: any, fileName: string) => {
  const csvData = arrayToCsv(jsonData, csvHeader)
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const getDurationFromTimeFormat = (timeFormat: string): number => {
  const formatList = timeFormat?.split(':');
  let duration = 0;

  if (formatList.length) {
    const hour = parseInt(formatList[0] ?? 0);
    const min = parseInt(formatList[1] ?? 0);
    const seconds = parseInt(formatList[2] ?? 0);
    duration = seconds;

    if (hour) {
      duration += hour * 60 * 60;
    }

    if (min) {
      duration += min * 60;
    }
  }

  return duration;
}

export function secondsToHms(d: any) {
  d = Number(d);
  let h = d / 3600;

  return h.toFixed(2)
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export type NotificationArgs = {
  type: NotificationType,
  title: string,
  description: string,
  placement?: NotificationPlacement,
  duration?: number | null;
}


export const openNotificationWithIcon = (args: NotificationArgs) => {
  const authData = authVar()

  const btn = (
    <Button><a href={routes.subscription.path(authData.company?.code as string)} target='_blank' rel="noreferrer">Renew subscription</a></Button>
  )


  notification.destroy()
  notification[args.type]({
    message: args.title,
    description: args.description,
    placement: args.placement ?? 'top',
    duration: args.duration ?? 4.5,
    btn
  });
};

export type NotifySubscriptionExpiration = {
  periodEnd: string;
  status: string | null | undefined;
  trialEndDate: string;
};

export const notifySubscriptionExpiration = (args: NotifySubscriptionExpiration) => {
  const status = args.status;

  const now = moment();
  let title: string = '';
  let description: string = '';
  let type: NotificationType;

  if (status === 'trialing') {
    if (!args.trialEndDate) {
      return;
    }

    const trialEnd = moment(args.trialEndDate);
    const diff = trialEnd.diff(now, 'days');

    if (diff >= 0 && diff <= 7) {
      type = 'warning'
      title = 'Trial about to end';
      description = `Your subscription trial will end in ${diff} days. Please update the payment details from the subscription menu.`;
    } else if (diff < 0) {
      type = 'error'
      title = 'Trial ended';
      description = `Your subscription trial has ended. Please update the payment details from the subscription menu.`;
    }
  } else {
    const periodEnd = moment(args.periodEnd);

    const diff = periodEnd.diff(now, 'days');

    if (diff >= 0 && diff <= 7) {
      title = 'Subscription about to expire';
      description = `Your subscription will expire in ${diff} days.`;
      type = 'warning'
    } else if (diff < 0) {
      title = 'Subscription expired';
      description = `Your subscription has expired.`;
      type = 'error'
    }
  }


  if (title && description) {
    setTimeout(() => {
      openNotificationWithIcon({
        type: type,
        title,
        description,
        duration: 0,
      });
    }, 2000)
  }

}

export type NotifyCompanySignUp = {
  companyList: any
};

export const openPendingCompanyNotification = (args: NotificationArgs) => {

  const btn = (
    <Button><a href={routes.companyAdmin.path} target='_blank' rel="noreferrer">Go to Company List</a></Button>
  )


  notification.destroy()
  notification[args.type]({
    message: args.title,
    description: args.description,
    placement: args.placement ?? 'top',
    duration: args.duration ?? 4.5,
    btn
  });
};

export const notifyCompanySignUp = (args: NotifyCompanySignUp) => {
let unapprovedCompany = false;
  args?.companyList?.map((company: Company, index: number) => {
    if (company?.unapprovedNotification) {
      unapprovedCompany = true
    }

    return(
      <div key={index}></div>
    )
  })
 if(unapprovedCompany){
  openPendingCompanyNotification({
    type: 'info',
    title: `New company approval pending`,
    description: `Click the button to see the upapproved company list`,
    duration: 0,
  });
}
}