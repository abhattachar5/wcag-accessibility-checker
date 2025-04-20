import React, { useState } from 'react';

const HtmlInput = ({ onAnalyze, onComprehensiveTest }) => {
    const [htmlContent, setHtmlContent] = useState('');

    const handleChange = (e) => {
        setHtmlContent(e.target.value);
    };

    return (
        <>
            <textarea
                id="html-input"
                placeholder="Paste your HTML code here..."
                value={htmlContent}
                onChange={handleChange}
            />
            <div>
                <button
                    onClick={() => onAnalyze(htmlContent)}
                >
                    Run Basic A11y Test
                </button>
                <button
                    onClick={() => onComprehensiveTest(htmlContent)}
                >
                    Run Full WCAG 2.1 AA Test
                </button>
            </div>
        </>
    );
};

export default HtmlInput;