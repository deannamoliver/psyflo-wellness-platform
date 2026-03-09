"use client";

/**
 * SECURITY: Validate GIF URLs to prevent XSS attacks
 * 
 * Why this is critical:
 * - URLs from markdown are rendered directly in <img> tags
 * - Malicious URLs could execute JavaScript (javascript:, data:)
 * - Could lead to session hijacking, data theft, or XSS
 * 
 * Attack examples:
 * - javascript:alert('XSS')
 * - data:text/html,<script>alert('XSS')</script>
 * - URLs from compromised Giphy CDN
 */
function isValidGifUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // SECURITY: Only allow HTTPS (no HTTP, javascript:, data:, etc.)
    if (parsedUrl.protocol !== 'https:') {
      console.warn('[SECURITY] Rejected non-HTTPS GIF URL:', parsedUrl.protocol);
      return false;
    }
    
    // SECURITY: Whitelist trusted Giphy CDN domains only
    const allowedDomains = [
      'media.giphy.com',
      'media0.giphy.com',
      'media1.giphy.com',
      'media2.giphy.com',
      'media3.giphy.com',
      'media4.giphy.com',
      'i.giphy.com',
    ];
    
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = allowedDomains.includes(hostname);
    
    if (!isAllowed) {
      console.warn('[SECURITY] Rejected GIF URL from untrusted domain:', hostname);
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid URL format
    console.warn('[SECURITY] Invalid GIF URL format:', url);
    return false;
  }
}

type MessageContentProps = {
  content: string;
};

export function MessageContent({ content }: MessageContentProps) {
  const gifRegex = /!\[gif\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: (string | { type: "gif"; url: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = gifRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // SECURITY: Validate URL before adding to parts
      if (isValidGifUrl(match[1])) {
        parts.push({ type: "gif", url: match[1] });
      } else {
        // Replace invalid GIF with warning text
        parts.push("[GIF removed for security]");
      }
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  if (parts.length === 0) {
    return <>{content}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        }
        return (
          <div key={index} className="mt-2">
            <img
              src={part.url}
              alt="GIF"
              className="max-w-full rounded-lg"
              style={{ maxHeight: "200px", width: "auto" }}
            />
          </div>
        );
      })}
    </>
  );
}
