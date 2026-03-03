export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function getRiskColor(level: number): string {
  if (level <= 2) return 'bg-green-500';
  if (level === 3) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getRiskLabel(level: number): string {
  if (level <= 2) return '低风险';
  if (level === 3) return '中风险';
  return '高风险';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}
