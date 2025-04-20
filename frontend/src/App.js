// This is the primary App.js file for the React version

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Component imports
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import HtmlInput from './components/HtmlInput';
import UrlInput from './components/UrlInput';
import WcagGuidelines from './components/WcagGuidelines';
import AboutEnhancements from './components/AboutEnhancements';
import ResultsSection from './components/ResultsSection';
import KeyboardResults from './components/KeyboardResults';
import ScreenReaderResults from './components/ScreenReaderResults';
import WcagReport from './components/WcagReport';
import Spinner from './components/Spinner';

function App() {
    // State management
    const [activeTab, setActiveTab] = useState('html-tab');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [keyboardResults, setKeyboardResults] = useState(null);
    const [screenReaderResults, setScreenReaderResults] = useState(null);
    const [wcagReport, setWcagReport] = useState(null);
    const [visibleResult, setVisibleResult] = useState(null);

    // API endpoints and base URL
    const API_BASE_URL = 'http://localhost:3000';

    // Function to handle tab switching
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // Function to hide all results
    const hideAllResults = () => {
        setVisibleResult(null);
    };

    // Function to analyze HTML
    const analyzeHtml = async (htmlContent) => {
        if (!htmlContent.trim()) {
            alert('Please enter some HTML code to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-html`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: htmlContent })
            });

            const data = await response.json();
            setResults(data.results);
            setVisibleResult('basic');
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing HTML: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to analyze URL
    const analyzeUrl = async (url) => {
        if (!url.trim()) {
            alert('Please enter a URL to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            setResults(data.results);
            setVisibleResult('basic');
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing URL: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to test keyboard navigation
    const testKeyboardNavigation = async (url) => {
        if (!url.trim()) {
            alert('Please enter a URL to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/test-keyboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            setKeyboardResults(data.results);
            setVisibleResult('keyboard');
        } catch (error) {
            console.error('Error:', error);
            alert('Error testing keyboard navigation: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to test screen reader accessibility
    const testScreenReader = async (url) => {
        if (!url.trim()) {
            alert('Please enter a URL to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/simulate-screen-reader`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            setScreenReaderResults(data.results);
            setVisibleResult('screenReader');
        } catch (error) {
            console.error('Error:', error);
            alert('Error simulating screen reader: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to generate full WCAG report
    const generateWcagReport = async (url) => {
        if (!url.trim()) {
            alert('Please enter a URL to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/generate-wcag-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            setWcagReport(data.report);
            setVisibleResult('wcagReport');
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating WCAG report: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Comprehensive HTML test
    const comprehensiveHtmlTest = async (htmlContent) => {
        if (!htmlContent.trim()) {
            alert('Please enter some HTML code to check');
            return;
        }

        setIsLoading(true);
        hideAllResults();

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-html`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: htmlContent })
            });

            const data = await response.json();

            // Create a simplified report structure
            const wcagMapping = data.results.wcagMapping || {};
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalCriteria: Object.keys(wcagMapping).length,
                    passedCriteria: Object.values(wcagMapping).filter(c => c.status === 'passes').length,
                    violationCriteria: Object.values(wcagMapping).filter(c => c.status === 'violations').length,
                    needsReviewCriteria: Object.values(wcagMapping).filter(c => c.status === 'needs-review').length,
                    notTestedCriteria: Object.values(wcagMapping).filter(c => c.status === 'not-tested').length,
                    notApplicableCriteria: Object.values(wcagMapping).filter(c => c.status === 'not-applicable').length
                },
                criteriaResults: wcagMapping,
                additionalTests: data.results.additionalTests || {}
            };

            // Calculate compliance score
            const applicableCriteria = report.summary.totalCriteria - (report.summary.notApplicableCriteria || 0);
            report.summary.complianceScore = Math.round((report.summary.passedCriteria / (applicableCriteria - report.summary.notTestedCriteria)) * 100) || 0;

            setWcagReport(report);
            setVisibleResult('wcagReport');
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing HTML: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <Header />

            <TabNavigation
                activeTab={activeTab}
                handleTabChange={handleTabChange}
            />

            <div id="html-tab" className={`tab-content ${activeTab === 'html-tab' ? 'active' : ''}`}>
                <HtmlInput
                    onAnalyze={analyzeHtml}
                    onComprehensiveTest={comprehensiveHtmlTest}
                />
            </div>

            <div id="url-tab" className={`tab-content ${activeTab === 'url-tab' ? 'active' : ''}`}>
                <UrlInput
                    onAnalyze={analyzeUrl}
                    onKeyboardTest={testKeyboardNavigation}
                    onScreenReaderTest={testScreenReader}
                    onGenerateWcagReport={generateWcagReport}
                />
            </div>

            <div id="wcag-guidelines" className={`tab-content ${activeTab === 'wcag-guidelines' ? 'active' : ''}`}>
                <WcagGuidelines />
            </div>

            <div id="about-tab" className={`tab-content ${activeTab === 'about-tab' ? 'active' : ''}`}>
                <AboutEnhancements />
            </div>

            {isLoading && <Spinner />}

            {visibleResult === 'basic' && results && (
                <ResultsSection results={results} />
            )}

            {visibleResult === 'keyboard' && keyboardResults && (
                <KeyboardResults results={keyboardResults} />
            )}

            {visibleResult === 'screenReader' && screenReaderResults && (
                <ScreenReaderResults results={screenReaderResults} />
            )}

            {visibleResult === 'wcagReport' && wcagReport && (
                <WcagReport report={wcagReport} />
            )}
        </div>
    );
}

export default App;