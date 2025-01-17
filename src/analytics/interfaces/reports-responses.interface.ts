export interface IBarChartReportResponse {
  series: { name?: string; data: number[] }[];
  categories: string[];
}

export interface IDonutChartReportResponse {
  series: number[];
  labels: string[];
}
