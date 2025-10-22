
export enum WorkflowStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface SeoData {
  title: string;
  description: string;
  tags: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: WorkflowStepStatus;
  result?: any;
  error?: string;
  longRunningMessage?: string;
}

export interface GeneratedAssets {
  script: string;
  videoUrl: string;
  thumbnailUrl: string;
  seo: SeoData;
}
