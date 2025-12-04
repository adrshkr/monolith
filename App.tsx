import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Palette, 
  Layers, 
  LayoutGrid, 
  Settings, 
  MessageSquare, 
  ThumbsUp, 
  HelpCircle, 
  Bell, 
  Search, 
  SlidersHorizontal, 
  FolderOpen,
  FilePlus,
  X,
  Hexagon,
  Triangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Upload,
  Download,
  Trash2,
  FileText,
  Youtube,
  Twitter,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  ExternalLink,
  Plus,
  HardDrive,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Bold,
  PenLine
} from 'lucide-react';
import { MindAsset, AssetType } from './types';

// --- Utility Functions ---

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const classifyInput = (input: string): { type: AssetType, content: string, meta?: any } => {
  const trimmed = input.trim();
  
  // YouTube
  const ytId = getYouTubeId(trimmed);
  if (ytId) {
    return { 
      type: 'VIDEO', 
      content: trimmed, 
      meta: { thumbnail: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` } 
    };
  }

  // Twitter/X
  if (trimmed.match(/(twitter\.com|x\.com)\/\w+\/status\/\d+/)) {
     const username = trimmed.split('.com/')[1].split('/')[0];
     return { 
       type: 'TWEET', 
       content: trimmed,
       meta: { author: `@${username}` }
     };
  }

  // Image URL
  if (trimmed.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i)) {
    return { type: 'IMAGE', content: trimmed };
  }

  // Generic URL
  if (trimmed.match(/^(http|https):\/\/[^ "]+$/)) {
    try {
        const url = new URL(trimmed);
        return { 
            type: 'LINK', 
            content: trimmed,
            meta: { domain: url.hostname }
        };
    } catch {
        // Fallback to note if invalid URL
    }
  }

  // Default to Note
  return { type: 'NOTE', content: trimmed };
};

// --- Sub-components ---

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-mj-sidebar flex flex-col border-r border-white/5 flex-shrink-0 hidden md:flex">
      <div className="p-5 flex items-center gap-3">
        <div className="bg-white text-black p-1.5 rounded-sm">
            <Triangle size={20} fill="currentColor" className="rotate-180" />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white uppercase">
          Monolith
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        <div className="space-y-1">
          <NavItem icon={Compass} label="My Mind" isActive />
          <NavItem icon={Palette} label="Inspiration" />
          <NavItem icon={Layers} label="Read Later" />
          <NavItem icon={LayoutGrid} label="Archives" />
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-mj-muted uppercase tracking-widest mb-3 px-3 opacity-60">Smart Filters</h3>
          <div className="space-y-1">
            <NavItem icon={ImageIcon} label="Visuals" />
            <NavItem icon={LinkIcon} label="Links" />
            <NavItem icon={FileText} label="Notes" />
            <NavItem icon={Youtube} label="Media" />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ElementType; label: string; isActive?: boolean; isBeta?: boolean }> = ({ 
  icon: Icon, 
  label, 
  isActive, 
  isBeta 
}) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 group ${
    isActive 
      ? 'bg-mj-hover text-white' 
      : 'text-mj-muted hover:text-white hover:bg-mj-hover'
  }`}>
    <Icon size={18} className={isActive ? 'text-mj-accent' : 'text-current'} />
    <span className="flex-1 text-left">{label}</span>
    {isBeta && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 uppercase tracking-wide border border-orange-500/20">Beta</span>}
  </button>
);

// --- Asset Card Components ---

const AssetCardRenderer: React.FC<{ asset: MindAsset }> = ({ asset }) => {
  switch (asset.type) {
    case 'NOTE':
      return (
        <div className="w-full h-full p-6 flex flex-col justify-between bg-[#fdfdfd] text-black">
           <p className={`font-serif text-lg leading-relaxed whitespace-pre-wrap line-clamp-[8] ${
               asset.metadata?.textAlign === 'center' ? 'text-center' : 
               asset.metadata?.textAlign === 'right' ? 'text-right' : 'text-left'
           } ${
               asset.metadata?.fontSize === 'sm' ? 'text-sm' :
               asset.metadata?.fontSize === 'lg' ? 'text-xl' : 'text-lg'
           } ${
               asset.metadata?.fontFamily === 'sans' ? 'font-sans' : 'font-serif'
           }`}>
             {asset.content}
           </p>
           <div className="mt-4 flex items-center gap-2 opacity-40">
              <FileText size={12} />
              <span className="text-[10px] uppercase tracking-widest">Note</span>
           </div>
        </div>
      );
    
    case 'LINK':
      return (
        <div className="w-full h-full bg-white flex flex-col">
            <div className="flex-1 p-6 flex items-center justify-center bg-neutral-100">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <LinkIcon size={24} className="text-black" />
               </div>
            </div>
            <div className="p-4 border-t border-neutral-100 bg-white">
                <p className="text-[10px] font-bold text-mj-accent uppercase tracking-widest mb-1 truncate">
                    {asset.metadata?.domain || 'Web Resource'}
                </p>
                <h4 className="text-sm font-bold text-black leading-tight line-clamp-2 mb-2">
                    {asset.title || asset.content}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{asset.content}</p>
            </div>
        </div>
      );

    case 'TWEET':
      return (
        <div className="w-full h-full p-6 flex flex-col bg-white text-black relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[#1DA1F2]">
                <Twitter size={80} fill="currentColor" />
            </div>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200" />
                <div>
                    <p className="text-xs font-bold">{asset.metadata?.author || 'Twitter User'}</p>
                    <p className="text-[10px] text-neutral-400">@user</p>
                </div>
                <Twitter size={14} className="text-[#1DA1F2] ml-auto" fill="currentColor" />
            </div>
            <p className="text-sm leading-relaxed z-10">
                This tweet is bookmarked from the timeline. Content preview is simulated for this demo wrapper.
            </p>
             <div className="mt-auto pt-4 flex gap-4 text-neutral-400">
                <div className="h-1 w-full bg-neutral-100 rounded-full" />
             </div>
        </div>
      );

    case 'VIDEO':
      return (
        <div className="relative w-full h-full bg-black group-hover:bg-neutral-900 transition-colors">
             <img 
                src={asset.thumbnail} 
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                     <Play size={20} className="text-white fill-white ml-1" />
                 </div>
             </div>
             <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                 <div className="flex items-center gap-2">
                     <Youtube size={12} className="text-red-500" fill="currentColor" />
                     <p className="text-[10px] text-white/90 truncate font-medium">YouTube Video</p>
                 </div>
             </div>
        </div>
      );

    case 'PDF':
        return (
            <div className="w-full h-full bg-[#f3f3f3] flex flex-col items-center justify-center p-6 text-center">
                <FileText size={48} className="text-neutral-400 mb-4" />
                <p className="text-xs font-bold text-neutral-600 break-all line-clamp-2">{asset.title}</p>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">PDF Document</p>
            </div>
        );

    case 'IMAGE':
    default:
      return (
        <>
            <img 
                src={asset.content} 
                alt={asset.title}
                loading="lazy"
                className="w-full h-full object-cover"
            />
        </>
      );
  }
};


interface AssetModalProps {
  asset: MindAsset | null;
  focusOnMount?: boolean;
  onClose: () => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MindAsset>) => void;
  onDownload: (e: React.MouseEvent, asset: MindAsset) => void;
}

const AssetModal: React.FC<AssetModalProps> = ({ asset, focusOnMount, onClose, onAddTag, onRemoveTag, onDelete, onUpdate, onDownload }) => {
  const [tagInput, setTagInput] = useState('');
  
  // Note specific state
  const [noteContent, setNoteContent] = useState('');
  
  // Refs
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (asset) setNoteContent(asset.content);
  }, [asset]);

  // Handle auto-focus for the note input
  useEffect(() => {
    if (focusOnMount && noteInputRef.current) {
        // Increased timeout to 400ms to ensure the 300ms transition has completed
        // This prevents the browser from ignoring focus if the element is not fully visible/interactive
        const timer = setTimeout(() => {
            noteInputRef.current?.focus();
        }, 400);
        return () => clearTimeout(timer);
    }
  }, [focusOnMount, asset?.id]); // Added asset.id to ensure it triggers on asset switch

  if (!asset) return null;

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      onAddTag(asset.id, tagInput.trim());
      setTagInput('');
    }
  };

  const updateMetadata = (key: string, value: any) => {
      onUpdate(asset.id, {
          metadata: { ...asset.metadata, [key]: value }
      });
  };

  // Dynamic width class based on asset type
  // Use 'w-fit' for media to hug the content closely
  const containerClass = (asset.type === 'IMAGE' || asset.type === 'VIDEO')
      ? 'w-fit max-w-[95vw] min-w-[320px] md:min-w-[600px]' 
      : 'w-full max-w-5xl';

  const renderContent = () => {
    switch (asset.type) {
        case 'VIDEO':
            const ytId = getYouTubeId(asset.content);
            return (
                <div className="w-full h-full flex items-center justify-center bg-black/10 min-w-[320px]">
                     {ytId ? (
                         <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="aspect-video max-h-[85vh] shadow-2xl rounded-sm"
                         />
                     ) : (
                         <p>Invalid Video URL</p>
                     )}
                </div>
            );
        case 'LINK':
        case 'TWEET':
             return (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 p-8 text-center min-w-[320px]">
                     <ExternalLink size={64} className="text-white/50 mb-6" />
                     <h2 className="text-2xl font-bold text-white mb-2 max-w-2xl drop-shadow-md">{asset.title || 'External Resource'}</h2>
                     <a href={asset.content} target="_blank" rel="noreferrer" className="text-mj-accent hover:underline break-all mb-8">
                         {asset.content}
                     </a>
                     <a href={asset.content} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-200 transition-colors shadow-lg">
                         Open Original
                     </a>
                 </div>
             );
        case 'NOTE':
             return (
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                     <div className="w-full max-w-2xl bg-[#fdfdfd] text-black shadow-2xl h-[70vh] flex flex-col rounded-sm overflow-hidden">
                         {/* Toolbar */}
                         <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-white text-neutral-600">
                            <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2">
                                <button 
                                    onClick={() => updateMetadata('fontSize', 'sm')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${asset.metadata?.fontSize === 'sm' ? 'text-black bg-neutral-100' : ''}`} title="Small"
                                >
                                    <Type size={12} />
                                </button>
                                <button 
                                    onClick={() => updateMetadata('fontSize', 'md')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${(!asset.metadata?.fontSize || asset.metadata?.fontSize === 'md') ? 'text-black bg-neutral-100' : ''}`} title="Medium"
                                >
                                    <Type size={16} />
                                </button>
                                <button 
                                    onClick={() => updateMetadata('fontSize', 'lg')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${asset.metadata?.fontSize === 'lg' ? 'text-black bg-neutral-100' : ''}`} title="Large"
                                >
                                    <Type size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 mr-2">
                                <button 
                                    onClick={() => updateMetadata('textAlign', 'left')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${(!asset.metadata?.textAlign || asset.metadata?.textAlign === 'left') ? 'text-black bg-neutral-100' : ''}`}
                                >
                                    <AlignLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => updateMetadata('textAlign', 'center')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${asset.metadata?.textAlign === 'center' ? 'text-black bg-neutral-100' : ''}`}
                                >
                                    <AlignCenter size={16} />
                                </button>
                                <button 
                                    onClick={() => updateMetadata('textAlign', 'right')}
                                    className={`p-1.5 rounded-sm hover:bg-neutral-100 ${asset.metadata?.textAlign === 'right' ? 'text-black bg-neutral-100' : ''}`}
                                >
                                    <AlignRight size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => updateMetadata('fontFamily', asset.metadata?.fontFamily === 'sans' ? 'serif' : 'sans')}
                                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 rounded-sm hover:bg-neutral-100"
                                >
                                    {asset.metadata?.fontFamily === 'sans' ? 'Sans' : 'Serif'}
                                </button>
                            </div>
                            
                            <div className="ml-auto text-[10px] uppercase text-neutral-400 font-bold tracking-widest pr-2">
                                Editable
                            </div>
                         </div>
                         
                         {/* Editor */}
                         <textarea
                            value={noteContent}
                            onChange={(e) => {
                                setNoteContent(e.target.value);
                                onUpdate(asset.id, { content: e.target.value });
                            }}
                            className={`flex-1 w-full p-8 md:p-12 resize-none focus:outline-none bg-transparent ${
                                asset.metadata?.textAlign === 'center' ? 'text-center' : 
                                asset.metadata?.textAlign === 'right' ? 'text-right' : 'text-left'
                            } ${
                                asset.metadata?.fontSize === 'sm' ? 'text-sm' :
                                asset.metadata?.fontSize === 'lg' ? 'text-2xl' : 'text-lg'
                            } ${
                                asset.metadata?.fontFamily === 'sans' ? 'font-sans' : 'font-serif'
                            }`}
                            placeholder="Start writing..."
                         />
                     </div>
                </div>
             );
        case 'IMAGE':
        default:
            return (
                <div className="w-auto h-full flex items-center justify-center p-0 md:p-4 min-w-[200px]">
                    <img 
                        src={asset.content} 
                        alt={asset.title} 
                        className="w-auto h-full max-h-[85vh] object-contain shadow-2xl drop-shadow-2xl rounded-sm" 
                    />
                </div>
            );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      
      {/* Main Glass Container */}
      <div 
        className={`relative h-[85vh] flex flex-col md:flex-row bg-black/40 backdrop-blur-3xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 transition-all duration-300 ${containerClass}`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Content Area */}
        <div className="relative overflow-hidden bg-transparent flex justify-center">
            {renderContent()}

            {/* Bottom Right Floating Menu - Moved from top-right to avoid blocking sidebar text */}
            <div className="absolute bottom-4 right-4 z-50 flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 hover:bg-black/60 group shadow-lg">
                <button 
                    onClick={(e) => onDownload(e, asset)} 
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                    title="Download"
                >
                    <Download size={14} />
                </button>

                <div className="w-px h-3 bg-white/10 mx-1" />

                <div className="max-w-0 overflow-hidden group-hover:max-w-[50px] transition-all duration-500 ease-in-out flex items-center">
                     <button 
                        onClick={() => { onDelete(asset.id); onClose(); }} 
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors mr-1" 
                        title="Delete Asset"
                     >
                        <Trash2 size={14} />
                     </button>
                     <div className="w-px h-3 bg-white/10 mx-1" />
                </div>

                <button 
                    onClick={onClose} 
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                    title="Close"
                >
                    <X size={14} />
                </button>
            </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-l border-white/5 flex flex-col bg-black/20 backdrop-blur-md flex-shrink-0">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-widest">
                        {asset.type}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono ml-auto">
                        {new Date(asset.addedAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="text-white font-bold tracking-wide text-sm leading-tight break-words">
                    {asset.title || asset.content.slice(0, 50)}...
                </h3>
            </div>

            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 flex items-center gap-2">
                        Notes <span className="text-neutral-600">({asset.tags.length})</span>
                    </h4>
                    
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Plus size={14} className="text-neutral-500" />
                        </div>
                        <input 
                            ref={noteInputRef}
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Add a note..."
                            className="w-full bg-white/5 border border-white/5 rounded-sm py-3 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-mj-accent focus:bg-white/10 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        {asset.tags.map((tag, idx) => (
                            <div key={`${tag}-${idx}`} className="group flex items-start gap-2 text-xs text-neutral-300 p-2.5 hover:bg-white/5 rounded-sm transition-colors cursor-default border border-transparent hover:border-white/5">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-mj-accent shrink-0 transition-colors" />
                                <span className="flex-1 break-words leading-relaxed">{tag}</span>
                                <button onClick={() => onRemoveTag(asset.id, tag)} className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {asset.tags.length === 0 && (
                            <div className="text-center py-8 text-neutral-600 italic text-xs">
                                No notes yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Sort Types ---
type SortKey = 'date' | 'name' | 'size';
type SortDirection = 'asc' | 'desc';

// --- Ingestion State Interface ---
interface IngestionState {
    status: 'idle' | 'scanning' | 'processing';
    processed: number;
    total: number;
    currentFile: string;
}

// --- Main App Logic ---

export default function App() {
  const [assets, setAssets] = useState<MindAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MindAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AssetType | 'ALL'>('ALL');
  const [focusNoteOnOpen, setFocusNoteOnOpen] = useState(false);
  
  // Note Creation State
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  // Ingestion State
  const [ingestion, setIngestion] = useState<IngestionState>({
      status: 'idle',
      processed: 0,
      total: 0,
      currentFile: ''
  });

  // Sorting State
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  
  // Separate refs for inputs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus effect for note creation
  useEffect(() => {
    if (isCreatingNote && noteInputRef.current) {
        noteInputRef.current.focus();
    }
  }, [isCreatingNote]);

  const saveNote = () => {
    if (newNoteContent.trim()) {
        setAssets(prev => [{
            id: `note-${Date.now()}`,
            type: 'NOTE',
            content: newNoteContent,
            aspectRatio: 250,
            tags: [],
            addedAt: Date.now(),
            metadata: { fontFamily: 'serif', fontSize: 'md', textAlign: 'left' }
        }, ...prev]);
        setNewNoteContent('');
    }
    setIsCreatingNote(false);
  };

  const updateAsset = (id: string, updates: Partial<MindAsset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (selectedAsset?.id === id) {
        setSelectedAsset(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Global Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        // Don't paste if we are editing a note
        if (isCreatingNote || selectedAsset?.type === 'NOTE') return;

        const text = e.clipboardData?.getData('text');
        if (text) {
            const classified = classifyInput(text);
            const newAsset: MindAsset = {
                id: `paste-${Date.now()}`,
                type: classified.type,
                content: classified.content,
                title: classified.type === 'NOTE' ? 'Quick Note' : text,
                thumbnail: classified.meta?.thumbnail,
                metadata: classified.meta,
                aspectRatio: Math.random() > 0.5 ? 300 : 400,
                tags: [],
                addedAt: Date.now()
            };
            setAssets(prev => [newAsset, ...prev]);
        }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isCreatingNote, selectedAsset]);

  // Optimized file processor with chunking for all asset types
  const processFiles = async (fileList: File[]) => {
     if (fileList.length === 0) {
        setIngestion({ status: 'idle', processed: 0, total: 0, currentFile: '' });
        return;
     }

     setIngestion({
        status: 'processing',
        processed: 0,
        total: fileList.length,
        currentFile: 'Initializing...'
    });

    const CHUNK_SIZE = 5; 
    let processedCount = 0;
    const newAssets: MindAsset[] = [];

    for (let i = 0; i < fileList.length; i += CHUNK_SIZE) {
        const chunk = fileList.slice(i, i + CHUNK_SIZE);
        
        // Process chunk asynchronously
        const chunkResults = await Promise.all(chunk.map(async (file, idx) => {
            let type: AssetType = 'NOTE'; // Fallback
            let content = '';
            
            if (file.type.startsWith('image/')) {
                type = 'IMAGE';
                content = URL.createObjectURL(file);
            } else if (file.type === 'application/pdf') {
                type = 'PDF';
                content = URL.createObjectURL(file);
            } else if (file.type.startsWith('text/')) {
                type = 'NOTE';
                content = await file.text();
            }

            return {
                id: `${Date.now()}-${processedCount + idx}-${file.name}`,
                type,
                content,
                title: file.name,
                metadata: { mimeType: file.type, fileSize: file.size },
                aspectRatio: [300, 400, 250][(file.name.length + file.size) % 3],
                tags: [],
                addedAt: Date.now()
            };
        }));

        newAssets.push(...chunkResults);
        processedCount += chunk.length;

        setIngestion(prev => ({
            ...prev,
            processed: processedCount,
            currentFile: chunk[chunk.length - 1].name
        }));

        // Allow UI to paint
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    setAssets(prev => [...newAssets, ...prev]);
    
    // Small delay before clearing status
    setTimeout(() => {
        setIngestion({ status: 'idle', processed: 0, total: 0, currentFile: '' });
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    // 1. Handle String Drops (URLs/Text) - Priority over files for drag from browser
    const url = e.dataTransfer.getData('URL');
    const text = e.dataTransfer.getData('text');
    
    if ((url || text) && e.dataTransfer.files.length === 0) {
         const input = url || text;
         const classified = classifyInput(input);
         setAssets(prev => [{
            id: `drop-${Date.now()}`,
            type: classified.type,
            content: classified.content,
            title: classified.type === 'NOTE' ? 'Dropped Text' : input,
            thumbnail: classified.meta?.thumbnail,
            metadata: classified.meta,
            aspectRatio: 350,
            tags: [],
            addedAt: Date.now()
         }, ...prev]);
         return;
    }

    // 2. Handle File System Drops (Recursive Folder Scanning)
    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items && items.length > 0) {
        setIngestion({ status: 'scanning', processed: 0, total: 0, currentFile: 'Scanning Directory...' });
        
        // Wait for UI render
        await new Promise(resolve => setTimeout(resolve, 50));

        const traverse = async (entry: any) => {
            if (entry.isFile) {
                const file = await new Promise<File>((resolve) => entry.file(resolve));
                files.push(file);
            } else if (entry.isDirectory) {
                const reader = entry.createReader();
                const entries = await new Promise<any[]>((resolve) => {
                    reader.readEntries(resolve);
                });
                for (const subEntry of entries) {
                    await traverse(subEntry);
                }
            }
        };

        const promises = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : null;
            if (entry) {
                promises.push(traverse(entry));
            } else if (items[i].kind === 'file') {
                 const file = items[i].getAsFile();
                 if(file) files.push(file);
            }
        }
        await Promise.all(promises);
    } else {
        // Fallback for browsers without webkitGetAsEntry
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            files.push(e.dataTransfer.files[i]);
        }
    }

    if (files.length > 0) {
        await processFiles(files);
    } else {
        setIngestion({ status: 'idle', processed: 0, total: 0, currentFile: '' });
    }
  };

  // Drag Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  const downloadAsset = (e: React.MouseEvent, asset: MindAsset) => {
      e.stopPropagation();
      if (asset.type === 'IMAGE' || asset.type === 'PDF') {
        const link = document.createElement('a');
        link.href = asset.content;
        link.download = asset.title || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
          window.open(asset.content, '_blank');
      }
  };

  // Sorting Logic
  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Filtering & Sorting
  const filteredAssets = useMemo(() => {
    let result = assets;
    if (activeFilter !== 'ALL') {
        result = result.filter(a => a.type === activeFilter);
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(a => 
            a.content.toLowerCase().includes(q) || 
            a.title?.toLowerCase().includes(q) ||
            a.tags.some(t => t.toLowerCase().includes(q))
        );
    }
    return [...result].sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
            case 'name':
                comparison = (a.title || '').localeCompare(b.title || '');
                break;
            case 'size':
                comparison = (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0);
                break;
            case 'date':
            default:
                comparison = a.addedAt - b.addedAt;
                break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [assets, activeFilter, searchQuery, sortKey, sortDirection]);

  const progressPercentage = useMemo(() => {
    if (ingestion.total === 0) return 0;
    return Math.min(100, Math.round((ingestion.processed / ingestion.total) * 100));
  }, [ingestion.processed, ingestion.total]);

  return (
    <div className="flex h-screen w-full bg-mj-bg text-mj-text font-sans selection:bg-mj-accent selection:text-white">
      <Sidebar />

      <div 
        className="flex-1 flex flex-col min-w-0 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => setShowSortMenu(false)}
      >
        
        {/* Drag Overlay */}
        {isDragging && (
            <div className="absolute inset-0 z-50 bg-mj-bg/95 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none border-4 border-dashed border-mj-accent/50 m-4 rounded-xl">
                <div className="bg-mj-accent/20 p-8 rounded-full mb-6 animate-pulse">
                    <Download size={64} className="text-mj-accent" />
                </div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Feed the Mind</h2>
                <p className="text-neutral-400 mt-2 font-mono">Drop images, folders, texts, links, or PDFs</p>
            </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-20 bg-mj-bg/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex-1 max-w-2xl relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your mind..."
                className="block w-full pl-10 pr-3 py-3 border-none rounded-sm leading-5 bg-[#0f0f0f] text-xl font-serif text-gray-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:italic"
              />
          </div>

          <div className="flex items-center gap-3 ml-6 relative">
             <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 bg-white/5 px-3 py-1.5 rounded-full mr-2">
                 <span>Cmd+V to Paste</span>
             </div>

             {/* Sort Menu */}
             <button 
                className={`p-2 transition-colors ${showSortMenu ? 'text-white bg-white/10 rounded-sm' : 'text-neutral-500 hover:text-white'}`}
                onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }}
             >
                <SlidersHorizontal size={20} strokeWidth={1.5} />
             </button>

             {showSortMenu && (
                <div className="absolute top-full right-32 mt-2 w-48 bg-[#1e1e20] border border-white/10 rounded-sm shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5">
                        Sort By
                    </div>
                    {([
                        { key: 'date', label: 'Date Added' },
                        { key: 'name', label: 'Name' },
                        { key: 'size', label: 'Size' }
                    ] as const).map((option) => (
                        <button
                            key={option.key}
                            onClick={() => handleSortChange(option.key)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <span className="uppercase tracking-wider font-medium">{option.label}</span>
                            {sortKey === option.key && (
                                <div className="flex items-center gap-1 text-mj-accent">
                                    {sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
             )}

             <div className="h-6 w-px bg-white/10 mx-1" />

             {/* Action Buttons */}
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-2 bg-neutral-800 text-neutral-300 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-neutral-700 hover:text-white transition-colors"
               title="Select specific files"
             >
                <FilePlus size={14} />
             </button>

             <button 
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              title="Ingest entire folder"
             >
                <FolderOpen size={14} />
                <span className="hidden sm:inline">Ingest</span>
             </button>

             <input 
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden" 
                onChange={handleInputChange}
             />
             <input 
                ref={folderInputRef}
                type="file" 
                // @ts-ignore
                webkitdirectory="" 
                directory="" 
                multiple 
                className="hidden" 
                onChange={handleInputChange}
             />
          </div>
        </header>

        {/* Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-white/5 bg-mj-bg">
             {(['ALL', 'IMAGE', 'VIDEO', 'LINK', 'NOTE', 'TWEET', 'PDF'] as const).map(type => (
                 <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeFilter === type 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                 >
                     {type}
                 </button>
             ))}
        </div>

        {/* Gallery Grid */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth relative">
           
           {/* Progress Monitor */}
           {ingestion.status !== 'idle' && (
             <div className="absolute inset-0 z-30 bg-mj-bg/95 backdrop-blur-md flex items-center justify-center">
                 <div className="w-full max-w-md p-8 bg-[#1e1e20] border border-white/10 shadow-2xl rounded-sm">
                    <div className="flex items-center gap-4 mb-8">
                        {ingestion.status === 'scanning' ? (
                            <div className="relative">
                                <HardDrive className="text-mj-accent animate-pulse" size={24} />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                            </div>
                        ) : (
                            <Loader2 className="animate-spin text-mj-accent" size={24} />
                        )}
                        <div>
                            <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                                {ingestion.status === 'scanning' ? 'System Scanning' : 'Ingestion Protocol'}
                            </h3>
                            <p className="text-[10px] text-mj-muted font-mono uppercase tracking-wider">
                                {ingestion.status === 'scanning' ? 'Traversing File System...' : 'Processing Assets...'}
                            </p>
                        </div>
                    </div>

                    <div className="mb-2 flex justify-between text-[10px] font-mono text-mj-muted uppercase">
                        <span>Status</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mb-6 relative">
                         {ingestion.status === 'scanning' ? (
                             <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                         ) : (
                             <div 
                                className="h-full bg-mj-accent transition-all duration-300 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                             />
                         )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                            <p className="text-[10px] text-mj-muted uppercase tracking-wider mb-1">Current Task</p>
                            <p className="text-xs text-white font-mono truncate" title={ingestion.currentFile}>
                                {ingestion.currentFile || 'Waiting...'}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-mj-muted uppercase tracking-wider mb-1">Processed</p>
                             <p className="text-xs text-white font-mono">
                                {ingestion.processed} <span className="text-white/30">/</span> {ingestion.total || '?'}
                             </p>
                        </div>
                    </div>
                 </div>
             </div>
          )}

           {filteredAssets.length === 0 && ingestion.status === 'idle' && !isCreatingNote ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <Hexagon size={64} className="text-white mb-6" strokeWidth={1} />
                   <h2 className="text-3xl font-bold tracking-tight mb-2">MONOLITH MIND</h2>
                   <p className="max-w-md text-center text-neutral-400 font-mono text-sm">
                       Your digital second brain is empty.<br/>
                       Paste a URL, drag a folder, or drop a file to begin.
                   </p>
                   <button 
                       onClick={() => setIsCreatingNote(true)} 
                       className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-bold uppercase tracking-widest transition-colors"
                   >
                       Create Note
                   </button>
               </div>
           ) : (
             <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-1.5 space-y-1.5 pb-20">
                {/* Inline Note Creation Card */}
                {(activeFilter === 'ALL' || activeFilter === 'NOTE') && (
                    <div 
                        className={`break-inside-avoid w-full transition-colors flex flex-col justify-center items-center min-h-[250px] group rounded-sm overflow-hidden ${isCreatingNote ? 'bg-[#fdfdfd] ring-0' : 'bg-[#1e1e20] border border-white/5 hover:border-white/20'}`}
                    >
                        {isCreatingNote ? (
                             <div className="w-full h-full flex flex-col p-4 bg-[#fdfdfd] text-black">
                                 <textarea
                                    ref={noteInputRef}
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder="Type your thought..."
                                    className="w-full h-full bg-transparent text-black font-serif text-lg resize-none focus:outline-none placeholder-neutral-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.shiftKey) {
                                            e.preventDefault();
                                            saveNote();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsCreatingNote(false);
                                            setNewNoteContent('');
                                        }
                                    }}
                                    onBlur={saveNote}
                                 />
                                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                                     <span className="text-[9px] font-bold uppercase text-neutral-400">Shift+Enter to save</span>
                                     <button onMouseDown={saveNote} className="text-mj-accent hover:text-mj-accent/80">
                                         <Check size={16} />
                                     </button>
                                 </div>
                             </div>
                        ) : (
                            <button 
                                onClick={() => setIsCreatingNote(true)}
                                className="w-full h-full flex flex-col items-center justify-center p-6 hover:bg-white/5 transition-colors"
                            >
                                <Plus size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold uppercase tracking-widest">Add Note</span>
                            </button>
                        )}
                    </div>
                )}

                {filteredAssets.map(asset => (
                    <div 
                        key={asset.id}
                        className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-sm shadow-lg bg-[#1e1e20]"
                        onClick={() => {
                            setFocusNoteOnOpen(false);
                            setSelectedAsset(asset);
                        }}
                        style={{ height: asset.type === 'IMAGE' || asset.type === 'VIDEO' ? 'auto' : `${asset.aspectRatio}px` }}
                    >
                        <AssetCardRenderer asset={asset} />
                        
                        {/* Hover Overlay with Actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFocusNoteOnOpen(true);
                                    setSelectedAsset(asset);
                                }}
                                className="p-1.5 bg-black/60 hover:bg-white hover:text-black text-white rounded-sm backdrop-blur-sm transition-colors pointer-events-auto"
                                title="Add Note"
                            >
                                <PenLine size={14} />
                            </button>
                            <button
                                onClick={(e) => downloadAsset(e, asset)}
                                className="p-1.5 bg-black/60 hover:bg-white hover:text-black text-white rounded-sm backdrop-blur-sm transition-colors pointer-events-auto"
                                title="Download/Open"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAsset(asset.id);
                                }}
                                className="p-1.5 bg-black/60 hover:bg-red-500 hover:text-white text-white rounded-sm backdrop-blur-sm transition-colors pointer-events-auto"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
             </div>
           )}
        </main>
      </div>

      <AssetModal 
        asset={selectedAsset} 
        focusOnMount={focusNoteOnOpen}
        onClose={() => {
            setFocusNoteOnOpen(false); // Reset focus state
            setSelectedAsset(null);
        }} 
        onAddTag={(id, tag) => {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, tags: [...a.tags, tag] } : a));
            if(selectedAsset) setSelectedAsset(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
        }}
        onRemoveTag={(id, tag) => {
            setAssets(prev => prev.map(a => a.id === id ? { ...a, tags: a.tags.filter(t => t !== tag) } : a));
            if(selectedAsset) setSelectedAsset(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
        }}
        onDelete={(id) => {
            setAssets(prev => prev.filter(a => a.id !== id));
            setSelectedAsset(null);
        }}
        onUpdate={updateAsset}
        onDownload={downloadAsset}
      />
    </div>
  );
}