
import { API_CONFIG } from '../constants';
import { ApiRequest, DietaryMode } from '../types';

export const analyzeFoodImage = async (base64Image: string, mode: DietaryMode): Promise<string> => {
  const prompt = `請描述這張圖中的食物內容，並根據『${mode}』模式估算熱量區間與營養重點。`;

  const requestBody: ApiRequest = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': API_CONFIG.AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('無法從 API 取得分析結果');
    }

    return resultText;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};
