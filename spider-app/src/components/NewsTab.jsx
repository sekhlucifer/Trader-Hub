import React, { useEffect } from 'react';
import { Newspaper, Calendar, ExternalLink } from 'lucide-react';

export default function NewsTab() {
    useEffect(() => {
        // Load news timeline script
        const timelineContainer = document.getElementById('tv-timeline-container');
        if (timelineContainer) {
            timelineContainer.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
            script.type = 'text/javascript';
            script.async = true;
            script.innerHTML = JSON.stringify({
                feedMode: "all_symbols",
                colorTheme: "dark",
                isTransparent: true,
                displayMode: "regular",
                width: "100%",
                height: "100%",
                locale: "en"
            });
            timelineContainer.appendChild(script);
        }

        // Load economic events calendar script
        const calendarContainer = document.getElementById('tv-calendar-container');
        if (calendarContainer) {
            calendarContainer.innerHTML = '';
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
            script.type = 'text/javascript';
            script.async = true;
            script.innerHTML = JSON.stringify({
                colorTheme: "dark",
                isTransparent: true,
                width: "100%",
                height: "100%",
                locale: "en",
                importanceFilter: "-1,0,1",
                countryFilter: "in,us,eu,gb,jp,ch"
            });
            calendarContainer.appendChild(script);
        }
    }, []);

    return (
        <div className="fade-in">
            <div className="section-title-container" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>📰 Financial Intelligence Hub</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Real-time global news feeds and macroeconomic events calendars</div>
            </div>

            <div className="news-container" style={{ padding: 0 }}>
                {/* News Feed Card */}
                <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title">
                        <span><Newspaper size={16} /> Live Global Markets Feed</span>
                    </div>
                    <div id="tv-timeline-container" style={{ flex: 1, minHeight: 0 }} />
                </div>

                {/* Economic calendar and Forex Factory panel */}
                <div className="news-sidebar-card">
                    {/* Forex Factory Redirect */}
                    <div className="forex-factory-card">
                        <div className="forex-factory-logo">⚡ FOREX FACTORY</div>
                        <div className="forex-factory-desc">
                            Access live economic calendars, historical reports, forum threads, and retail trader sentiment.
                        </div>
                        <a 
                            href="https://www.forexfactory.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn" 
                            style={{ textDecoration: 'none', width: '100%', display: 'flex', gap: '8px' }}
                        >
                            <ExternalLink size={16} /> Launch Forex Factory
                        </a>
                    </div>

                    {/* Economic Calendar Event Widget */}
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                        <div className="card-title" style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                            <span><Calendar size={16} /> Global Macro Calendars</span>
                        </div>
                        <div id="tv-calendar-container" style={{ flex: 1, minHeight: '350px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
