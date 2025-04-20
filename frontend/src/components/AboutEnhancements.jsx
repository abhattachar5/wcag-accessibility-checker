import React from 'react';

const AboutEnhancements = () => {
    return (
        <>
            <h2>Phase 1 Enhancements</h2>
            <p>This version of the WCAG 2.1 AA Accessibility Checker includes several important improvements to expand automated testing coverage.</p>

            <h3>New and Enhanced Tests</h3>
            <div className="test-info-panel">
                <h4><span className="test-badge badge-enhanced">Enhanced</span> 1.3.4 Orientation</h4>
                <p>We've significantly improved our testing for orientation restrictions by comparing content visibility and interaction in portrait vs. landscape orientations.</p>
                <p>The test now checks:</p>
                <ul>
                    <li>Content visibility in different orientations</li>
                    <li>Interactive elements accessibility in both portrait and landscape</li>
                    <li>Meta tags that might restrict orientation</li>
                </ul>
            </div>

            <div className="test-info-panel">
                <h4><span className="test-badge badge-new">New</span> 1.4.2 Audio Control</h4>
                <p>New test that detects audio content that may autoplay and checks if proper controls are provided.</p>
                <p>The test identifies:</p>
                <ul>
                    <li>Audio and video elements with autoplay enabled</li>
                    <li>Whether these elements provide controls or are muted by default</li>
                    <li>Embedded media that may contain audio</li>
                </ul>
            </div>

            <div className="test-info-panel">
                <h4><span className="test-badge badge-enhanced">Enhanced</span> 1.4.12 Text Spacing</h4>
                <p>Enhanced text spacing testing with more comprehensive checks for text containment issues when spacing is adjusted.</p>
                <p>Improvements include:</p>
                <ul>
                    <li>Detection of fixed-size containers that may clip expanded text</li>
                    <li>Checking for text truncation with ellipsis</li>
                    <li>Testing for elements with overflow: hidden that might hide content</li>
                </ul>
            </div>

            <div className="test-info-panel">
                <h4><span className="test-badge badge-new">New</span> 4.1.1 Parsing</h4>
                <p>New HTML validation test that checks for proper HTML structure and syntax.</p>
                <p>The test checks for:</p>
                <ul>
                    <li>Unclosed tags or improperly nested elements</li>
                    <li>Duplicate IDs</li>
                    <li>Invalid nesting patterns</li>
                </ul>
            </div>

            <div className="test-info-panel">
                <h4><span className="test-badge badge-new">New</span> Media Content Detection</h4>
                <p>New functionality to detect media content on the page and provide guidance for manual testing of WCAG 1.2.x criteria.</p>
                <p>Benefits:</p>
                <ul>
                    <li>Identifies audio and video elements that need captions or transcripts</li>
                    <li>Flags embedded media from platforms like YouTube, Vimeo, etc.</li>
                    <li>Provides specific information to guide manual testing</li>
                </ul>
            </div>
        </>
    );
};

export default AboutEnhancements;