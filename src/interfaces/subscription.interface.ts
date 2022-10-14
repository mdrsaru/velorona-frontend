export interface IPlan {
  name: string;
  description: string;
  price: string;
  features: string[];
  subscriptionStatus: string | null;
  trialEndDate?: Date;
  isCurrent: boolean;
};
