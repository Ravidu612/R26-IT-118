export const workerHealthGroups = [
  {
    title: 'Heart Rate Features',
    fields: [
      { key: 'avg_hr', label: 'Average HR' },
      { key: 'max_hr', label: 'Max HR' },
      { key: 'min_hr', label: 'Min HR' },
      { key: 'std_hr', label: 'HR Std Dev' },
    ],
  },
  {
    title: 'SpO2 Features',
    fields: [
      { key: 'avg_spo2', label: 'Average SpO2' },
      { key: 'min_spo2', label: 'Min SpO2' },
      { key: 'max_spo2', label: 'Max SpO2' },
      { key: 'std_spo2', label: 'SpO2 Std Dev' },
      { key: 'spo2_drop_count_95', label: 'SpO2 Drops <95' },
      { key: 'spo2_drop_count_92', label: 'SpO2 Drops <92' },
    ],
  },
  {
    title: 'Trend Features',
    fields: [
      { key: 'hr_slope', label: 'HR Slope' },
      { key: 'spo2_slope', label: 'SpO2 Slope' },
    ],
  },
]

export const workerHealthPresets = {
  Normal: {
    avg_hr: 76, max_hr: 96, min_hr: 64, std_hr: 7, avg_spo2: 98, min_spo2: 96, max_spo2: 99, std_spo2: 0.9,
    spo2_drop_count_95: 0, spo2_drop_count_92: 0, hr_slope: 0.1, spo2_slope: 0.02,
  },
  'Medium Risk': {
    avg_hr: 92, max_hr: 122, min_hr: 72, std_hr: 12, avg_spo2: 95, min_spo2: 92, max_spo2: 98, std_spo2: 1.8,
    spo2_drop_count_95: 2, spo2_drop_count_92: 1, hr_slope: 0.45, spo2_slope: -0.18,
  },
  'High Risk': {
    avg_hr: 112, max_hr: 146, min_hr: 82, std_hr: 16, avg_spo2: 92, min_spo2: 88, max_spo2: 96, std_spo2: 2.6,
    spo2_drop_count_95: 5, spo2_drop_count_92: 3, hr_slope: 0.9, spo2_slope: -0.35,
  },
}

export const defaultWorkerHealthValues = workerHealthPresets.Normal
