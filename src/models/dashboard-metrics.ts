export interface DashboardMetric {
  metricType: string;
  timeFrame_entityId: string;
  entityId: string;
  value?: number;
  previousValue?: number;
  change?: number;
  trend?: string;
  updatedAt?: string;
}
