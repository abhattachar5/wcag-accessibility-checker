import React from 'react';

const TabNavigation = ({ activeTab, handleTabChange }) => {
    return (
        <div className="tabs">
            <button
                className={`tab ${activeTab === 'html-tab' ? 'active' : ''}`}
                onClick={() => handleTabChange('html-tab')}
            >
                HTML Code
            </button>
            <button
                className={`tab ${activeTab === 'url-tab' ? 'active' : ''}`}
                onClick={() => handleTabChange('url-tab')}
            >
                URL
            </button>
            <button
                className={`tab ${activeTab === 'wcag-guidelines' ? 'active' : ''}`}
                onClick={() => handleTabChange('wcag-guidelines')}
            >
                WCAG 2.1 AA Guidelines
            </button>
            <button
                className={`tab ${activeTab === 'about-tab' ? 'active' : ''}`}
                onClick={() => handleTabChange('about-tab')}
            >
                About Phase 1 Enhancements
            </button>
        </div>
    );
};

export default TabNavigation;