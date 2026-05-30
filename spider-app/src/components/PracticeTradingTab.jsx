import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldAlert, CreditCard } from 'lucide-react';
import TradingViewChart from './TradingViewChart';

// Mappings from asset class to symbols & their TradingView tickers
export const ASSET_SYMBOLS = {
    Equity: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', tvSymbol: 'BSE:RELIANCE', currency: 'INR' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', tvSymbol: 'BSE:TCS', currency: 'INR' },
        { symbol: 'INFOSYS', name: 'Infosys Limited', tvSymbol: 'BSE:INFOSYS', currency: 'INR' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', tvSymbol: 'BSE:HDFCBANK', currency: 'INR' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', tvSymbol: 'BSE:ICICIBANK', currency: 'INR' }
    ],
    Futures: [
        { symbol: 'NIFTY23MAYFUT', name: 'Nifty 50 Futures', tvSymbol: 'NSE:NIFTY1!', currency: 'INR' },
        { symbol: 'BANKNIFTY23MAYFUT', name: 'Bank Nifty Futures', tvSymbol: 'NSE:BANKNIFTY1!', currency: 'INR' }
    ],
    Options: [
        { symbol: 'NIFTY 22000 CE', name: 'Nifty 22000 Call Option', tvSymbol: 'NSE:NIFTY', currency: 'INR' },
        { symbol: 'NIFTY 22000 PE', name: 'Nifty 22000 Put Option', tvSymbol: 'NSE:NIFTY', currency: 'INR' },
        { symbol: 'BANKNIFTY 47000 CE', name: 'Bank Nifty 47000 Call', tvSymbol: 'NSE:BANKNIFTY', currency: 'INR' },
        { symbol: 'BANKNIFTY 47000 PE', name: 'Bank Nifty 47000 Put', tvSymbol: 'NSE:BANKNIFTY', currency: 'INR' }
    ],
    Commodity: [
        { symbol: 'GOLD', name: 'Gold Futures', tvSymbol: 'COMEX:GC1!', currency: 'USD' },
        { symbol: 'SILVER', name: 'Silver Futures', tvSymbol: 'COMEX:SI1!', currency: 'USD' },
        { symbol: 'CRUDEOIL', name: 'Crude Oil Futures', tvSymbol: 'NYMEX:CL1!', currency: 'USD' }
    ],
    Forex: [
        { symbol: 'EUR/USD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', currency: 'USD' },
        { symbol: 'GBP/USD', name: 'Great British Pound / USD', tvSymbol: 'FX:GBPUSD', currency: 'USD' },
        { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', tvSymbol: 'FX_IDC:USDINR', currency: 'USD' },
        { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', tvSymbol: 'FX:USDJPY', currency: 'USD' }
    ],
    Crypto: [
        { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', tvSymbol: 'BINANCE:BTCUSDT', currency: 'USD' },
        { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', tvSymbol: 'BINANCE:ETHUSDT', currency: 'USD' },
        { symbol: 'SOL/USD', name: 'Solana / US Dollar', tvSymbol: 'BINANCE:SOLUSDT', currency: 'USD' }
    ]
};

const LEVERAGE = 10; // 10x leverage for simulated margin trading

export default function PracticeTradingTab({ 
    inrBalance, 
    usdBalance, 
    positions, 
    prices, 
    priceDirections, 
    onExecuteTrade, 
    onClosePosition 
}) {
    const [assetClass, setAssetClass] = useState('Equity');
    const [selectedSymObj, setSelectedSymObj] = useState(ASSET_SYMBOLS.Equity[0]);
    const [side, setSide] = useState('BUY'); // BUY or SELL
    const [orderType, setOrderType] = useState('MARKET'); // MARKET or LIMIT
    const [qty, setQty] = useState(1);
    const [limitPrice, setLimitPrice] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });

    const prevPriceRef = useRef({});

    // Handle Asset Class change
    useEffect(() => {
        const firstSym = ASSET_SYMBOLS[assetClass][0];
        setSelectedSymObj(firstSym);
        // Default quantity based on asset class
        if (assetClass === 'Crypto') setQty(0.1);
        else if (assetClass === 'Forex') setQty(1000);
        else setQty(1);
        setMessage({ text: '', type: '' });
    }, [assetClass]);

    // Track current price of selected symbol
    const curPrice = prices[selectedSymObj.symbol] || 0;
    const priceDir = priceDirections[selectedSymObj.symbol] || 'neutral';

    // Update limit price helper
    useEffect(() => {
        if (orderType === 'LIMIT' && curPrice > 0 && limitPrice === 0) {
            setLimitPrice(curPrice);
        }
    }, [curPrice, orderType]);

    // Reset limit price on symbol change
    useEffect(() => {
        setLimitPrice(0);
    }, [selectedSymObj]);

    // Calculate required margin
    const tradePrice = orderType === 'MARKET' ? curPrice : limitPrice;
    const totalContractValue = tradePrice * qty;
    const marginRequired = totalContractValue / LEVERAGE;
    const isINR = selectedSymObj.currency === 'INR';

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (qty <= 0) {
            setMessage({ text: 'Quantity must be greater than zero.', type: 'red' });
            return;
        }

        const balance = isINR ? inrBalance : usdBalance;
        if (marginRequired > balance) {
            setMessage({ 
                text: `Insufficient funds. Required Margin: ${
                    isINR ? '₹' + marginRequired.toLocaleString('en-IN') : '$' + marginRequired.toFixed(2)
                }, Available Balance: ${
                    isINR ? '₹' + balance.toLocaleString('en-IN') : '$' + balance.toFixed(2)
                }`, 
                type: 'red' 
            });
            return;
        }

        // Execute trade
        onExecuteTrade({
            symbol: selectedSymObj.symbol,
            type: assetClass,
            direction: side === 'BUY' ? 'LONG' : 'SHORT',
            qty: parseFloat(qty),
            entryPrice: parseFloat(tradePrice),
            currency: selectedSymObj.currency,
            margin: marginRequired
        });

        setMessage({ 
            text: `Order successfully filled! ${side === 'BUY' ? 'Bought' : 'Sold'} ${qty} ${selectedSymObj.symbol} at ${
                isINR ? '₹' + tradePrice.toLocaleString() : '$' + tradePrice.toFixed(2)
            } (Margin locked: ${
                isINR ? '₹' + marginRequired.toLocaleString() : '$' + marginRequired.toFixed(2)
            })`, 
            type: 'green' 
        });

        // Reset inputs
        if (assetClass === 'Crypto') setQty(0.1);
        else if (assetClass === 'Forex') setQty(1000);
        else setQty(1);
    };

    return (
        <div className="fade-in">
            {/* Header / Subheader */}
            <div className="section-title-container" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>🎮 Quant Simulation Desk (Practice Mode)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Practice trading with 10× margin leverage. Equity/F&amp;O consume Rupees (₹1,00,000 cash pool). Crypto/Forex/Commodities consume Dollars ($1,000 cash pool).
                </div>
            </div>

            {/* Trading Workspace Grid */}
            <div className="practice-grid">
                {/* Chart Section */}
                <div className="chart-section">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <TradingViewChart symbol={selectedSymObj.tvSymbol} />
                    </div>
                </div>

                {/* Execution Ticket Section */}
                <div className="card ticket-section" style={{ padding: '1.25rem' }}>
                    <div className="card-title">
                        <span><Layers size={16} /> Order Execution Ticket</span>
                        <span className={`badge ${isINR ? 'badge-cyan' : 'badge-green'}`}>{selectedSymObj.currency}</span>
                    </div>

                    <form onSubmit={handlePlaceOrder} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            {/* Asset Class Select */}
                            <div className="input-group">
                                <label>Asset Class</label>
                                <select 
                                    value={assetClass} 
                                    onChange={(e) => setAssetClass(e.target.value)}
                                >
                                    <option value="Equity">Equity (NSE/BSE)</option>
                                    <option value="Futures">Futures (F&amp;O)</option>
                                    <option value="Options">Options (Derivatives)</option>
                                    <option value="Commodity">Commodity (Comex)</option>
                                    <option value="Forex">Forex Markets</option>
                                    <option value="Crypto">Crypto Assets</option>
                                </select>
                            </div>

                            {/* Symbol Select */}
                            <div className="input-group">
                                <label>Trading Symbol</label>
                                <select 
                                    value={selectedSymObj.symbol}
                                    onChange={(e) => {
                                        const obj = ASSET_SYMBOLS[assetClass].find(x => x.symbol === e.target.value);
                                        setSelectedSymObj(obj);
                                    }}
                                >
                                    {ASSET_SYMBOLS[assetClass].map(sym => (
                                        <option key={sym.symbol} value={sym.symbol}>
                                            {sym.symbol} ({sym.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buy/Sell Side Toggle */}
                            <div className="buy-sell-toggle">
                                <button
                                    type="button"
                                    className={`side-btn buy ${side === 'BUY' ? 'active' : ''}`}
                                    onClick={() => setSide('BUY')}
                                >
                                    🟢 Buy / Long
                                </button>
                                <button
                                    type="button"
                                    className={`side-btn sell ${side === 'SELL' ? 'active' : ''}`}
                                    onClick={() => setSide('SELL')}
                                >
                                    🔴 Sell / Short
                                </button>
                            </div>

                            {/* Live Feed Flasher */}
                            <div className="market-indicator">
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>LIVE SIM TICKER</span>
                                <span className={`price-flash ${priceDir}`}>
                                    {isINR ? '₹' + curPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '$' + curPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    {priceDir === 'up' ? ' ▲' : priceDir === 'down' ? ' ▼' : ' ⬞'}
                                </span>
                            </div>

                            {/* Order Type Toggle */}
                            <div className="order-type-toggle">
                                <button 
                                    type="button" 
                                    className={`option-btn ${orderType === 'MARKET' ? 'active' : ''}`}
                                    onClick={() => setOrderType('MARKET')}
                                >
                                    Market Order
                                </button>
                                <button 
                                    type="button" 
                                    className={`option-btn ${orderType === 'LIMIT' ? 'active' : ''}`}
                                    onClick={() => setOrderType('LIMIT')}
                                >
                                    Limit Order
                                </button>
                            </div>

                            {/* Inputs: Qty and Limit Price */}
                            <div className="grid-cols-2">
                                <div className="input-group">
                                    <label>Order Qty</label>
                                    <input 
                                        type="number" 
                                        step={assetClass === 'Crypto' ? '0.001' : '1'} 
                                        min={assetClass === 'Crypto' ? '0.001' : '1'}
                                        value={qty}
                                        onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Order Price</label>
                                    {orderType === 'MARKET' ? (
                                        <input 
                                            type="text" 
                                            value="Market Execution" 
                                            disabled 
                                            style={{ color: 'var(--muted)', fontStyle: 'italic' }} 
                                        />
                                    ) : (
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={limitPrice || curPrice}
                                            onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Confirmation Stats */}
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                    <span>Contract Size:</span>
                                    <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                                        {isINR ? '₹' + totalContractValue.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '$' + totalContractValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                    <span>Locked Margin (10x Lev):</span>
                                    <span style={{ color: isINR ? 'var(--cyan)' : 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                        {isINR ? '₹' + marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '$' + marginRequired.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {message.text && (
                                <div className={`insight-box ${message.type === 'green' ? 'green-box' : 'red-box'}`} style={{ padding: '8px 12px', fontSize: '0.72rem', margin: '0 0 10px 0' }}>
                                    {message.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className={`btn ${side === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                                style={{ width: '100%', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                            >
                                {side === 'BUY' ? '🟢 Buy / Execute Long' : '🔴 Sell / Execute Short'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Positions Table (Local to Desk) */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-title">
                    <span><CreditCard size={16} /> Active Positions (Simulator Ticker)</span>
                    <span className="badge badge-amber">10x Leverage Margin active</span>
                </div>
                {positions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
                        No active floating positions. Place a buy or sell order above to simulate trade monitoring.
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Symbol</th>
                                    <th>Direction</th>
                                    <th>Size</th>
                                    <th>Entry Price</th>
                                    <th>Current Price</th>
                                    <th>Margin Locked</th>
                                    <th>Floating P&amp;L</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map(pos => {
                                    const isINR = pos.currency === 'INR';
                                    const symbolPrice = prices[pos.symbol] || pos.entryPrice;
                                    const priceChange = pos.direction === 'LONG' ? (symbolPrice - pos.entryPrice) : (pos.entryPrice - symbolPrice);
                                    const pnl = priceChange * pos.qty;
                                    return (
                                        <tr key={pos.id}>
                                            <td><span className="badge badge-blue">{pos.type}</span></td>
                                            <td style={{ fontWeight: 700 }}>{pos.symbol}</td>
                                            <td>
                                                <span className={`badge ${pos.direction === 'LONG' ? 'badge-green' : 'badge-red'}`}>
                                                    {pos.direction}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{pos.qty}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{isINR ? '₹' + pos.entryPrice.toLocaleString() : '$' + pos.entryPrice.toFixed(2)}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{isINR ? '₹' + symbolPrice.toLocaleString() : '$' + symbolPrice.toFixed(2)}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{isINR ? '₹' + pos.margin.toLocaleString() : '$' + pos.margin.toFixed(2)}</td>
                                            <td style={{ 
                                                fontFamily: 'var(--font-mono)', 
                                                fontWeight: 700, 
                                                color: pnl >= 0 ? 'var(--green)' : 'var(--red)'
                                            }}>
                                                {pnl >= 0 ? '+' : ''}{isINR ? '₹' + pnl.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '$' + pnl.toFixed(2)}
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => onClosePosition(pos.id)}
                                                >
                                                    Market Close
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
