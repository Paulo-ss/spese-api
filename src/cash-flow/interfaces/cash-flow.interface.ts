import { CalendarEventType } from 'src/analytics/enums/calendar-event-type.enum';

export interface ICashFlowDaily {
  id: number;
  openingBalance: number;
  closingBalance: number;
  date: Date;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICashFlowTransaction {
  id: number;
  type: CalendarEventType;
  value: number;
  title: string;
  start: Date;
  end: Date;
}

export type TDailyCashFlow = {
  [key: string]: {
    transactions: ICashFlowTransaction[];
    openingBalance?: number;
    closingBalance?: number;
  };
};

export interface ICashFlowResponse {
  currentAccountsBalance?: number;
  dailyCashFlow: TDailyCashFlow;
}
