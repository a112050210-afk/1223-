
export enum DietaryMode {
  LOW_CARB = '低碳',
  MUSCLE_GAIN = '增肌',
  SUGAR_CONTROL = '控糖',
  FAT_LOSS = '減脂'
}

export interface AnalysisResponse {
  candidates?: Array<{
    content?: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface ApiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    } | {
      inline_data: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
}
