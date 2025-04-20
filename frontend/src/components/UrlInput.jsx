import React, { useState } from 'react';

const UrlInput = ({
    onAnalyze,
    onKeyboardTest,
    onScreenReaderTest,
    onGenerateWcagReport
}) => {
    const [url, setUrl] = useState('');

    const handleChange = (e) => {
        setUrl(e.target.value);
    };

    return (
        <>
            <input
                type="text"
                id="url-input"
                placeholder="Enter a URL to check (e.g., https://example.com)"
                value={url}
                onChange={handleChange}
            />
            <div>
                <button onClick={() => onAnalyze(url)}>
                    Run Basic A11y Test
                </button>
                <button onClick={() => onKeyboardTest(url)}>
                    Test Keyboard Navigation
                </button>
                <button onClick={() => onScreenReaderTest(url)}>
                    Test Screen Reader Access
                </button>
                <button onClick={() => onGenerateWcagReport(url)}>
                    Generate Full WCAG 2.1 AA Report
                </button>
            </div>
        </>
    );
};

export default UrlInput;