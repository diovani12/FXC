import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return <div className="space-y-3 leading-relaxed text-slate-200">{renderMarkdown(content)}</div>;
};

function renderMarkdown(raw: string): React.ReactNode[] {
  if (!raw) return [];

  // Split into lines while respecting code blocks
  const lines = raw.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Multi-line Code Block
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch ? langMatch[1] : '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      const fullCode = codeLines.join('\n');
      elements.push(
        <CodeBlock key={`code-${keyIndex++}`} code={fullCode} language={language} />
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${keyIndex++}`}
          className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mt-4 mb-1"
        >
          {formatInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${keyIndex++}`}
          className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mt-5 mb-2 pb-1 border-b border-purple-500/20"
        >
          {formatInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${keyIndex++}`}
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-6 mb-3"
        >
          {formatInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      elements.push(
        <hr key={`hr-${keyIndex++}`} className="border-t border-purple-500/25 my-4" />
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <div
          key={`quote-${keyIndex++}`}
          className="border-l-4 border-purple-500 bg-purple-950/20 px-4 py-2.5 rounded-r-lg my-2 text-purple-200/90 italic"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{formatInline(ql)}</p>
          ))}
        </div>
      );
      continue;
    }

    // Table detection (markdown format | col1 | col2 |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      elements.push(<TableBlock key={`table-${keyIndex++}`} lines={tableLines} />);
      continue;
    }

    // Bullet List Item
    if (/^[\*\-\+]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[\*\-\+]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[\*\-\+]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${keyIndex++}`} className="space-y-1.5 my-2 ml-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered List Item
    if (/^\d+\.\s+/.test(line)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const match = lines[i].match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${keyIndex++}`} className="space-y-1.5 my-2 ml-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-300">
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-purple-900/40 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                {item.num}
              </span>
              <span className="flex-1">{formatInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={`p-${keyIndex++}`} className="text-slate-200">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Inline formatting: bold, italic, inline code
function formatInline(text: string): React.ReactNode {
  // Regex to match inline code, bold, italic
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  // Simple token regex: `code` or **bold** or *italic*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      parts.push(remaining);
      break;
    }

    if (match.index > 0) {
      parts.push(remaining.substring(0, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      parts.push(
        <code
          key={`code-${idx++}`}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-300 mx-0.5"
        >
          {code}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={`bold-${idx++}`} className="font-bold text-white">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      parts.push(
        <em key={`italic-${idx++}`} className="italic text-purple-200">
          {italicText}
        </em>
      );
    }

    remaining = remaining.substring(match.index + token.length);
  }

  return parts;
}

// Code Block with Copy
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-purple-500/30 bg-[#090b14] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0e1120] border-b border-purple-500/20 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-purple-400" />
          <span className="uppercase text-purple-300 font-semibold">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 hover:text-white transition text-[11px]"
          title="Copiar código"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono text-blue-200 leading-relaxed">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

// Markdown Table
const TableBlock: React.FC<{ lines: string[] }> = ({ lines }) => {
  if (lines.length < 2) return null;

  const parseRow = (line: string) => {
    return line
      .split('|')
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="overflow-x-auto my-3 rounded-lg border border-purple-500/25 bg-[#0b0d18]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-purple-950/40 border-b border-purple-500/30">
            {headers.map((h, i) => (
              <th key={i} className="p-2.5 font-bold text-purple-300">
                {formatInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-500/15">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-purple-900/10">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 text-slate-300">
                  {formatInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
