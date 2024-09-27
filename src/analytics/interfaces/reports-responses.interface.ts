export interface IBarChartReportResponse {
  series: { name?: string; data: string | number[] }[];
  categories: string[];
}

export interface IDonutChartReportResponse {
  series: number[];
  labels: string[];
}
