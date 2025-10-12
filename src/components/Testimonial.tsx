import React from 'react';
import { motion, useInView } from 'framer-motion';

// --- Brand & Style Definitions ---
const BRAND_RED = '#9B2C2C';

// --- Enhanced SVG for the decorative quotation mark (refined path for smoother curves) ---
const QuoteIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path 
            d="M28.28 1C23.64 1 19.5267 2.53333 15.94 5.6C12.3533 8.66667 9.8 12.6 8.28 17.4C6.76 22.2 6 27.5333 6 33.4C6 38.2 7.14667 42.4 9.44 46C11.7333 49.6 14.8667 52.4 18.84 54.4L25.48 45.6C23.4267 44.6667 21.84 43.4 20.72 41.8C19.6 40.2 19.04 38.4667 19.04 36.6C19.04 34.6667 19.3533 32.8667 19.98 31.2C20.6067 29.5333 21.52 28.1333 22.72 27C23.92 25.8667 25.2733 25.0333 26.78 24.5C28.2867 23.9667 29.8267 23.7 31.4 23.7V1L28.28 1ZM73.64 1C69 1 64.8867 2.53333 61.3 5.6C57.7133 8.66667 55.16 12.6 53.64 17.4C52.12 22.2 51.36 27.5333 51.36 33.4C51.36 38.2 52.5067 42.4 54.8 46C57.0933 49.6 60.2267 52.4 64.2 54.4L70.84 45.6C68.7867 44.6667 67.2 43.4 66.08 41.8C64.96 40.2 64.4 38.4667 64.4 36.6C64.4 34.6667 64.7133 32.8667 65.34 31.2C65.9667 29.5333 66.88 28.1333 68.08 27C69.28 25.8667 70.6333 25.0333 72.14 24.5C73.6467 23.9667 75.1867 23.7 76.76 23.7V1H73.64Z" 
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.8"
        />
    </svg>
);

// --- Refined Attribution Component (modular for reusability) ---
const Attribution: React.FC = () => (
    <div className="flex flex-col items-center lg:items-start lg:ml-4 mt-6 lg:mt-0">
        <p className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-wide">- Pst. Chris Adebajo</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Resident Pastor, Winners Chapel International Nashville</p>
    </div>
);

// --- Main Testimonial Component (improved structure: better grid flow, enhanced spacing, refined text) ---
export default function Testimonial() {
    const ref = React.useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
                staggerChildren: 0.15, 
                delayChildren: 0.4,
                duration: 0.8 
            } 
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                duration: 0.6, 
                ease: [0.6, 0.05, 0.01, 0.9] // Valid cubic-bezier for smooth, elastic feel
            } 
        },
    };

    // Enhanced quote text: More inspirational, concise, and faith-centered
    const quoteText = `"In the body of Christ, every soul is a vital thread in the tapestry of faith. This platform weaves us closer, ensuring no one drifts from our shared journey of grace and growth."`;

    return (
        <section 
            id="about" 
            ref={ref}
            className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden"
        >
            {/* Subtle background elements for depth */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-100/20 rounded-full blur-3xl dark:bg-red-900/10" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100/10 rounded-full blur-3xl dark:bg-amber-900/5" />
            </div>

            <style>{`
                .glass-pane { 
                    background: rgba(255, 255, 255, 0.25); 
                    backdrop-filter: blur(20px); 
                    -webkit-backdrop-filter: blur(20px); 
                    border: 1px solid rgba(255, 255, 255, 0.18); 
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }
                .dark .glass-pane { 
                    background: rgba(15, 23, 42, 0.4); 
                    border-color: rgba(255, 255, 255, 0.08); 
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
                }
            `}</style>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="glass-pane p-6 md:p-10 lg:p-12 rounded-3xl max-w-6xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {/* Responsive Grid: Stacks vertically on mobile, horizontal on larger screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 items-start">
                        {/* Image Column: Enhanced with subtle border and shadow */}
                        <motion.div 
                            variants={itemVariants} 
                            className="lg:col-span-1 flex justify-center lg:justify-start"
                        >
                            <div className="relative">
                                <img 
                                    src="https://placehold.co/200x200/9B2C2C/ffffff?text=PC&font=roboto" 
                                    alt="Pastor Chris Adebajo" 
                                    className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full object-cover shadow-xl ring-2 ring-white/50 dark:ring-slate-800/50" 
                                />
                                {/* Subtle glow effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                        
                        {/* Quote Column: Improved text hierarchy, leading, and alignment */}
                        <div className="lg:col-span-3 flex flex-col justify-center">
                            {/* Quote Icon: Positioned absolutely for overlap effect */}
                            <motion.div 
                                variants={itemVariants}
                                className="absolute -top-4 -left-4 lg:static lg:mb-6 opacity-75"
                                style={{ zIndex: 1 }}
                            >
                                <QuoteIcon className="w-10 h-auto text-red-300 dark:text-red-600" />
                            </motion.div>

                            <motion.blockquote 
                                variants={itemVariants} 
                                className="relative text-xl md:text-2xl lg:text-3xl font-serif italic text-slate-800 dark:text-slate-100 leading-relaxed lg:leading-snug mt-4 lg:mt-0 pr-4"
                            >
                                {quoteText}
                            </motion.blockquote>

                            {/* Attribution: Now modular, with better spacing */}
                            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                                <Attribution />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}