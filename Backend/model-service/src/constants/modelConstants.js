export const TEA_GRADE_CLASSES = ['BM', 'BOP', 'BP', 'BROKEN_TEA', 'DUST', 'FANNING_2', 'PF', 'PW_DUST']
export const TEA_LEAF_DETECTION_DEFAULTS = Object.freeze({
  confidenceThreshold: 0.7,
  iouThreshold: 0.7,
  imageSize: 640,
})

export const GRADE_DESCRIPTIONS = {
  BM: 'Balanced medium black tea particles for blended factory output.',
  BOP: 'Broken Orange Pekoe grade with strong infusion and market demand.',
  BP: 'Broken Pekoe style with good body and consistent brew strength.',
  BROKEN_TEA: 'Mixed broken tea particles suited for high-volume blending.',
  DUST: 'Fine dust grade commonly used for quick and strong liquor extraction.',
  FANNING_2: 'Fine fannings grade suited for tea bags and fast brewing.',
  PF: 'Pekoe Fannings grade with brisk cup profile and fast infusion.',
  PW_DUST: 'Pekoe dust variant used for economical strong tea products.',
}

export const HEALTH_STATES = ['relaxed', 'emotional_stress', 'cognitive_stress', 'physical_stress']

export const HEALTH_FEATURE_KEYS = [
  'avg_hr',
  'max_hr',
  'min_hr',
  'std_hr',
  'avg_spo2',
  'min_spo2',
  'max_spo2',
  'std_spo2',
  'spo2_drop_count_95',
  'spo2_drop_count_92',
  'hr_slope',
  'spo2_slope',
]
