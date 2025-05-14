import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ChatMessage = ({ message, isUserMessage }) => {
    const content = typeof message === 'string' ? message : message.content;

    // Преобразуем обозначения LaTeX
    const processedContent = content
        .replace(/\\neq/g, '≠') // Обрабатываем символ "не равно" для отображения
        .replace(/\\\(/g, '$') // Заменяем \( на $
        .replace(/\\\)/g, '$') // Заменяем \) на $
        .replace(/\\\[/g, '$$') // Заменяем \[ на $$
        .replace(/\\\]/g, '$$') // Заменяем \] на $$
        .replace(/\\n/g, '\n');

    return (
        <div
            className={`p-4 rounded-2xl border border-[var(--color-border)] mt-8 ${
                isUserMessage
                    ? 'bg-[var(--color-surface)] text-right'
                    : 'bg-[var(--color-background)] text-left'
            } text-[var(--color-text)]`}
        >
            <style>
                {`
                    .markdown-content {
                        max-width: none;
                    }
                    .markdown-content h1, 
                    .markdown-content h2, 
                    .markdown-content h3, 
                    .markdown-content h4, 
                    .markdown-content h5, 
                    .markdown-content h6 {
                        color: var(--color-primary);
                        margin: 1em 0 0.5em;
                        font-weight: bold;
                    }
                    .markdown-content h1 { font-size: 2em; }
                    .markdown-content h2 { font-size: 1.5em; }
                    .markdown-content h3 { font-size: 1.25em; }
                    .markdown-content h4 { font-size: 1.1em; }
                    .markdown-content h5 { font-size: 1em; }
                    .markdown-content h6 { font-size: 0.9em; }
                    
                    .markdown-content p {
                        margin: 1em 0;
                        line-height: 1.6;
                    }
                    
                    .markdown-content p:first-child {
                        margin-top: 0;
                    }
                    
                    .markdown-content p:last-child {
                        margin-bottom: 0;
                    }
                    
                    .markdown-content strong {
                        font-weight: bold;
                        color: var(--color-primary);
                    }
                    
                    .markdown-content em {
                        font-style: italic;
                    }
                    
                    .markdown-content ul, 
                    .markdown-content ol {
                        margin: 1em 0;
                        padding-left: 2em;
                    }
                    
                    .markdown-content li {
                        margin: 0.5em 0;
                    }
                    
                    .markdown-content blockquote {
                        border-left: 4px solid var(--color-border);
                        margin: 1em 0;
                        padding: 0.5em 1em;
                        font-style: italic;
                        background: var(--color-surface);
                        border-radius: 0 0.5em 0.5em 0;
                    }
                    
                    .markdown-content pre {
                        background: var(--color-surface);
                        padding: 1em;
                        border-radius: 0.5em;
                        overflow-x: auto;
                        margin: 1em 0;
                    }
                    
                    .markdown-content code {
                        font-family: monospace;
                        background: var(--color-background);
                        padding: 0.2em 0.4em;
                        border-radius: 0.3em;
                        color: var(--color-primary);
                    }
                    
                    .markdown-content pre code {
                        background: transparent;
                        padding: 0;
                        color: var(--color-primary);
                    }
                    
                    .markdown-content table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }
                    
                    .markdown-content th,
                    .markdown-content td {
                        border: 1px solid var(--color-border);
                        padding: 0.5em;
                        text-align: left;
                    }
                    
                    .markdown-content th {
                        background: var(--color-surface);
                    }
                    
                    .markdown-content hr {
                        border: none;
                        border-top: 2px solid var(--color-border);
                        margin: 2em 0;
                    }
                    
                    .markdown-content a {
                        color: var(--color-primary);
                        text-decoration: none;
                        transition: color 0.2s;
                    }
                    
                    .markdown-content a:hover {
                        text-decoration: underline;
                        color: var(--color-primary-hover);
                        cursor: pointer;
                    }
                    
                    .katex-display {
                        margin: 1em 0;
                        overflow-x: auto;
                        overflow-y: hidden;
                        padding: 0.5em 0;
                        text-align: center;
                    }
                    
                    .katex {
                        font-size: 1.1em;
                        color: var(--color-primary);
                    }
                    
                    .katex-inline {
                        display: inline-block;
                        margin: 0 0.2em;
                    }
                    
                    .katex-html {
                        overflow-x: auto;
                        overflow-y: hidden;
                        text-indent: 0;
                        text-align: left;
                    }
                `}
            </style>
            <div className="markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeHighlight, rehypeKatex]}
                    components={{
                        pre: ({ node, ...props }) => <pre {...props} />,
                        code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                        }) => {
                            return !inline ? (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            ) : (
                                <code {...props}>{children}</code>
                            );
                        },
                    }}
                >
                    {processedContent}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default ChatMessage;
