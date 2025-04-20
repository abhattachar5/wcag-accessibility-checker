import React, { useState, useEffect } from 'react';

const WcagReport = ({ report }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedLevels, setSelectedLevels] = useState(['A', 'AA']);
    const [selectedPrinciples, setSelectedPrinciples] = useState(['1', '2', '3', '4']);
    const [filteredCriteria, setFilteredCriteria] = useState({});

    // Helper function to get status class for WCAG criteria
    const getStatusClass = (status) => {
        switch (status) {
            case 'passes':
                return 'minor';
            case 'violations':
                return 'critical';
            case 'needs-review':
                return 'moderate';
            case 'not-tested':
            case 'not-applicable':
                return 'minor';
            default:
                return 'minor';
        }
    };

    // Helper function to format status text
    const formatStatus = (status) => {
        switch (status) {
            case 'passes':
                return 'Passes';
            case 'violations':
                return 'Violations';
            case 'needs-review':
                return 'Needs Review';
            case 'not-tested':
                return 'Not Tested';
            case 'not-applicable':
                return 'Not Applicable';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
        }
    };

    // Helper function to safely render objects or complex data
    const renderComplexData = (data) => {
        if (data === null || data === undefined) {
            return 'None';
        }

        if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
            return String(data);
        }

        if (Array.isArray(data)) {
            return JSON.stringify(data);
        }

        if (typeof data === 'object') {
            return <pre>{JSON.stringify(data, null, 2)}</pre>;
        }

        return String(data);
    };

    // Handle filter button click
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    // Handle level checkbox change
    const handleLevelChange = (e) => {
        const level = e.target.value;
        if (e.target.checked) {
            setSelectedLevels([...selectedLevels, level]);
        } else {
            setSelectedLevels(selectedLevels.filter(l => l !== level));
        }
    };

    // Handle principle checkbox change
    const handlePrincipleChange = (e) => {
        const principle = e.target.value;
        if (e.target.checked) {
            setSelectedPrinciples([...selectedPrinciples, principle]);
        } else {
            setSelectedPrinciples(selectedPrinciples.filter(p => p !== principle));
        }
    };

    // Apply filters to criteria
    useEffect(() => {
        if (!report || !report.criteriaResults) return;

        // Group criteria by principle
        const principles = {
            '1': { name: 'Perceivable', criteria: [] },
            '2': { name: 'Operable', criteria: [] },
            '3': { name: 'Understandable', criteria: [] },
            '4': { name: 'Robust', criteria: [] }
        };

        // Filter and organize criteria
        Object.entries(report.criteriaResults).forEach(([criterionId, criterionData]) => {
            const principle = criterionId.charAt(0);
            const matchesFilter = activeFilter === 'all' || criterionData.status === activeFilter;
            const matchesLevel = selectedLevels.includes(criterionData.level);
            const matchesPrinciple = selectedPrinciples.includes(principle);

            if (matchesFilter && matchesLevel && matchesPrinciple && principles[principle]) {
                principles[principle].criteria.push({
                    id: criterionId,
                    ...criterionData,
                    visible: true
                });
            }
        });

        // Sort criteria within each principle
        Object.keys(principles).forEach(key => {
            principles[key].criteria.sort((a, b) => {
                return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
            });
        });

        setFilteredCriteria(principles);
    }, [report, activeFilter, selectedLevels, selectedPrinciples]);

    if (!report) {
        return <div className="result-section">Loading report data...</div>;
    }

    return (
        <div id="wcag-report" className="result-section">
            <h2>WCAG 2.1 AA Compliance Report</h2>

            <div className="summary" id="wcag-summary">
                <div className={`summary-item ${report.summary.complianceScore >= 90 ? 'summary-passes' : (report.summary.complianceScore >= 70 ? 'summary-needs-review' : 'summary-violations')}`}>
                    <h4>Compliance Score</h4>
                    <p>{report.summary.complianceScore}%</p>
                </div>
                <div className="summary-item summary-passes">
                    <h4>Criteria Passed</h4>
                    <p>{report.summary.passedCriteria} of {report.summary.totalCriteria}</p>
                </div>
                <div className="summary-item summary-violations">
                    <h4>Criteria Failed</h4>
                    <p>{report.summary.violationCriteria} of {report.summary.totalCriteria}</p>
                </div>
                <div className="summary-item summary-needs-review">
                    <h4>Needs Review</h4>
                    <p>{report.summary.needsReviewCriteria} of {report.summary.totalCriteria}</p>
                </div>
                <div className="summary-item summary-na">
                    <h4>Not Applicable</h4>
                    <p>{report.summary.notApplicableCriteria || 0} of {report.summary.totalCriteria}</p>
                </div>
            </div>

            <div className="toolbar">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('all')}
                >
                    All Criteria
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'violations' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('violations')}
                >
                    Violations
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'passes' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('passes')}
                >
                    Passes
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'needs-review' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('needs-review')}
                >
                    Needs Review
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'not-tested' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('not-tested')}
                >
                    Not Tested
                </button>
                <button
                    className={`filter-btn ${activeFilter === 'not-applicable' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('not-applicable')}
                >
                    Not Applicable
                </button>
            </div>

            <div className="checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="level-filter"
                        value="A"
                        checked={selectedLevels.includes('A')}
                        onChange={handleLevelChange}
                    /> Level A
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="level-filter"
                        value="AA"
                        checked={selectedLevels.includes('AA')}
                        onChange={handleLevelChange}
                    /> Level AA
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="principle-filter"
                        value="1"
                        checked={selectedPrinciples.includes('1')}
                        onChange={handlePrincipleChange}
                    /> Perceivable
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="principle-filter"
                        value="2"
                        checked={selectedPrinciples.includes('2')}
                        onChange={handlePrincipleChange}
                    /> Operable
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="principle-filter"
                        value="3"
                        checked={selectedPrinciples.includes('3')}
                        onChange={handlePrincipleChange}
                    /> Understandable
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="principle-filter"
                        value="4"
                        checked={selectedPrinciples.includes('4')}
                        onChange={handlePrincipleChange}
                    /> Robust
                </label>
            </div>

            <div id="wcag-criteria-results">
                <h3>WCAG 2.1 AA Criteria Results</h3>
                <div id="wcag-criteria-list">
                    {Object.entries(filteredCriteria).map(([principleNum, principleData]) => {
                        if (principleData.criteria.length === 0) return null;

                        return (
                            <div
                                key={`principle-${principleNum}`}
                                className="wcag-principle"
                                data-principle={principleNum}
                            >
                                <h3>{principleNum}. {principleData.name}</h3>
                                {principleData.criteria.map(criterion => (
                                    <div
                                        key={`criterion-${criterion.id}`}
                                        className={`wcag-criterion wcag-${criterion.status}`}
                                        data-status={criterion.status}
                                        data-level={criterion.level}
                                        data-id={criterion.id}
                                    >
                                        <h4>{criterion.id}: {criterion.name} (Level {criterion.level})</h4>
                                        <p>{criterion.description}</p>
                                        <p>
                                            <strong>Status:</strong>
                                            <span className={`impact-${getStatusClass(criterion.status)}`}>
                                                {formatStatus(criterion.status)}
                                            </span>
                                        </p>

                                        {criterion.violations && criterion.violations.length > 0 && (
                                            <details>
                                                <summary>Violations ({criterion.violations.length})</summary>
                                                <ul>
                                                    {criterion.violations.map((v, idx) => (
                                                        <li key={`violation-${idx}`}>
                                                            <strong>{v.description || 'Issue'}</strong>
                                                            {v.count ? ` - ${v.count} instances` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {Object.values(filteredCriteria).every(p => p.criteria.length === 0) && (
                        <p>No criteria match the selected filters.</p>
                    )}
                </div>
            </div>

            {report.additionalTests && Object.keys(report.additionalTests).length > 0 && (
                <div id="additional-tests">
                    <h3>Additional Test Results</h3>

                    {report.additionalTests.orientation && (
                        <div id="orientation-results" className="test-info-panel">
                            <h4>1.3.4 Orientation Test Results</h4>
                            <div id="orientation-content">
                                <p>
                                    <strong>Status:</strong>
                                    {report.additionalTests.orientation.passes ? (
                                        <span className="impact-minor">Passes</span>
                                    ) : (
                                        <span className="impact-critical">Violations found</span>
                                    )}
                                </p>
                                <p>
                                    {report.additionalTests.orientation.description || 'Test completed.'}
                                </p>
                                {report.additionalTests.orientation.details && (
                                    <div>
                                        <strong>Details:</strong>
                                        {typeof report.additionalTests.orientation.details === 'object' ? (
                                            <div>
                                                {report.additionalTests.orientation.details.metaViewport && (
                                                    <p><strong>Meta Viewport:</strong> {report.additionalTests.orientation.details.metaViewport}</p>
                                                )}
                                                {report.additionalTests.orientation.details.cssMediaQueries && (
                                                    <div>
                                                        <p><strong>CSS Media Queries:</strong></p>
                                                        {renderComplexData(report.additionalTests.orientation.details.cssMediaQueries)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>{report.additionalTests.orientation.details}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {report.additionalTests.audioControl && (
                        <div id="audio-control-results" className="test-info-panel">
                            <h4>1.4.2 Audio Control Test Results</h4>
                            <div id="audio-control-content">
                                <p>
                                    <strong>Status:</strong>
                                    {report.additionalTests.audioControl.passes ? (
                                        <span className="impact-minor">Passes</span>
                                    ) : (
                                        <span className="impact-critical">Violations found</span>
                                    )}
                                </p>
                                <p>
                                    {report.additionalTests.audioControl.description || 'Test completed.'}
                                </p>
                                {report.additionalTests.audioControl.elements && (
                                    <ul>
                                        {report.additionalTests.audioControl.elements.length > 0 ? (
                                            report.additionalTests.audioControl.elements.map((el, idx) => (
                                                <li key={`audio-el-${idx}`}>{el}</li>
                                            ))
                                        ) : (
                                            <li>No audio elements detected</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {report.additionalTests.textSpacing && (
                        <div id="text-spacing-results" className="test-info-panel">
                            <h4>1.4.12 Text Spacing Test Results</h4>
                            <div id="text-spacing-content">
                                <p>
                                    <strong>Status:</strong>
                                    {report.additionalTests.textSpacing.passes ? (
                                        <span className="impact-minor">Passes</span>
                                    ) : (
                                        <span className="impact-critical">Violations found</span>
                                    )}
                                </p>
                                <p>
                                    {report.additionalTests.textSpacing.description || 'Test completed.'}
                                </p>
                                {report.additionalTests.textSpacing.details && (
                                    <details>
                                        <summary>Issue details</summary>
                                        <div>{renderComplexData(report.additionalTests.textSpacing.details)}</div>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}

                    {report.additionalTests.parsing && (
                        <div id="parsing-results" className="test-info-panel">
                            <h4>4.1.1 Parsing Test Results</h4>
                            <div id="parsing-content">
                                <p>
                                    <strong>Status:</strong>
                                    {report.additionalTests.parsing.passes ? (
                                        <span className="impact-minor">Passes</span>
                                    ) : (
                                        <span className="impact-critical">Violations found</span>
                                    )}
                                </p>
                                <p>
                                    {report.additionalTests.parsing.description || 'Test completed.'}
                                </p>
                                {report.additionalTests.parsing.errors && report.additionalTests.parsing.errors.length > 0 && (
                                    <details>
                                        <summary>Errors found ({report.additionalTests.parsing.errors.length})</summary>
                                        <ul>
                                            {report.additionalTests.parsing.errors.map((err, idx) => (
                                                <li key={`parsing-err-${idx}`}>{err}</li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}

                    {report.additionalTests.mediaDetection && (
                        <div id="media-detection-results" className="test-info-panel">
                            <h4>Media Content Detection</h4>
                            <div id="media-detection-content">
                                <p>
                                    {report.additionalTests.mediaDetection.description || 'Media detection completed.'}
                                </p>

                                {report.additionalTests.mediaDetection.mediaItems &&
                                    report.additionalTests.mediaDetection.mediaItems.length > 0 ? (
                                    <div className="media-grid">
                                        {report.additionalTests.mediaDetection.mediaItems.map((item, idx) => (
                                            <div key={`media-item-${idx}`} className="media-item">
                                                <h5>{item.type}</h5>
                                                <p>{item.description || ''}</p>
                                                <p>
                                                    <strong>WCAG Requirements:</strong>
                                                    {item.wcagRequirements || 'Needs review'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No media content detected.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WcagReport;