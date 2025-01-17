import { CalendarEventType } from '../enums/calendar-event-type.enum';

export interface ICashFlowEvent {
  color: string;
  type: CalendarEventType;
  value: number;
  title: string;
  start: Date;
  end: Date;
}

export type TCashFlowByDay = {
  [key: string]: {
    events: ICashFlowEvent[];
    cashBalance?: number;
  };
};

export interface ICashFlowResponse {
  monthCashBalance: number;
  cashFlowByDay: TCashFlowByDay;
}
