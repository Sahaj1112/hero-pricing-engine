import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/parts',     icon: '⚙️', label: 'Parts Manager' },
    { to: '/builder',   icon: '🔧', label: 'Build Config' },
];

export default function Sidebar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = JSON.parse(localStorage.getItem('user') || '{}');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleSidebar = (e) => {
        if (e) e.stopPropagation();
        setIsCollapsed(c => !c);
    };

    const handleSidebarClick = () => {
        if (isCollapsed) setIsCollapsed(false);
    };

    return (
        <aside
            className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}
            onClick={handleSidebarClick}
            style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
        >
            {/* Collapse toggle */}
            <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
                {isCollapsed ? '»' : '«'}
            </button>

            {/* Branding */}
            <div className="sidebar-header">
                <Link to="/dashboard" className="sidebar-brand">
                    <span className="brand-icon">🚲</span>
                    {!isCollapsed && <span className="brand-text">Hero Cycles</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
                        title={label}
                    >
                        <span className="link-icon">{icon}</span>
                        {!isCollapsed && <span className="link-text">{label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Footer — user + logout */}
            <div className="sidebar-footer">
                <div className="user-profile-sidebar">
                    <div className="avatar">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <span className="username">{user.username}</span>
                            <span className="role">Admin</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={logout}
                    className="btn btn-secondary w-full sidebar-logout-btn"
                    title="Logout"
                >
                    <span className="link-icon">🚪</span>
                    {!isCollapsed && <span className="link-text">Logout</span>}
                </button>
            </div>
        </aside>
    );
}