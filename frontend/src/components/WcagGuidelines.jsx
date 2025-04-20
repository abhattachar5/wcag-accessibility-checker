import React from 'react';

const WcagGuidelines = () => {
    return (
        <>
            <h2>WCAG 2.1 AA Guidelines Overview</h2>

            <div className="wcag-principle">
                <h3>1. Perceivable</h3>
                <p>Information and user interface components must be presentable to users in ways they can perceive.</p>
                <ul>
                    <li><strong>1.1 Text Alternatives:</strong> Provide text alternatives for non-text content</li>
                    <li><strong>1.2 Time-based Media:</strong> Provide alternatives for time-based media</li>
                    <li><strong>1.3 Adaptable:</strong> Create content that can be presented in different ways without losing information</li>
                    <li><strong>1.4 Distinguishable:</strong> Make it easier for users to see and hear content</li>
                </ul>
            </div>

            <div className="wcag-principle">
                <h3>2. Operable</h3>
                <p>User interface components and navigation must be operable.</p>
                <ul>
                    <li><strong>2.1 Keyboard Accessible:</strong> Make all functionality available from a keyboard</li>
                    <li><strong>2.2 Enough Time:</strong> Provide users enough time to read and use content</li>
                    <li><strong>2.3 Seizures and Physical Reactions:</strong> Do not design content in a way that is known to cause seizures</li>
                    <li><strong>2.4 Navigable:</strong> Provide ways to help users navigate, find content, and determine where they are</li>
                    <li><strong>2.5 Input Modalities:</strong> Make it easier for users to operate functionality through various inputs beyond keyboard</li>
                </ul>
            </div>

            <div className="wcag-principle">
                <h3>3. Understandable</h3>
                <p>Information and the operation of user interface must be understandable.</p>
                <ul>
                    <li><strong>3.1 Readable:</strong> Make text content readable and understandable</li>
                    <li><strong>3.2 Predictable:</strong> Make Web pages appear and operate in predictable ways</li>
                    <li><strong>3.3 Input Assistance:</strong> Help users avoid and correct mistakes</li>
                </ul>
            </div>

            <div className="wcag-principle">
                <h3>4. Robust</h3>
                <p>Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.</p>
                <ul>
                    <li><strong>4.1 Compatible:</strong> Maximize compatibility with current and future user agents, including assistive technologies</li>
                </ul>
            </div>
        </>
    );
};

export default WcagGuidelines;