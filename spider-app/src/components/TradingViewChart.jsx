import React, { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol, theme = 'dark' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        // Clear container content
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const widgetId = `tv-widget-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
        const widgetDiv = document.createElement('div');
        widgetDiv.id = widgetId;
        widgetDiv.style.height = '100%';
        widgetDiv.style.width = '100%';
        containerRef.current.appendChild(widgetDiv);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            if (typeof window.TradingView !== 'undefined' && document.getElementById(widgetId)) {
                new window.TradingView.widget({
                    width: '100%',
                    height: '100%',
                    symbol: symbol,
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: theme,
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#111827',
                    enable_publishing: false,
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    container_id: widgetId,
                });
            }
        };
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [symbol, theme]);

    return (
        <div 
            ref={containerRef} 
            className="tradingview-container"
            style={{ height: '100%', width: '100%', background: '#0a0f1d' }} 
        />
    );
}
