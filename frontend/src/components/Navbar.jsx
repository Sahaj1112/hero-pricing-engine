import { Link, useLocation } from 'react-router-dom';
import '../index.css';

export default function Navbar() {
    const location = useLocation();
    const isLanding = location.pathname === '/';

    return (
        <nav className={`navbar ${isLanding ? 'navbar-transparent' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🚲</span> Hero Cycles
                </Link>

                <div className="navbar-right">
                    {!isLanding && <Link to="/" className="nav-link">Home</Link>}
                    {isLanding && (
                        <Link to="/dashboard" className="btn btn-primary btn-sm">Go to App</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}