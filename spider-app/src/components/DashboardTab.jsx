import React from 'react';
import { TrendingUp, Award, Activity, BarChart2, DollarSign, Wallet } from 'lucide-react';
import { Line } from 'react-chartjs-2';
// ChartJS components registered globally in main.jsx

export default function DashboardTab({ 
    inrBalance, 
    usdBalance, 
    positions, 
    trades, 
    prices, 
    onClosePosition 
}) {
    // Format helpers
    const FMT = (num) => '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const FMT_USD = (num) => '$' + num.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    // Calculate dynamic stats
    const activeINRPositions = positions.filter(p => p.currency === 'INR');
    const activeUSDPositions = positions.filter(p => p.currency === 'USD');

    // Calculate real-time P&L for positions
    const getPnl = (pos) => {
        const curPrice = prices[pos.symbol] || pos.entryPrice;
        const diff = pos.direction === 'LONG' ? (curPrice - pos.entryPrice) : (pos.entryPrice - curPrice);
        return diff * pos.qty;
    };

    const totalInrPnl = activeINRPositions.reduce((acc, pos) => acc + getPnl(pos), 0);
    const totalUsdPnl = activeUSDPositions.reduce((acc, pos) => acc + getPnl(pos), 0);

    // Trade History stats
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0.0';

    // Mock Equity Curve data
    const chartData = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
        datasets: [
            {
                label: 'Simulated Equity Growth (USD)',
                data: [1000, 1020, 990, 1045, 1060, 1050, 1090, 1120, 1105, 1150],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.2,
                pointRadius: 3
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: '#9ca3af', font: { size: 9 } }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: '#9ca3af', font: { size: 9 } }
            }
        }
    };

    return (
        <div className="fade-in">
            {/* Stat Cards */}
            <div className="dashboard-stat-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan)' }}>
                    <Wallet size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">INR Portfolio Cash</span>
                    <span className="stat-value inr">{FMT(inrBalance)}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' }}>
                    <DollarSign size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">USD Portfolio Cash</span>
                    <span className="stat-value usd">{FMT_USD(usdBalance)}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)' }}>
                    <Activity size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Active Trade Positions</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>{positions.length}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                    <Award size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Quant Win Rate</span>
                    <span className="stat-value" style={{ color: '#a78bfa' }}>{winRate}%</span>
                  </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Equity Curve Chart */}
                <div className="card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title">
                        <span><BarChart2 size={16} /> Portfolio Growth Spectrum</span>
                        <span className="badge badge-cyan">SIMULATED</span>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Capital Summary Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="card-title">
                        <span><TrendingUp size={16} /> Floating Account P&amp;L</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Indian Markets (INR) P&amp;L</span>
                                <span className={`balance-value ${totalInrPnl >= 0 ? 'green' : 'red'}`} style={{ color: totalInrPnl >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                                    {totalInrPnl >= 0 ? '+' : ''}{FMT(totalInrPnl)}
                                </span>
                            </div>
                            <div className="risk-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: totalInrPnl === 0 ? '50%' : totalInrPnl > 0 ? '75%' : '25%', 
                                    background: totalInrPnl >= 0 ? 'var(--green)' : 'var(--red)',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Forex &amp; Crypto (USD) P&amp;L</span>
                                <span className={`balance-value ${totalUsdPnl >= 0 ? 'green' : 'red'}`} style={{ color: totalUsdPnl >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                                    {totalUsdPnl >= 0 ? '+' : ''}{FMT_USD(totalUsdPnl)}
                                </span>
                            </div>
                            <div className="risk-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: totalUsdPnl === 0 ? '50%' : totalUsdPnl > 0 ? '70%' : '30%', 
                                    background: totalUsdPnl >= 0 ? 'var(--green)' : 'var(--red)',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        👉 Balances update immediately when trade positions are closed. Price feeds tick every 2 seconds.
                    </div>
                </div>
            </div>

            {/* Active Position Board */}
            <div className="card">
                <div className="card-title">
                    <span><Activity size={16} /> Floating Positions Panel</span>
                    <span className="badge badge-amber" style={{ animation: 'pulse-glow 2s infinite' }}>Real-time updates</span>
                </div>
                {positions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        No floating positions found. Open the <strong>Practice Trade</strong> module to execute new positions.
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Asset Node</th>
                                    <th>Instrument</th>
                                    <th>Position</th>
                                    <th>Trade Qty</th>
                                    <th>Entry Rate</th>
                                    <th>Current Rate</th>
                                    <th>P&amp;L (Live)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.map(pos => {
                                    const pnl = getPnl(pos);
                                    const isINR = pos.currency === 'INR';
                                    const price = prices[pos.symbol] || pos.entryPrice;
                                    return (
                                        <tr key={pos.id}>
                                            <td>
                                                <span className={`badge ${
                                                    pos.type === 'Crypto' ? 'badge-blue' :
                                                    pos.type === 'Forex' ? 'badge-cyan' :
                                                    pos.type === 'Equity' ? 'badge-green' :
                                                    'badge-amber'
                                                }`}>{pos.type}</span>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>{pos.symbol}</td>
                                            <td>
                                                <span className={`badge ${pos.direction === 'LONG' ? 'badge-green' : 'badge-red'}`}>
                                                    {pos.direction}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{pos.qty}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{isINR ? FMT(pos.entryPrice) : FMT_USD(pos.entryPrice)}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{isINR ? FMT(price) : FMT_USD(price)}</td>
                                            <td style={{ 
                                                fontFamily: 'var(--font-mono)', 
                                                fontWeight: 700, 
                                                color: pnl >= 0 ? 'var(--green)' : 'var(--red)'
                                            }}>
                                                {pnl >= 0 ? '+' : ''}{isINR ? FMT(pnl) : FMT_USD(pnl)}
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
