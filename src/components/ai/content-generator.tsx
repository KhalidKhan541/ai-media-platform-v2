import { useState, useCallback, useRef } from 'react';

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'toggle';
    placeholder?: string;
    options?: string[];
    defaultValue?: string | number | boolean;
    required?: boolean;
  }[];
}

interface GeneratedContent {
  id: string;
  templateId: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  isSaved?: boolean;
}

interface ContentGeneratorProps {
  templates: ContentTemplate[];
  onGenerate?: (templateId: string, params: Record<string, unknown>) => Promise<string>;
  onSave?: (content: GeneratedContent) => void;
  onCopy?: (content: string) => void;
  recentContent?: GeneratedContent[];
}

export default function ContentGenerator({
  templates,
  onGenerate,
  onSave,
  onCopy,
  recentContent = [],
}: ContentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'recent'>('generate');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleTemplateSelect = useCallback((template: ContentTemplate) => {
    setSelectedTemplate(template);
    const defaults: Record<string, unknown> = {};
    template.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });
    setFormValues(defaults);
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || !onGenerate) return;

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const content = await onGenerate(selectedTemplate.id, formValues);
      setGeneratedContent(content);
    } catch {
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, formValues, onGenerate]);

  const handleCopy = useCallback(async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      onCopy?.(text);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, [onCopy]);

  const handleSave = useCallback(() => {
    if (!generatedContent || !selectedTemplate) return;
    const content: GeneratedContent = {
      id: Date.now().toString(),
      templateId: selectedTemplate.id,
      content: generatedContent,
      metadata: formValues,
      createdAt: new Date().toISOString(),
    };
    onSave?.(content);
  }, [generatedContent, selectedTemplate, formValues, onSave]);

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Content Generator</h3>
            <p className="text-xs text-zinc-500">Generate optimized content with AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'generate' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'recent' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Recent ({recentContent.length})
          </button>
        </div>
      </div>

      {activeTab === 'generate' ? (
        <div className="p-6">
          {!selectedTemplate ? (
            <div className="space-y-6">
              {/* Template selector */}
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-3">Choose a template</p>
                {categories.map((category) => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {templates
                        .filter((t) => t.category === category)
                        .map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="flex items-start gap-3 p-3 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-left transition-all group"
                          >
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-violet-400 transition-colors">
                                {template.name}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back button + selected template */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setFormValues({});
                    setGeneratedContent('');
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedTemplate.name}</p>
                    <p className="text-xs text-zinc-500">{selectedTemplate.description}</p>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={(formValues[field.id] as number) || ''}
                        onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    )}
                    {field.type === 'toggle' && (
                      <button
                        onClick={() => handleFieldChange(field.id, !formValues[field.id])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formValues[field.id] ? 'bg-violet-600' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            formValues[field.id] ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate Content
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generated output */}
          {generatedContent && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Generated Content</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generatedContent)}
                    className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  ref={contentRef}
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-zinc-600">
                  {generatedContent.split(/\s+/).length} words
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Recent content tab */
        <div className="p-6">
          {recentContent.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-zinc-500">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No recent content yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContent.map((item) => {
                const template = templates.find((t) => t.id === item.templateId);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{template?.icon}</span>
                        <span className="text-xs font-medium text-zinc-400">{template?.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className="px-3 py-1 text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-600 transition-colors"
                      >
                        {copiedId === item.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedContent(item.content);
                          setActiveTab('generate');
                          const tmpl = templates.find((t) => t.id === item.templateId);
                          if (tmpl) {
                            setSelectedTemplate(tmpl);
                            setFormValues(item.metadata);
                          }
                        }}
                        className="px-3 py-1 text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-600 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
