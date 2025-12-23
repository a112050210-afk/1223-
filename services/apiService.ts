
import { API_CONFIG } from '../constants';
import { ApiRequest, DietaryMode } from '../types';

export const analyzeFoodImage = async (base64Image: string, mode: DietaryMode): Promise<string> => {
  const prompt = `你是一位專業的 AI 營養師。請分析這張圖中的食物內容，並嚴格遵循以下結構回報結果：

1. **食物內容描述**：簡述辨識出的餐點名稱與主要食材。
2. **熱量估算（${mode}模式）**：提供具體的熱量區間（例如：500-700 大卡），並說明在該模式下應如何調整份量以達成目標。
3. **營養重點與建議**：列出三大營養素（碳水、蛋白質、脂肪）的比例狀況，並給予 3-4 個具體的飲食調整建議（使用列點）。
4. **總結**：給予一段鼓勵使用者的結語。

請務必針對『${mode}』模式進行適配性分析。
若影像中沒有食物，請僅回傳「{{無法分析}}」。`;

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
