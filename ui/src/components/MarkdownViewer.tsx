import React from 'react';

// --- Premium Markdown Parser ---
function renderMarkdown(markdown: string): string {
  // Normalize line endings to ease matching
  let html = markdown.replace(/\r\n/g, '\n');

  // Extract code blocks first and replace with placeholders to avoid formatting inside code blocks
  const codeBlocks: string[] = [];
  html = html.replace(/```(typescript|javascript|json|html|css)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="language-${lang || 'txt'}">${escapedCode}</code></pre>`);
    return placeholder;
  });

  // Format headers
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Format bold-arrow task items: e.g., - [ ] **filename** -> instruction
  html = html.replace(/^\s*[-*]\s*\[\s*\]\s*\*\*(.*?)\*\*\s*(?:->|&rarr;)\s*(.*?)$/gim, (_, file, desc) => {
    return `<li><span class="markdown-checkbox" aria-label="Toggle task"></span><strong>${file}</strong> &rarr; ${desc}</li>`;
  });

  // Format general task items: e.g., - [ ] description
  html = html.replace(/^\s*[-*]\s*\[\s*\]\s*(.*?)$/gim, (_, desc) => {
    return `<li><span class="markdown-checkbox" aria-label="Toggle task"></span>${desc}</li>`;
  });

  // Process blocks and group list items properly
  const lines = html.split('\n');
  const resultLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        resultLines.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('<li>')) {
      if (!inList) {
        resultLines.push('<ul>');
        inList = true;
      }
      resultLines.push(line);
    } else {
      if (inList) {
        resultLines.push('</ul>');
        inList = false;
      }

      // If heading or code block placeholder, don't wrap in paragraph
      if (line.startsWith('<h2>') || line.startsWith('<h1>') || line.startsWith('__CODE_BLOCK_')) {
        resultLines.push(line);
      } else {
        resultLines.push(`<p>${line}</p>`);
      }
    }
  }

  if (inList) {
    resultLines.push('</ul>');
  }

  let finalHtml = resultLines.join('\n');

  // Restore code blocks
  codeBlocks.forEach((codeBlock, idx) => {
    finalHtml = finalHtml.replace(`__CODE_BLOCK_${idx}__`, codeBlock);
  });

  return finalHtml;
}

interface MarkdownViewerProps {
  markdown: string;
}

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  const handleMarkdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('markdown-checkbox')) {
      target.classList.toggle('checked');
    }
  };

  return (
    <div 
      className="markdown-body" 
      id="markdown-output"
      onClick={handleMarkdownClick}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
