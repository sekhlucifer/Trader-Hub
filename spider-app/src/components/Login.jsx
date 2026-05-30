import React, { useState } from 'react';
import { Lock, Mail, Play, Shield } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple obfuscation hash to hide email from source
        const getHash = (str) => {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
            }
            return hash;
        };

        setTimeout(() => {
            // Compare against hashed secret instead of plain text
            if (getHash(email.toLowerCase().trim()) === 3661019564) {
                onLogin({
                    email: email,
                    name: email.split('@')[0]
                });
            } else {
                setError('Invalid email. Access is restricted.');
            }
            setLoading(false);
        }, 1000);
    };



    return (
        <div className="login-page fade-in">
            <div className="card login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🕷️</div>
                    <div className="login-logo-text">Spider<span>Quant</span></div>
                    <div className="login-logo-sub">QUANTITATIVE ALGORITHMIC TRADING TERMINAL</div>
                </div>

                {error && (
                    <div className="insight-box red-box" style={{ padding: '8px 12px', margin: '0 0 1rem 0', fontSize: '0.75rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)' }} />
                            <input 
                                type="text" 
                                id="email" 
                                placeholder="Enter email address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.75rem' }}>
                        <button 
                            type="submit" 
                            className="btn" 
                            style={{ width: '100%', padding: '12px' }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating Secures...' : (
                                <>
                                    <Shield size={16} /> ENTER TRADING PLATFORM
                                </>
                            )}
                        </button>
                    </div>
                </form>


            </div>
        </div>
    );
}
