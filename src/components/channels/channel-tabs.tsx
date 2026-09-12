import { useState, useCallback, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface ChannelTabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  sticky?: boolean;
}

export default function ChannelTabs({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  sticky = true,
}: ChannelTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  const [isScrolled, setIsScrolled] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      setInternalActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  // Update indicator position
  useEffect(() => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const activeButton = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeButton) {
      const { offsetLeft, offsetWidth } = activeButton;
      indicatorRef.current.style.left = `${offsetLeft}px`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [activeTab]);

  // Scroll active tab into view
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeButton = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div
        ref={tabsRef}
        className={`relative flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-zinc-800 transition-all duration-300 ${
          sticky ? `sticky top-0 z-30 bg-zinc-950 ${isScrolled ? 'shadow-lg shadow-black/20' : ''}` : ''
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}K` : tab.count}
              </span>
            )}
          </button>
        ))}

        {/* Animated indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-out"
        />
      </div>

      {/* Tab content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

// Tab panel component
interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ tabId, activeTab, children }: TabPanelProps) {
  if (tabId !== activeTab) return null;
  return <div className="w-full animate-in fade-in duration-200">{children}</div>;
}
