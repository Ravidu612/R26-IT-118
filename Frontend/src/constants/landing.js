export const landingFeatures = [
  {
    key: 'leaf-detect',
    title: 'Tea Leaf Detection',
    description:
      'Object detection model first validates whether the uploaded image contains a tea leaf before further analysis.',
    icon: 'Leaf',
  },
  {
    key: 'grade',
    title: 'Tea Grade Classification',
    description:
      'Classifies black tea grades such as BM, BOP, BP, BROKEN_TEA, DUST, FANNING_2, PF, and PW_DUST.',
    icon: 'BadgeCheck',
  },
  {
    key: 'health',
    title: 'Worker Health Risk Prediction',
    description:
      'Manual health reading input predicts worker stress state until IoT device integration is rolled out.',
    icon: 'HeartPulse',
  },
  {
    key: 'task',
    title: 'Smart Task Assignment',
    description:
      'Assigns suitable work recommendations based on risk level with supervisor review workflow support.',
    icon: 'HeartPulse',
  },
]

export const howItWorksSteps = [
  { title: 'Upload tea leaf image', icon: 'UploadCloud' },
  { title: 'AI checks whether it is a tea leaf', icon: 'BrainCircuit' },
  { title: 'AI classifies tea grade/type', icon: 'ShieldCheck' },
  { title: 'Analyze worker health readings manually', icon: 'Activity' },
  { title: 'System recommends safe task assignment', icon: 'Activity' },
]

export const modelStatuses = [
  {
    key: 'leaf-model',
    title: 'Tea Leaf Detection Model',
    status: 'Connected',
    description: 'YOLO tea_leaf object detection module routed via backend service layer.',
  },
  {
    key: 'grade-model',
    title: 'Tea Grade Model',
    status: 'Connected',
    description: 'ConvNeXt V2 Tiny grade classification flow available through backend API.',
  },
  {
    key: 'health-model',
    title: 'Worker Health Risk Model',
    status: 'Connected',
    description: 'Manual health feature input is supported while IoT stream integration is in progress.',
  },
  {
    key: 'iot-module',
    title: 'IoT Module Status',
    status: 'Prototype',
    description: 'Health telemetry ingestion and task recommendation logic planned next.',
  },
]
