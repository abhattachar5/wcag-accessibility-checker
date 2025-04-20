import React from 'react';

const ScreenReaderResults = ({ results }) => {
    return (
        <div id="screen-reader-results" className="result-section">
            <h2>Screen Reader Simulation Results</h2>
            <div className="summary" id="screen-reader-summary">
                <div className={`summary-item ${results.issues.length > 0 ? 'summary-needs-review' : 'summary-passes'}`}>
                    <h4>Screen Reader Issues</h4>
                    <p>{results.issues.length} issues detected</p>
                </div>
                <div className="summary-item summary-needs-review">
                    <h4>Accessibility Tree</h4>
                    <p>{results.summary.totalNodes} nodes in tree</p>
                </div>
                <div className={`summary-item ${!results.summary.pageLanguage ? 'summary-violations' : 'summary-passes'}`}>
                    <h4>Page Language</h4>
                    <p>{results.summary.pageLanguage || 'Not specified'}</p>
                </div>
            </div>

            <div id="screen-reader-issues">
                <h3>Screen Reader Issues</h3>
                <div id="screen-reader-issues-list">
                    {results.issues.length === 0 ? (
                        <p>No screen reader issues detected!</p>
                    ) : (
                        results.issues.map((issue, index) => {
                            let elementsHtml = '';
                            if (issue.elements && issue.elements.length > 0) {
                                elementsHtml = (
                                    <details>
                                        <summary>Affected Elements ({issue.elements.length})</summary>
                                        {issue.elements.map((element, elementIndex) => (
                                            <div key={`element-${elementIndex}`}>
                                                <p><strong>Role:</strong> {element.role || 'None'}</p>
                                                <p><strong>Name:</strong> {element.name || 'None'}</p>
                                            </div>
                                        ))}
                                    </details>
                                );
                            }

                            return (
                                <div key={`issue-${index}`} className="screen-reader-issue">
                                    <h4>{issue.type}: {issue.description}</h4>
                                    <p><strong>WCAG Criterion:</strong> {issue.wcagCriterion || 'Multiple'}</p>
                                    <p><strong>Count:</strong> {issue.count || 'N/A'}</p>
                                    {elementsHtml}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div id="accessibility-tree">
                <h3>Accessibility Tree Preview</h3>
                <details>
                    <summary>Click to expand accessibility tree</summary>
                    <div id="accessibility-tree-view" style={{ maxHeight: '400px', overflowY: 'auto', fontSize: '0.9em' }}>
                        {!results.accessibilityTree || results.accessibilityTree.length === 0 ? (
                            <p>No accessibility tree data available.</p>
                        ) : (
                            <TreeView nodes={results.accessibilityTree.slice(0, 50)} />
                        )}
                        {results.accessibilityTree && results.accessibilityTree.length > 50 && (
                            <p><em>Showing first 50 nodes of the accessibility tree...</em></p>
                        )}
                    </div>
                </details>
            </div>
        </div>
    );
};

// Helper component to render the tree view
const TreeView = ({ nodes }) => {
    const renderNode = (node, depth = 0, index) => {
        const padding = depth * 20; // Indent based on depth

        return (
            <li key={`tree-node-${index}`} style={{ marginBottom: '5px' }}>
                <div style={{
                    paddingLeft: `${padding}px`,
                    borderLeft: '2px solid #ddd',
                    paddingTop: '3px',
                    paddingBottom: '3px'
                }}>
                    <strong>{node.role || 'unknown'}</strong>
                    {node.name ? `: "${node.name}"` : ''}
                    {node.value ? ` (value: "${node.value}")` : ''}
                </div>
                {node.children && (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {node.children.map((child, childIndex) =>
                            renderNode(child, depth + 1, `${index}-${childIndex}`)
                        )}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {nodes.map((node, index) => renderNode(node, 0, index))}
        </ul>
    );
};

export default ScreenReaderResults;