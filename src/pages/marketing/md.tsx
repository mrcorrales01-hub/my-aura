export function MD({ text }: { text: string }) {
  // Simple markdown-like replacement for headings, bold, bullet points
  const html = text
    .replace(/^### (.*)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^\* (.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\n/g, '<br/>');
  
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
