import { Link } from 'react-router-dom';
import '../index.css';

export default function Landing() {
    return (
        <div className="landing-container">
            <div className="hero-section animate-fade-in">
                <div className="hero-content">
                    <div className="badge badge-primary mb-4">Pricing Engine v2.0</div>
                    <h1 className="hero-title">
                        Build better bikes.<br />
                        <span className="text-primary">Price them perfectly.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The ultimate sales portal for Hero Cycles. Configure custom builds, calculate margins instantly, and generate quotes in seconds.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Login to Portal
                        </Link>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Learn More
                        </a>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card card">
                        <div className="skeleton-line" style={{ width: '60%' }}></div>
                        <div className="skeleton-line" style={{ width: '80%' }}></div>
                        <div className="skeleton-line" style={{ width: '40%' }}></div>
                        <div className="skeleton-box mt-4"></div>
                        <div className="skeleton-box" style={{ height: '100px' }}></div>
                        <div className="flex justify-between mt-4">
                            <div className="skeleton-line" style={{ width: '30%' }}></div>
                            <div className="skeleton-btn"></div>
                        </div>
                    </div>
                    <div className="hero-decoration dec-1"></div>
                    <div className="hero-decoration dec-2"></div>
                </div>
            </div>

            <section id="features" className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">⚙️</div>
                            <h3>Dynamic Configuration</h3>
                            <p>Build custom bicycles with real-time compatibility checks and dynamic part selection.</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">💰</div>
                            <h3>Instant Pricing</h3>
                            <p>Calculate totals, margins, and taxes on the fly. No more manual spreadsheets.</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">📊</div>
                            <h3>Sales Dashboard</h3>
                            <p>Track your recent configurations, monitor sales, and manage your pipeline efficiently.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
