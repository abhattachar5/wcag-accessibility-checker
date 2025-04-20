import React from 'react';

const KeyboardResults = ({ results }) => {
    return (
        <div id="keyboard-results" className="result-section">
            <h2>Keyboard Navigation Results</h2>
            <div className="summary" id="keyboard-summary">
                <div className={`summary-item ${results.report.hasPotentialKeyboardTraps ? 'summary-violations' : 'summary-passes'}`}>
                    <h4>Keyboard Accessibility</h4>
                    <p>{results.report.totalReachedByKeyboard} of {results.report.totalFocusableElements} elements reachable by keyboard</p>
                </div>
                <div className={`summary-item ${results.potentialTraps.length > 0 ? 'summary-violations' : 'summary-passes'}`}>
                    <h4>Keyboard Traps</h4>
                    <p>{results.potentialTraps.length} potential traps found</p>
                </div>
                <div className={`summary-item ${results.elementsWithoutFocusStyles.length > 0 ? 'summary-needs-review' : 'summary-passes'}`}>
                    <h4>Focus Visibility</h4>
                    <p>{results.elementsWithoutFocusStyles.length} elements lack visible focus</p>
                </div>
            </div>

            <div id="focus-order">
                <h3>Focus Order</h3>
                <div id="focus-order-list">
                    {results.focusOrder.length === 0 ? (
                        <p>No focusable elements detected!</p>
                    ) : (
                        results.focusOrder.map((item, index) => (
                            <div key={`focus-item-${index}`} className="focus-item">
                                <h4>Tab Index #{index + 1}: {item.tagName}</h4>
                                <p><strong>Element Text:</strong> {item.text || '[No text content]'}</p>
                                <p><strong>Element Role:</strong> {item.role || 'None'}</p>
                                <p><strong>Has Focus Styles:</strong> {item.hasFocusStyles ? 'Yes' : 'No'}</p>
                                <details>
                                    <summary>Element HTML</summary>
                                    <div className="element-highlight" dangerouslySetInnerHTML={{ __html: item.outerHTML }} />
                                </details>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div id="keyboard-traps">
                <h3>Potential Keyboard Traps</h3>
                <div id="keyboard-traps-list">
                    {results.potentialTraps.length === 0 ? (
                        <p>No keyboard traps detected!</p>
                    ) : (
                        results.potentialTraps.map((trap, index) => (
                            <div key={`trap-${index}`} className="violation">
                                <h4>Potential Keyboard Trap #{index + 1}</h4>
                                <p><strong>Element:</strong> {trap.tagName}</p>
                                <p><strong>Element Text:</strong> {trap.text || '[No text content]'}</p>
                                <div className="element-highlight" dangerouslySetInnerHTML={{ __html: trap.outerHTML }} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div id="focus-styles">
                <h3>Missing Focus Styles</h3>
                <div id="focus-styles-list">
                    {results.elementsWithoutFocusStyles.length === 0 ? (
                        <p>All focusable elements have visible focus indicators!</p>
                    ) : (
                        results.elementsWithoutFocusStyles.map((element, index) => (
                            <div key={`focus-style-${index}`} className="needs-review">
                                <h4>Missing Focus Style #{index + 1}</h4>
                                <p><strong>Element:</strong> {element.tagName}</p>
                                <p><strong>Element Text:</strong> {element.text || '[No text content]'}</p>
                                <div className="element-highlight" dangerouslySetInnerHTML={{ __html: element.outerHTML }} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default KeyboardResults;