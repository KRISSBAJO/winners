import React, { useState, useEffect, useMemo } from 'react';
import { Star, Calendar, MapPin, Ticket, Sun, Moon, Share2, Search, Filter, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------------------------------- TYPES --------------------------------- */
type Event = {
  id: string;
  title: string;
  date: string; 
  endDate?: string;
  location: string;
  imageUrl: string;
  isStarred: boolean;
  tags: string[];
  description: string;
};

type CompanyProfile = {
  name: string;
  logoUrl: string;
  splashImageUrl: string;
  bio: string;
};

type EventStatus = {
  text: 'UPCOMING' | 'LIVE' | 'PAST';
  color: string;
};

/* -------------------------------- MOCK DATA ------------------------------- */
const mockCompany: CompanyProfile = {
  name: "InnovateX Conferences",
  logoUrl: "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500",
  splashImageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto-format&fit=crop",
  bio: "Pioneering the future of technology, design, and business through world-class events and conferences."
};

const mockEvents: Event[] = [
  {
    id: "evt-001",
    title: "Global Tech Summit 2025",
    date: "2025-11-05",
    endDate: "2025-11-07",
    location: "Metropolis Convention Center",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto-format&fit=crop",
    isStarred: true,
    tags: ["Technology", "AI", "Networking"],
    description: "The premier event for tech leaders and innovators."
  },
  {
    id: "evt-002",
    title: "Creative Design Week",
    date: "2025-10-22",
    endDate: "2025-10-25",
    location: "Artisan Hall, Downtown",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop",
    isStarred: true,
    tags: ["Design", "UI/UX", "Art"],
    description: "A celebration of creativity and visual communication."
  },
  {
    id: "evt-003",
    title: "Past Finance Forum",
    date: "2024-12-02",
    location: "Grand Financial Tower",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto-format&fit=crop",
    isStarred: false,
    tags: ["FinTech", "Blockchain", "Investment"],
    description: "Explore the disruptive trends that shaped modern finance."
  },
  {
    id: "evt-004",
    title: "Startup Pitch Night",
    date: "2025-11-18",
    location: "The Innovation Hub",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop",
    isStarred: false,
    tags: ["Startups", "Venture Capital", "Networking"],
    description: "Watch the next generation of entrepreneurs pitch their ideas."
  },
  {
    id: "evt-005",
    title: "AI in Healthcare Symposium",
    date: "2026-01-20",
    location: "Life Sciences Institute",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    isStarred: true,
    tags: ["AI", "Healthcare", "Technology"],
    description: "Discover how artificial intelligence is revolutionizing patient care."
  },
  {
    id: "evt-006",
    title: "UX Design Workshop",
    date: new Date().toISOString().split('T')[0], 
    location: "Online",
    imageUrl: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=2071&auto=format&fit=crop",
    isStarred: false,
    tags: ["Design", "UI/UX", "Workshop"],
    description: "A hands-on workshop for mastering modern UX principles."
  },
   {
    id: "evt-007",
    title: "Web3 & Beyond",
    date: "2026-03-10",
    location: "Virtual Conference",
    imageUrl: "https://images.unsplash.com/photo-1642104704074-af5761645790?q=80&w=2070&auto=format&fit=crop",
    isStarred: false,
    tags: ["Blockchain", "Web3", "Technology"],
    description: "Exploring the future of the decentralized web."
  },
  {
    id: "evt-008",
    title: "Photography Masterclass",
    date: "2025-12-05",
    location: "City Art Gallery",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop",
    isStarred: false,
    tags: ["Art", "Workshop"],
    description: "Learn professional photography techniques from industry experts."
  }
];


/* --------------------------- HELPER FUNCTIONS & HOOKS ------------------------- */

const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = window.localStorage.getItem('theme');
            return savedTheme || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme] as const;
};

const getEventStatus = (startDateStr: string, endDateStr?: string): EventStatus => {
    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : startDate;

    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (now > endDate) {
        return { text: 'PAST', color: 'bg-red-500/10 text-red-500' };
    }
    if (now >= startDate && now <= endDate) {
        return { text: 'LIVE', color: 'bg-green-500/10 text-green-400 animate-pulse' };
    }
    return { text: 'UPCOMING', color: 'bg-sky-500/10 text-sky-400' };
};


