export function parseAIResponse(rawText: string, expectedFormat: string) {
  if (expectedFormat === 'json') {
    try {
      const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return { success: true, data: JSON.parse(cleaned) };
    } catch (e) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return { success: true, data: JSON.parse(jsonMatch[0]) };
        } catch (e2) {
          return { success: false, error: 'Failed to parse JSON', raw: rawText };
        }
      }
      return { success: false, error: 'No JSON found in response', raw: rawText };
    }
  }

  if (expectedFormat === 'audit_line') {
    const scores: any = {};
    const hookMatch = rawText.match(/Hook:\s*(\d+)\/10/);
    const trustMatch = rawText.match(/Trust:\s*(\d+)\/10/);
    const overallMatch = rawText.match(/Overall:\s*(\d+)\/100/);
    const cacMatch = rawText.match(/CAC:\s*₹([\d,]+)/);

    if (hookMatch) scores.hook = parseInt(hookMatch[1]);
    if (trustMatch) scores.trust = parseInt(trustMatch[1]);
    if (overallMatch) scores.overall = parseInt(overallMatch[1]);
    if (cacMatch) scores.cac = parseInt(cacMatch[1].replace(/,/g, ''));

    scores.dual = rawText.includes('Dual: ✅') ? 'aligned' : 'partial';
    scores.raw = rawText;

    return { success: true, data: scores };
  }

  return { success: true, data: { text: rawText }, format: 'markdown' };
}
