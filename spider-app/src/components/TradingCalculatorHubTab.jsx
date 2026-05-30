

export default function TradingCalculatorHubTab() {
  return (
    <div className="fade-in" style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <iframe 
        src="/trading_calculator.html" 
        title="Trading Calculator Hub"
        width="100%" 
        height="100%" 
        style={{ border: 'none', borderRadius: '12px', minHeight: '80vh' }}
      />
    </div>
  );
}
