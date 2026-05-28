import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown-Renderer für Listing-Beschreibungen.
 * Custom-Komponenten geben dem Output eine konsistente, ansprechende Optik:
 * - Headers werden zu kleinen Section-Labels (uppercase, kerning)
 * - Bullets bekommen sauberen Indent + farbige Marker
 * - Bold wird farblich abgesetzt
 * - Links indigo + Hover-Underline
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-stone-700 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-display text-xl font-semibold text-stone-950 mt-6 mb-2">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mt-6 mb-2">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mt-5 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-stone-950">{children}</strong>
          ),
          em: ({ children }) => <em className="text-stone-600">{children}</em>,
          ul: ({ children }) => (
            <ul className="space-y-1.5 list-none pl-0 my-3">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-indigo-600">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-700 underline-offset-4 hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-stone-200" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-200 pl-4 italic text-stone-600">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm font-mono text-stone-800">
              {children}
            </code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Zieht den ersten sinnvollen Absatz für die Card-Preview heraus,
 * mit allen Markdown-Markern entfernt.
 */
export function stripMarkdown(md: string, maxChars = 200): string {
  // Entferne Markdown-Marker
  let text = md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > maxChars) {
    text = text.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
  }
  return text;
}
