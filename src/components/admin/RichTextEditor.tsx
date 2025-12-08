import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Code, Quote, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('write');

  const insertMarkdown = (prefix: string, suffix: string = prefix, placeholder: string = 'text') => {
    const textarea = document.querySelector<HTMLTextAreaElement>('#content-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      prefix + selectedText + suffix + 
      value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), title: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), title: 'Italic' },
    { icon: Heading2, action: () => insertMarkdown('\n## ', '\n', 'Heading'), title: 'Heading 2' },
    { icon: Heading3, action: () => insertMarkdown('\n### ', '\n', 'Subheading'), title: 'Heading 3' },
    { icon: List, action: () => insertMarkdown('\n- ', '\n', 'List item'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('\n1. ', '\n', 'List item'), title: 'Numbered List' },
    { icon: Quote, action: () => insertMarkdown('\n> ', '\n', 'Quote'), title: 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'code'), title: 'Code' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'link text'), title: 'Link' },
  ];

  // Simple markdown to HTML preview
  const renderPreview = (markdown: string) => {
    return markdown
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-heading text-foreground mt-6 mb-3">$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-heading text-foreground mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 text-muted-foreground">• $1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-2 border-gold pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold hover:underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="text-muted-foreground mt-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2">
          <div className="flex items-center gap-1 py-1">
            {toolbarButtons.map((btn, i) => (
              <Button
                key={i}
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={btn.action}
                title={btn.title}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <TabsList className="bg-transparent">
            <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            id="content-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y"
            placeholder="Write your lesson content here...&#10;&#10;Use markdown for formatting:&#10;## Heading&#10;### Subheading&#10;**bold** *italic*&#10;- bullet point&#10;1. numbered list&#10;> quote&#10;`code`"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className="min-h-[300px] p-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: value 
                ? `<p class="text-muted-foreground">${renderPreview(value)}</p>` 
                : '<p class="text-muted-foreground/50 italic">Nothing to preview yet...</p>' 
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
