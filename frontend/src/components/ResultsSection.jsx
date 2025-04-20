import React from 'react';

const ResultsSection = ({ results }) => {
    // Function to get impact class
    const getImpactClass = (impact) => {
        return `impact-${impact || 'minor'}`;
    };

    // Function to format element as HTML string
    const formatElement = (element) => {
        if (!element) return 'Unknown element';

        let elementStr = element.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return (
            <span
                className="element-highlight"
                dangerouslySetInnerHTML={{ __html: elementStr }}
            />
        );
    };

    return (
        <div id="results" className="result-section">
            <h2>Accessibility Results</h2>
            <div className="summary" id="summary">
                <div className="summary-item summary-violations">
                    <h4>Violations</h4>
                    <p>{results.violations.length} issues found</p>
                </div>
                <div className="summary-item summary-needs-review">
                    <h4>Needs Review</h4>
                    <p>{results.incomplete.length} items to check</p>
                </div>
                <div className="summary-item summary-passes">
                    <h4>Passes</h4>
                    <p>{results.passes.length} tests passed</p>
                </div>
            </div>

            <div id="violations-container">
                <h3>Violations</h3>
                <div id="violations">
                    {results.violations.length === 0 ? (
                        <p>No violations found!</p>
                    ) : (
                        results.violations.map((violation, index) => {
                            // Get WCAG tags
                            const wcagTags = violation.tags
                                .filter(tag => tag.startsWith('wcag'))
                                .map(tag => {
                                    // Convert tag to WCAG criterion format
                                    if (tag.match(/wcag\d\d\d/)) {
                                        // Format: wcag111 -> 1.1.1
                                        const digits = tag.replace('wcag', '');
                                        return `${digits[0]}.${digits[1]}.${digits[2]}`;
                                    } else if (tag.match(/wcag\d[a-z]\d/)) {
                                        // Format: wcag2a1 -> 2.1.1
                                        const parts = tag.replace('wcag', '');
                                        return `${parts[0]}.${parts[1]}.${parts[2]}`;
                                    } else if (tag.match(/wcag\d\d[a-z]\d/)) {
                                        // Format: wcag21a1 -> 2.1.1 (WCAG 2.1)
                                        const parts = tag.replace('wcag', '');
                                        return `${parts[0]}.${parts[1]}.${parts[3]}`;
                                    }
                                    return tag;
                                });

                            return (
                                <div key={`violation-${index}`} className="violation">
                                    <h4>
                                        {violation.id}: {violation.help} -
                                        <span className={getImpactClass(violation.impact)}>
                                            {violation.impact || 'moderate'}
                                        </span>
                                    </h4>
                                    <p>{violation.description}</p>
                                    <p><strong>WCAG:</strong> {wcagTags.join(', ')}</p>
                                    <details>
                                        <summary>Affected Elements ({violation.nodes.length})</summary>
                                        {violation.nodes.map((node, nodeIndex) => (
                                            <div key={`node-${nodeIndex}`}>
                                                <p><strong>Element:</strong> {formatElement(node.html)}</p>
                                                <p><strong>Issue:</strong> {node.failureSummary}</p>
                                            </div>
                                        ))}
                                    </details>
                                    <details>
                                        <summary>How to fix</summary>
                                        <p>{violation.help}</p>
                                        <p>
                                            <a
                                                href={violation.helpUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Learn more about this issue
                                            </a>
                                        </p>
                                    </details>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div id="incomplete-container">
                <h3>Needs Review</h3>
                <div id="incomplete">
                    {results.incomplete.length === 0 ? (
                        <p>No items need review!</p>
                    ) : (
                        results.incomplete.map((incomplete, index) => (
                            <div key={`incomplete-${index}`} className="needs-review">
                                <h4>{incomplete.id}: {incomplete.help}</h4>
                                <p>{incomplete.description}</p>
                                <details>
                                    <summary>Elements to Check ({incomplete.nodes.length})</summary>
                                    {incomplete.nodes.map((node, nodeIndex) => (
                                        <div key={`node-${nodeIndex}`}>
                                            <p><strong>Element:</strong> {formatElement(node.html)}</p>
                                            <p><strong>Issue:</strong> {node.failureSummary || 'Manual check required'}</p>
                                        </div>
                                    ))}
                                </details>
                                <details>
                                    <summary>How to check</summary>
                                    <p>
                                        <a
                                            href={incomplete.helpUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Learn more about this check
                                        </a>
                                    </p>
                                </details>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div id="passes-container">
                <h3>Passes</h3>
                <div id="passes">
                    {results.passes.length === 0 ? (
                        <p>No passes detected!</p>
                    ) : (
                        results.passes.map((pass, index) => (
                            <div key={`pass-${index}`} className="passes">
                                <h4>{pass.id}: {pass.help}</h4>
                                <p>{pass.description}</p>
                                <p><strong>Elements Checked:</strong> {pass.nodes.length}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsSection;