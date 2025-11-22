import React, { useState } from 'react';
import { ExternalLink, Award, DollarSign, ShieldCheck, Printer, Copy, Check, Search, ArrowRightCircle, ChevronRight, Zap } from 'lucide-react';
import { SearchResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface ResultCardProps {
  result: SearchResult;
  onPartClick: (partName: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onPartClick }) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `Part Scout: ${result.partQuery} for ${result.car.year} ${result.car.make} ${result.car.model}\n\n${result.aiResponseText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHostname = (uri: string) => {
    try {
      const urlStr = uri.startsWith('http') ? uri : `https://${uri}`;
      return new URL(urlStr).hostname.replace('www.', '');
    } catch (e) {
      return "External Link";
    }
  };

  // Robust processor to ensure buttons render even if AI outputs plain text or broken markdown
  const processMarkdown = (text: string) => {
    if (!text) return "";

    let processed = text;

    // 1. SAFETY NET: Fix plain text "Action: Part Name" into clickable links 
    // We immediately encode the search query to ensure valid Markdown (no spaces in URLs allowed)
    processed = processed.replace(
      /^[\s\*]*\**Action(?: Link)?\**:\s*(?!\[)(.+)$/gm, 
      (match, partName) => {
        const rawName = partName.trim().replace(/\.$/, '');
        // Clean up redundant text if AI says "Scout Options: Scout Options for..."
        const cleanName = rawName.replace(/^(Scout Options|Drill Down)(?:\s+(?:for|:))?\s*/i, '');
        // Encode immediately to prevent broken markdown
        const encoded = encodeURIComponent(cleanName);
        return `* **Action**: [🚀 Drill Down: ${cleanName}](search:${encoded})`;
      }
    );

    // 2. Fix Broken Markdown Links (Space between ] and ()
    // AI sometimes outputs: [Link Text] (https://url) -> This breaks markdown.
    // We replace it with: [Link Text](https://url)
    processed = processed.replace(/\[([^\]]+)\]\s+\((https?:\/\/[^\)]+)\)/g, '[$1]($2)');

    // 3. Fix Raw URLs in "Link:" lines that the AI forgot to format as Markdown
    // Pattern: * Link: https://some-url.com... -> * Link: [Open Search Results](https://some-url.com...)
    processed = processed.replace(
        /^[\s\*]*\**Link\**:\s*(https?:\/\/[^\s\)]+)/gm,
        '* **Link**: [Open Search Results]($1)'
    );

    // 4. Fix existing markdown links that might have spaces in the URL part (AI generated)
    // [Text](search:Part Name) -> [Text](search:Part%20Name)
    processed = processed.replace(
      /\[([^\]]+)\]\(search:([^\)]+)\)/g, 
      (match, linkText, searchQuery) => {
        // If it looks encoded already, skip
        if (searchQuery.includes('%20') || !searchQuery.includes(' ')) return match;
        const encodedQuery = searchQuery.trim().replace(/\s+/g, '%20');
        return `[${linkText}](search:${encodedQuery})`;
      }
    );

    return processed;
  };

  const groundingChunks = result.groundingChunks || [];

  return (
    <div className="bg-racing-800 border border-racing-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in print:border-0 print:shadow-none print:bg-white print:text-black">
      {/* Header */}
      <div className="bg-racing-900/50 p-4 border-b border-racing-700 flex justify-between items-center flex-wrap gap-2 print:bg-gray-100 print:border-gray-300">
        <div className="min-w-0">
          <h3 className="text-lg font-display text-white print:text-black truncate">Results: {result.partQuery}</h3>
          <p className="text-sm text-racing-highlight print:text-gray-700 truncate">
            {result.car.year} {result.car.make} {result.car.model} ({result.car.engine})
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
           <div className="text-xs text-slate-500 font-mono mr-2 print:text-gray-500 hidden sm:block">
            {new Date(result.timestamp).toLocaleDateString()}
           </div>
           
           <button 
             onClick={handleCopy}
             className="p-2 hover:bg-racing-700 rounded-lg text-slate-400 hover:text-white transition-colors print:hidden"
             title="Copy to Clipboard"
           >
             {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
           </button>
           
           <button 
             onClick={handlePrint}
             className="p-2 hover:bg-racing-700 rounded-lg text-slate-400 hover:text-white transition-colors print:hidden"
             title="Print Result"
           >
             <Printer className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row print:block">
        {/* Main Content - AI Analysis */}
        <div className="flex-1 p-4 md:p-6 text-slate-300 max-w-none min-w-0 overflow-x-hidden print:text-black">
           <ReactMarkdown
             urlTransform={(url) => url} // Trust our sanitized URLs, allow 'search:' schema
             components={{
               h1: ({node, ...props}) => <h1 className="text-2xl font-display mb-4 text-white print:text-black break-words" {...props} />,
               h2: ({node, ...props}) => <h2 className="text-xl font-display mt-6 mb-3 text-white border-b border-racing-700 pb-2 print:text-black print:border-gray-300 break-words" {...props} />,
               h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-racing-highlight print:text-black break-words" {...props} />,
               p: ({node, ...props}) => <p className="mb-4 leading-relaxed break-words" {...props} />,
               ul: ({node, ...props}) => <ul className="space-y-3 my-4 list-none pl-0" {...props} />,
               // Standard list item styling
               li: ({node, ...props}) => (
                 <li className="relative pl-4 border-l-2 border-racing-700 hover:border-racing-highlight transition-colors pl-3 py-2" {...props} />
               ),
               strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
               a: ({node, href, children, ...props}) => {
                 if (!href) return <span className="text-slate-400">{children}</span>;
                 
                 const isSearch = href.startsWith('search:');
                 
                 if (isSearch) {
                   // Decode the query back to spaces for the handler
                   const searchTerm = decodeURIComponent(href.replace('search:', ''));
                   return (
                     <button 
                       onClick={(e) => {
                         e.preventDefault();
                         onPartClick(searchTerm);
                       }}
                       className="group relative flex items-center gap-3 px-4 py-3 my-2 rounded-lg bg-gradient-to-r from-racing-highlight/10 to-racing-highlight/5 border border-racing-highlight/30 hover:border-racing-highlight hover:bg-racing-highlight/20 transition-all w-full sm:w-auto text-left shadow-lg shadow-racing-900/50"
                     >
                       <div className="p-2 bg-racing-highlight rounded-full shrink-0 shadow-inner text-racing-900">
                          <Zap className="w-4 h-4 fill-current" />
                       </div>
                       <div className="flex flex-col flex-1 min-w-0">
                         <span className="font-bold text-white group-hover:text-racing-highlight transition-colors truncate">{children}</span>
                         <span className="text-[10px] font-mono text-racing-highlight/70 uppercase tracking-wider">Tap to Drill Down</span>
                       </div>
                       <ChevronRight className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                     </button>
                   );
                 }
                 
                 // Fix malformed/relative URLs that AI might generate
                 let cleanHref = href;
                 if (!cleanHref.startsWith('http://') && !cleanHref.startsWith('https://') && !cleanHref.startsWith('mailto:')) {
                   cleanHref = `https://${cleanHref}`;
                 }

                 // External Link - Style clearly as a search/link
                 // Use a Search icon if it's a search query to indicate it's not a direct product page
                 const isSearchLink = cleanHref.includes('search') || cleanHref.includes('?q=') || cleanHref.includes('keyword=');
                 
                 return (
                    <a 
                        className="inline-flex items-center gap-1.5 text-racing-accent hover:text-white bg-racing-900/50 hover:bg-racing-accent px-2 py-1 rounded border border-racing-accent/30 hover:border-racing-accent transition-all font-medium text-sm my-1 break-all sm:break-normal" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        href={cleanHref} 
                        {...props}
                    >
                        {isSearchLink ? <Search className="w-3 h-3 shrink-0" /> : <ExternalLink className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{children}</span>
                    </a>
                 );
               }
             }}
           >
             {processMarkdown(result.aiResponseText)}
           </ReactMarkdown>
        </div>

        {/* Sidebar - Sources / Links */}
        <div className="lg:w-80 bg-racing-900/30 border-t lg:border-t-0 lg:border-l border-racing-700 p-4 print:w-full print:border-l-0 print:border-t print:bg-gray-50 print:mt-4 shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 print:text-black">
            <ExternalLink className="w-4 h-4" />
            Verified Sources
          </h4>
          
          <div className="space-y-3">
            {groundingChunks.length > 0 ? (
              groundingChunks.map((chunk, idx) => (
                chunk.web?.uri && (
                  <a
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group bg-racing-800 hover:bg-racing-700 border border-racing-700 rounded-lg p-3 transition-all hover:border-racing-highlight print:bg-white print:border-gray-300 print:text-black"
                  >
                    <div className="text-sm font-semibold text-racing-highlight group-hover:text-white truncate print:text-blue-700 print:group-hover:text-blue-700">
                      {chunk.web.title || "Source Link"}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-1 print:text-gray-600 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {getHostname(chunk.web.uri)}
                    </div>
                  </a>
                )
              ))
            ) : (
              <div className="text-sm text-slate-500 italic p-2 text-center print:text-black">
                No direct links returned. Check the text analysis for store names.
              </div>
            )}
          </div>

          {/* Helper Badges */}
          <div className="mt-8 space-y-2 print:hidden">
             <div className="flex items-center gap-3 p-2 rounded bg-racing-800/50 border border-racing-700/50">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Prices are estimates</span>
             </div>
             <div className="flex items-center gap-3 p-2 rounded bg-racing-800/50 border border-racing-700/50">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Links open Search Results</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};