/* ----------------------------- UI COMPONENTS --------------------------- */

const ThemeToggle = ({ theme, setTheme }: { theme: string; setTheme: (theme: string) => void }) => (
    <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-900/50 text-white backdrop-blur-sm hover:bg-slate-700/50 transition-colors"
        aria-label="Toggle theme"
    >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const status = getEventStatus(event.date, event.endDate);
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg hover:shadow-lime-500/10 transition-shadow duration-300 group border border-slate-200 dark:border-slate-700"
        >
            <div className="relative">
                <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={event.imageUrl} alt={event.title} />
                <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>
                    {status.text}
                </div>
                {event.isStarred && (
                    <div className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-full">
                        <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col h-[calc(100%-192px)]">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{event.title}</h3>
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mb-3">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{event.location}</span>
                </div>
                <div className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-xs font-semibold bg-lime-400/20 text-lime-800 dark:bg-lime-400/10 dark:text-lime-300 px-3 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-lime-400 hover:bg-lime-300 px-4 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-lime-500/20">
                    <Ticket className="w-4 h-4" />
                    Learn More
                </button>
            </div>
        </motion.div>
    );
};


/* --------------------------- MAIN STOREFRONT COMPONENT -------------------------- */
export default function EventStoreFrontV3() {
    const [theme, setTheme] = useTheme();
    const [activeTag, setActiveTag] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    const starredEvents = useMemo(() => mockEvents.filter(event => event.isStarred), []);
    const allTags = useMemo(() => ['All', ...new Set(mockEvents.flatMap(e => e.tags))], []);

    const filteredAndSortedEvents = useMemo(() => {
        let events = mockEvents;

        if (activeTag !== 'All') {
            events = events.filter(event => event.tags.includes(activeTag));
        }

        if (searchTerm) {
            events = events.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        events.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
        });

        return events;
    }, [activeTag, searchTerm, sortBy]);
    
    return (
        <div className="bg-slate-200 dark:bg-slate-900 min-h-screen font-sans bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <header className="relative h-[60vh] min-h-[350px] text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
                <img src={mockCompany.splashImageUrl} alt={`${mockCompany.name} showcase`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative z-20 flex flex-col items-center justify-end h-full text-center p-8 pb-16">
                    <motion.img initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "backOut" }} src={mockCompany.logoUrl} alt={`${mockCompany.name} logo`} className="h-20 w-20 mb-4 bg-white p-2 rounded-full shadow-2xl" />
                    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">{mockCompany.name}</motion.h1>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-4 max-w-2xl text-lg text-slate-200">{mockCompany.bio}</motion.p>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-6 flex gap-4">
                         <button className="px-6 py-2 font-semibold text-slate-900 bg-white rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2">Follow</button>
                         <button className="px-6 py-2 font-semibold text-white bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors flex items-center gap-2"><Share2 size={16}/> Share</button>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10">
                {starredEvents.length > 0 && (
                    <motion.section initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-3"><Star className="w-8 h-8 text-amber-400" />Featured Events</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Our most popular and highly anticipated events. Don't miss out!</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {starredEvents.map(event => (<EventCard key={event.id} event={event} />))}
                        </div>
                    </motion.section>
                )}

                <motion.section initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">All Events</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Browse our full calendar, or use the controls to search, filter, and sort.</p>

                    {/* --- Filter & Search Controls --- */}
                    <motion.div layout className="mb-8 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition" />
                            </div>
                            {/* Sort */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none pl-10 pr-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition">
                                    <option value="date-desc">Sort by Date (Newest First)</option>
                                    <option value="date-asc">Sort by Date (Oldest First)</option>
                                </select>
                            </div>
                        </div>
                         {/* Filter Tags */}
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button key={tag} onClick={() => setActiveTag(tag)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 border-2 ${activeTag === tag ? 'bg-lime-400 text-slate-900 border-lime-400' : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-transparent hover:border-lime-400'}`}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* --- Event Grid --- */}
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <AnimatePresence>
                            {filteredAndSortedEvents.length > 0 ? (
                                filteredAndSortedEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="col-span-full text-center py-16 px-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700">
                                    <XCircle className="mx-auto text-lime-500 h-12 w-12 mb-4"/>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Events Found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filter to find what you're looking for.</p>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </motion.div>
                </motion.section>
            </main>
        </div>
    );
}
