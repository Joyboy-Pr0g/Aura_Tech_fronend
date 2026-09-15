export const ANALYTICS_PERIODS = [
  'this_week',
  'this_month',
  'last_three_month',
  'last_six_month',
  'last_year',
  'last_two_year',
] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const ANALYTICS_PERIOD_LABEL_KEYS: Record<AnalyticsPeriod, string> = {
  this_week: 'admin.analyticsPeriodThisWeek',
  this_month: 'admin.analyticsPeriodThisMonth',
  last_three_month: 'admin.analyticsPeriodLastThreeMonth',
  last_six_month: 'admin.analyticsPeriodLastSixMonth',
  last_year: 'admin.analyticsPeriodLastYear',
  last_two_year: 'admin.analyticsPeriodLastTwoYear',
};
