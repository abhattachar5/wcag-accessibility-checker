// server.js - Enhanced WCAG 2.1 AA Accessibility Testing Server
const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public')); // Serve static files

// Route to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WCAG 2.1 AA criteria lookup
const wcagCriteria = {
    // Perceivable
    '1.1.1': { name: 'Non-text Content', level: 'A', description: 'All non-text content has a text alternative.' },
    '1.2.1': { name: 'Audio-only and Video-only (Prerecorded)', level: 'A', description: 'Prerecorded audio-only and prerecorded video-only media have an alternative.' },
    '1.2.2': { name: 'Captions (Prerecorded)', level: 'A', description: 'Captions are provided for all prerecorded audio content in synchronized media.' },
    '1.2.3': { name: 'Audio Description or Media Alternative (Prerecorded)', level: 'A', description: 'An alternative for time-based media or audio description is provided for prerecorded video content.' },
    '1.2.4': { name: 'Captions (Live)', level: 'AA', description: 'Captions are provided for all live audio content in synchronized media.' },
    '1.2.5': { name: 'Audio Description (Prerecorded)', level: 'AA', description: 'Audio description is provided for all prerecorded video content in synchronized media.' },
    '1.3.1': { name: 'Info and Relationships', level: 'A', description: 'Information, structure, and relationships conveyed through presentation can be programmatically determined.' },
    '1.3.2': { name: 'Meaningful Sequence', level: 'A', description: 'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.' },
    '1.3.3': { name: 'Sensory Characteristics', level: 'A', description: 'Instructions do not rely solely on sensory characteristics.' },
    '1.3.4': { name: 'Orientation', level: 'AA', description: 'Content does not restrict its view and operation to a single display orientation.' },
    '1.3.5': { name: 'Identify Input Purpose', level: 'AA', description: 'The purpose of each input field collecting information about the user can be programmatically determined.' },
    '1.4.1': { name: 'Use of Color', level: 'A', description: 'Color is not used as the only visual means of conveying information.' },
    '1.4.2': { name: 'Audio Control', level: 'A', description: 'Audio that plays automatically has a mechanism to pause, stop, or control volume.' },
    '1.4.3': { name: 'Contrast (Minimum)', level: 'AA', description: 'Text has a contrast ratio of at least 4.5:1.' },
    '1.4.4': { name: 'Resize text', level: 'AA', description: 'Text can be resized without assistive technology up to 200 percent without loss of content or functionality.' },
    '1.4.5': { name: 'Images of Text', level: 'AA', description: 'Images of text are only used for decoration or where a particular presentation is essential.' },
    '1.4.10': { name: 'Reflow', level: 'AA', description: 'Content can be presented without scrolling in two dimensions.' },
    '1.4.11': { name: 'Non-text Contrast', level: 'AA', description: 'User interface components and graphical objects have a contrast ratio of at least 3:1.' },
    '1.4.12': { name: 'Text Spacing', level: 'AA', description: 'No loss of content occurs when text spacing is adjusted.' },
    '1.4.13': { name: 'Content on Hover or Focus', level: 'AA', description: 'Additional content that appears on hover or focus can be dismissed, hovered, and is persistent.' },

    // Operable
    '2.1.1': { name: 'Keyboard', level: 'A', description: 'All functionality is available from a keyboard.' },
    '2.1.2': { name: 'No Keyboard Trap', level: 'A', description: 'Keyboard focus can be moved away from a component using only the keyboard.' },
    '2.1.4': { name: 'Character Key Shortcuts', level: 'A', description: 'Keyboard shortcuts using only letter, punctuation, number, or symbol characters have a mechanism to turn them off or remap them.' },
    '2.2.1': { name: 'Timing Adjustable', level: 'A', description: 'Time limits have controls.' },
    '2.2.2': { name: 'Pause, Stop, Hide', level: 'A', description: 'Moving, blinking, or scrolling content has controls.' },
    '2.3.1': { name: 'Three Flashes or Below Threshold', level: 'A', description: 'No content flashes more than three times in one second.' },
    '2.4.1': { name: 'Bypass Blocks', level: 'A', description: 'A mechanism is available to bypass blocks of content that are repeated on multiple web pages.' },
    '2.4.2': { name: 'Page Titled', level: 'A', description: 'Web pages have titles that describe topic or purpose.' },
    '2.4.3': { name: 'Focus Order', level: 'A', description: 'Focus order preserves meaning and operability.' },
    '2.4.4': { name: 'Link Purpose (In Context)', level: 'A', description: 'The purpose of each link can be determined from the link text or link text together with programmatically determined link context.' },
    '2.4.5': { name: 'Multiple Ways', level: 'AA', description: 'More than one way is available to locate a web page within a set of web pages.' },
    '2.4.6': { name: 'Headings and Labels', level: 'AA', description: 'Headings and labels describe topic or purpose.' },
    '2.4.7': { name: 'Focus Visible', level: 'AA', description: 'Keyboard focus indicator is visible.' },
    '2.5.1': { name: 'Pointer Gestures', level: 'AA', description: 'All functionality that uses multipoint or path-based gestures has a single-point alternative.' },
    '2.5.2': { name: 'Pointer Cancellation', level: 'AA', description: 'Functions that can be operated using a single pointer have a mechanism to abort or undo the action.' },
    '2.5.3': { name: 'Label in Name', level: 'A', description: 'For user interface components with labels that include text, the name contains the text that is presented visually.' },
    '2.5.4': { name: 'Motion Actuation', level: 'AA', description: 'Functionality that can be operated by device motion or user motion can also be operated by user interface components.' },

    // Understandable
    '3.1.1': { name: 'Language of Page', level: 'A', description: 'The default human language of each web page can be programmatically determined.' },
    '3.1.2': { name: 'Language of Parts', level: 'AA', description: 'The human language of each passage or phrase in the content can be programmatically determined.' },
    '3.2.1': { name: 'On Focus', level: 'A', description: 'When any user interface component receives focus, it does not initiate a change of context.' },
    '3.2.2': { name: 'On Input', level: 'A', description: 'Changing the setting of any user interface component does not automatically cause a change of context.' },
    '3.2.3': { name: 'Consistent Navigation', level: 'AA', description: 'Navigational mechanisms that are repeated on multiple web pages appear in the same relative order each time they are repeated.' },
    '3.2.4': { name: 'Consistent Identification', level: 'AA', description: 'Components that have the same functionality are identified consistently.' },
    '3.3.1': { name: 'Error Identification', level: 'A', description: 'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.' },
    '3.3.2': { name: 'Labels or Instructions', level: 'A', description: 'Labels or instructions are provided when content requires user input.' },
    '3.3.3': { name: 'Error Suggestion', level: 'AA', description: 'If an input error is automatically detected and suggestions for correction are known, the suggestions are provided to the user.' },
    '3.3.4': { name: 'Error Prevention (Legal, Financial, Data)', level: 'AA', description: 'For web pages that cause legal commitments or financial transactions a mechanism is available for reviewing, confirming, and correcting information before finalizing the submission.' },

    // Robust
    '4.1.1': { name: 'Parsing', level: 'A', description: 'In content implemented using markup languages, elements have complete start and end tags, are nested according to specifications, and do not contain duplicate attributes.' },
    '4.1.2': { name: 'Name, Role, Value', level: 'A', description: 'For all user interface components, the name and role can be programmatically determined, and properties can be set by the user.' },
    '4.1.3': { name: 'Status Messages', level: 'AA', description: 'Status messages can be programmatically determined without receiving focus.' }
};

// Endpoint to fetch and analyze a webpage for WCAG 2.1 AA compliance
app.post('/analyze-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Launch puppeteer to fetch the page and run axe-core
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Inject and run axe-core
        await page.addScriptTag({
            path: require.resolve('axe-core')
        });

        // Run the accessibility tests with wcag21aa ruleset
        const results = await page.evaluate(() => {
            return new Promise((resolve) => {
                axe.configure({
                    // Specifically run WCAG 2.1 AA rules
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
                    }
                });

                axe.run(document, { reporter: 'v2' }, (err, results) => {
                    if (err) throw err;
                    resolve(results);
                });
            });
        });

        // Run additional WCAG 2.1 specific tests
        const wcag21Tests = await runAdditionalWCAG21Tests(page, url);

        await browser.close();

        // Map axe results to WCAG criteria
        const wcagMapping = mapAxeResultsToWCAG(results);

        // Merge in additional test results
        const combinedResults = {
            ...results,
            wcagMapping: { ...wcagMapping, ...wcag21Tests.wcagMapping },
            additionalTests: wcag21Tests.results
        };

        // Return the accessibility results
        res.json({ results: combinedResults });
    } catch (error) {
        console.error('Error analyzing URL:', error);
        res.status(500).json({
            error: 'Failed to analyze URL',
            message: error.message
        });
    }
});

// Endpoint to analyze raw HTML
app.post('/analyze-html', async (req, res) => {
    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        // Launch puppeteer to load the HTML and run axe-core
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Set the HTML content
        await page.setContent(html, { waitUntil: 'networkidle2' });

        // Inject and run axe-core
        await page.addScriptTag({
            path: require.resolve('axe-core')
        });

        // Run the accessibility tests with WCAG 2.1 AA ruleset
        const results = await page.evaluate(() => {
            return new Promise((resolve) => {
                axe.configure({
                    // Specifically run WCAG 2.1 AA rules
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
                    }
                });

                axe.run(document, { reporter: 'v2' }, (err, results) => {
                    if (err) throw err;
                    resolve(results);
                });
            });
        });

        // Run additional WCAG 2.1 specific tests
        const wcag21Tests = await runAdditionalWCAG21Tests(page);

        await browser.close();

        // Map axe results to WCAG criteria
        const wcagMapping = mapAxeResultsToWCAG(results);

        // Merge in additional test results
        const combinedResults = {
            ...results,
            wcagMapping: { ...wcagMapping, ...wcag21Tests.wcagMapping },
            additionalTests: wcag21Tests.results
        };

        // Return the accessibility results
        res.json({ results: combinedResults });
    } catch (error) {
        console.error('Error analyzing HTML:', error);
        res.status(500).json({
            error: 'Failed to analyze HTML',
            message: error.message
        });
    }
});

// Function to map axe-core results to WCAG 2.1 criteria
function mapAxeResultsToWCAG(axeResults) {
    const wcagMapping = {};

    // Initialize all WCAG 2.1 AA criteria as not tested
    Object.keys(wcagCriteria).forEach(criterionId => {
        if (wcagCriteria[criterionId].level === 'A' || wcagCriteria[criterionId].level === 'AA') {
            wcagMapping[criterionId] = {
                name: wcagCriteria[criterionId].name,
                level: wcagCriteria[criterionId].level,
                description: wcagCriteria[criterionId].description,
                status: 'not-tested',
                violations: []
            };
        }
    });

    // Process violations
    axeResults.violations.forEach(violation => {
        const wcagTags = violation.tags.filter(tag => tag.startsWith('wcag'));

        wcagTags.forEach(tag => {
            // Convert axe-core's tag format to WCAG criterion ID
            // e.g., 'wcag2aa' or 'wcag111' to '1.1.1'
            let criterionId;

            if (tag.match(/wcag\d\d\d/)) {
                // Format: wcag111 -> 1.1.1
                const digits = tag.replace('wcag', '');
                criterionId = `${digits[0]}.${digits[1]}.${digits[2]}`;
            } else if (tag.match(/wcag\d[a-z]\d/)) {
                // Format: wcag2a1 -> 2.1.1
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts[2]}`;
            } else if (tag.match(/wcag\d[a-z]\d\d/)) {
                // Format: wcag2a11 -> 2.1.11
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts.slice(2)}`;
            } else if (tag.match(/wcag\d\d[a-z]\d/)) {
                // Format: wcag21a1 -> 2.1.1 (WCAG 2.1)
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts[3]}`;
            } else if (tag.match(/wcag\d\d[a-z][a-z]/)) {
                // Format: wcag21aa -> 2.1 AA (level)
                return; // Skip level indicators
            }

            if (criterionId && wcagMapping[criterionId]) {
                wcagMapping[criterionId].status = 'violations';
                wcagMapping[criterionId].violations.push({
                    id: violation.id,
                    impact: violation.impact,
                    description: violation.description,
                    help: violation.help,
                    helpUrl: violation.helpUrl,
                    nodes: violation.nodes.length
                });
            }
        });
    });

    // Process passes
    axeResults.passes.forEach(pass => {
        const wcagTags = pass.tags.filter(tag => tag.startsWith('wcag'));

        wcagTags.forEach(tag => {
            // Convert axe-core's tag format to WCAG criterion ID
            let criterionId;

            if (tag.match(/wcag\d\d\d/)) {
                const digits = tag.replace('wcag', '');
                criterionId = `${digits[0]}.${digits[1]}.${digits[2]}`;
            } else if (tag.match(/wcag\d[a-z]\d/)) {
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts[2]}`;
            } else if (tag.match(/wcag\d[a-z]\d\d/)) {
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts.slice(2)}`;
            } else if (tag.match(/wcag\d\d[a-z]\d/)) {
                const parts = tag.replace('wcag', '');
                criterionId = `${parts[0]}.${parts[1]}.${parts[3]}`;
            } else if (tag.match(/wcag\d\d[a-z][a-z]/)) {
                return; // Skip level indicators
            }

            if (criterionId && wcagMapping[criterionId] && wcagMapping[criterionId].status !== 'violations') {
                wcagMapping[criterionId].status = 'passes';
            }
        });
    });

    return wcagMapping;
}

// Function to run additional tests specifically for WCAG 2.1 AA criteria
async function runAdditionalWCAG21Tests(page, url) {
    const results = {
        orientation: null,     // 1.3.4 Orientation
        audioControl: null,    // 1.4.2 Audio Control
        reflow: null,          // 1.4.10 Reflow
        textSpacing: null,     // 1.4.12 Text Spacing
        nonTextContrast: null, // 1.4.11 Non-text Contrast
        hoverFocus: null,      // 1.4.13 Content on Hover or Focus
        pointerGestures: null, // 2.5.1 Pointer Gestures
        motionActuation: null, // 2.5.4 Motion Actuation
        statusMessages: null,  // 4.1.3 Status Messages
        parsing: null,         // 4.1.1 Parsing
        mediaDetection: null   // Media Content Detection
    };

    const wcagMapping = {};

    // Test 1.3.4 Orientation
    results.orientation = await testOrientation(page);
    wcagMapping['1.3.4'] = {
        name: wcagCriteria['1.3.4'].name,
        level: wcagCriteria['1.3.4'].level,
        description: wcagCriteria['1.3.4'].description,
        status: results.orientation.passes ? 'passes' : 'violations',
        violations: results.orientation.passes ? [] : [{
            description: 'Content restricts its view to a single display orientation',
            impact: 'serious',
            details: results.orientation.details
        }]
    };

    // Test 1.4.2 Audio Control
    results.audioControl = await testAudioControl(page);
    wcagMapping['1.4.2'] = {
        name: wcagCriteria['1.4.2'].name,
        level: wcagCriteria['1.4.2'].level,
        description: wcagCriteria['1.4.2'].description,
        status: results.audioControl.passes ? 'passes' : 'violations',
        violations: results.audioControl.passes ? [] : [{
            description: 'Audio that plays automatically lacks proper controls',
            impact: 'serious',
            details: 'Some audio elements autoplay without controls or mute option'
        }]
    };

    // Test 1.4.10 Reflow
    results.reflow = await testReflow(page);
    wcagMapping['1.4.10'] = {
        name: wcagCriteria['1.4.10'].name,
        level: wcagCriteria['1.4.10'].level,
        description: wcagCriteria['1.4.10'].description,
        status: results.reflow.passes ? 'passes' : 'violations',
        violations: results.reflow.passes ? [] : [{
            description: 'Content does not reflow properly at 320px width',
            impact: 'serious',
            details: results.reflow.details
        }]
    };

    // Test 1.4.11 Non-text Contrast
    results.nonTextContrast = await testNonTextContrast(page);
    wcagMapping['1.4.11'] = {
        name: wcagCriteria['1.4.11'].name,
        level: wcagCriteria['1.4.11'].level,
        description: wcagCriteria['1.4.11'].description,
        status: results.nonTextContrast.violations.length === 0 ? 'needs-review' : 'violations',
        violations: results.nonTextContrast.violations.map(v => ({
            description: 'Non-text elements may not have sufficient contrast',
            impact: 'serious',
            details: v
        }))
    };

    // Test 1.4.12 Text Spacing
    results.textSpacing = await testTextSpacing(page);
    wcagMapping['1.4.12'] = {
        name: wcagCriteria['1.4.12'].name,
        level: wcagCriteria['1.4.12'].level,
        description: wcagCriteria['1.4.12'].description,
        status: results.textSpacing.passes ? 'passes' : 'violations',
        violations: results.textSpacing.passes ? [] : [{
            description: 'Content is lost when text spacing is adjusted',
            impact: 'serious',
            details: results.textSpacing.details
        }]
    };

    // Test 1.4.13 Content on Hover or Focus
    results.hoverFocus = await testContentOnHoverFocus(page);
    wcagMapping['1.4.13'] = {
        name: wcagCriteria['1.4.13'].name,
        level: wcagCriteria['1.4.13'].level,
        description: wcagCriteria['1.4.13'].description,
        status: results.hoverFocus.violations.length === 0 ? 'passes' : 'violations',
        violations: results.hoverFocus.violations.map(v => ({
            description: 'Content appearing on hover/focus does not meet requirements',
            impact: 'moderate',
            details: v
        }))
    };

    // Test 2.5.1 Pointer Gestures
    results.pointerGestures = await testPointerGestures(page);
    wcagMapping['2.5.1'] = {
        name: wcagCriteria['2.5.1'].name,
        level: wcagCriteria['2.5.1'].level,
        description: wcagCriteria['2.5.1'].description,
        status: results.pointerGestures.violations.length === 0 ? 'needs-review' : 'violations',
        violations: results.pointerGestures.violations.map(v => ({
            description: 'Multipoint or path-based gestures without single-point alternative',
            impact: 'serious',
            details: v
        }))
    };

    // Test 2.5.4 Motion Actuation
    results.motionActuation = await testMotionActuation(page);
    wcagMapping['2.5.4'] = {
        name: wcagCriteria['2.5.4'].name,
        level: wcagCriteria['2.5.4'].level,
        description: wcagCriteria['2.5.4'].description,
        status: 'needs-review', // Often requires manual verification
        violations: []
    };

    // Test 4.1.1 Parsing
    results.parsing = await testParsing(page);
    wcagMapping['4.1.1'] = {
        name: wcagCriteria['4.1.1'].name,
        level: wcagCriteria['4.1.1'].level,
        description: wcagCriteria['4.1.1'].description,
        status: results.parsing.passes ? 'passes' : 'violations',
        violations: results.parsing.passes ? [] : [{
            description: 'HTML parsing issues found',
            impact: 'moderate',
            details: `${results.parsing.errors.length} HTML structural issues detected`
        }]
    };

    // Test 4.1.3 Status Messages
    results.statusMessages = await testStatusMessages(page);
    wcagMapping['4.1.3'] = {
        name: wcagCriteria['4.1.3'].name,
        level: wcagCriteria['4.1.3'].level,
        description: wcagCriteria['4.1.3'].description,
        status: results.statusMessages.violations.length === 0 ? 'needs-review' : 'violations',
        violations: results.statusMessages.violations.map(v => ({
            description: 'Status messages may not be programmatically determined',
            impact: 'moderate',
            details: v
        }))
    };

    // Media Content Detection
    results.mediaDetection = await detectMediaContent(page);

    return { results, wcagMapping };
}

// Implementation of specific WCAG 2.1 AA tests

// Test for 1.3.4 Orientation
async function testOrientation(page) {
    // Check for meta viewport restrictions
    const orientationRestrictions = await page.evaluate(() => {
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (!metaViewport) return { hasRestrictions: false, details: 'No viewport meta tag found' };

        const content = metaViewport.getAttribute('content') || '';
        const hasOrientationLock = content.includes('orientation=portrait') ||
            content.includes('orientation=landscape');

        return {
            hasRestrictions: hasOrientationLock,
            details: hasOrientationLock ? `Viewport meta has orientation lock: ${content}` : 'No orientation restrictions found'
        };
    });

    // Check for CSS orientation media queries that might restrict content
    const cssOrientationChecks = await page.evaluate(() => {
        const styleSheets = Array.from(document.styleSheets);
        const orientationMediaQueries = [];

        try {
            styleSheets.forEach(sheet => {
                try {
                    if (!sheet.cssRules) return; // Skip if no rules (might be cross-origin)

                    Array.from(sheet.cssRules).forEach(rule => {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            const mediaText = rule.conditionText || rule.media?.mediaText;
                            if (mediaText && (
                                mediaText.includes('orientation: portrait') ||
                                mediaText.includes('orientation: landscape')
                            )) {
                                orientationMediaQueries.push({
                                    mediaText,
                                    cssText: rule.cssText
                                });
                            }
                        }
                    });
                } catch (e) {
                    // Skip cross-origin stylesheets that can't be accessed
                }
            });
        } catch (e) {
            console.error('Error checking CSS orientation:', e);
        }

        return {
            hasOrientationMediaQueries: orientationMediaQueries.length > 0,
            mediaQueries: orientationMediaQueries.slice(0, 5) // Limit to first 5 for brevity
        };
    });

    return {
        passes: !orientationRestrictions.hasRestrictions,
        details: {
            metaViewport: orientationRestrictions.details,
            cssMediaQueries: cssOrientationChecks
        },
        description: 'Tests if content restricts its view to a single display orientation'
    };
}

// Test for 1.4.2 Audio Control
async function testAudioControl(page) {
    const audioResults = await page.evaluate(() => {
        const audioElements = Array.from(document.querySelectorAll('audio, video'));
        const autoplayElements = audioElements.filter(el =>
            el.hasAttribute('autoplay') && !el.hasAttribute('muted') && !el.muted
        );

        // Check for embedded players that might autoplay
        const iframes = Array.from(document.querySelectorAll('iframe'));
        const potentialMediaEmbeds = iframes.filter(iframe => {
            const src = iframe.src.toLowerCase();
            return src.includes('youtube.com') ||
                src.includes('vimeo.com') ||
                src.includes('spotify.com') ||
                src.includes('soundcloud.com');
        });

        return {
            autoplayElements: autoplayElements.map(el => ({
                tagName: el.tagName,
                hasControls: el.hasAttribute('controls'),
                isMuted: el.hasAttribute('muted') || el.muted,
                autoplay: el.hasAttribute('autoplay')
            })),
            potentialEmbeds: potentialMediaEmbeds.map(el => el.src)
        };
    });

    const violations = audioResults.autoplayElements.filter(el => !el.hasControls && !el.isMuted);

    return {
        passes: violations.length === 0,
        elements: audioResults.autoplayElements.map(el =>
            `${el.tagName} (Controls: ${el.hasControls ? 'Yes' : 'No'}, Muted: ${el.isMuted ? 'Yes' : 'No'})`
        ),
        embeds: audioResults.potentialEmbeds,
        description: 'Tests if audio that plays automatically has controls to pause/stop it or adjust volume'
    };
}

// Test for 1.4.10 Reflow
async function testReflow(page) {
    // Set viewport to 320 CSS pixels wide (mobile width)
    await page.setViewport({ width: 320, height: 600, deviceScaleFactor: 1 });

    // Check for horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check if content is cut off or overlapping
    const contentIssues = await page.evaluate(() => {
        const issues = [];

        // Check for elements extending beyond viewport
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const rect = element.getBoundingClientRect();
            if (rect.right > window.innerWidth + 5) { // 5px buffer
                if (getComputedStyle(element).overflow !== 'hidden' &&
                    getComputedStyle(element).visibility !== 'hidden' &&
                    getComputedStyle(element).display !== 'none') {
                    issues.push({
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id,
                        width: rect.width,
                        overflowBy: rect.right - window.innerWidth
                    });
                }
            }
        }

        return issues;
    });

    // Reset viewport to normal size
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    return {
        passes: !hasHorizontalScroll && contentIssues.length === 0,
        details: {
            hasHorizontalScroll,
            viewportWidth: 320,
            contentIssues: contentIssues.slice(0, 10) // Limit to first 10 issues
        }
    };
}

// Test for 1.4.11 Non-text Contrast
async function testNonTextContrast(page) {
    // This test requires some visual analysis, which is challenging to automate completely
    // We'll identify UI controls and graphical objects and suggest manual review

    const violations = await page.evaluate(() => {
        const potentialIssues = [];

        // Find UI controls (buttons, form controls, etc.)
        const uiControls = document.querySelectorAll('button, input, select, textarea, [role="button"], [role="checkbox"], [role="radio"]');

        for (const control of uiControls) {
            // Skip if disabled or hidden
            if (control.disabled ||
                getComputedStyle(control).display === 'none' ||
                getComputedStyle(control).visibility === 'hidden') {
                continue;
            }

            // Check for borders that might need contrast
            const borderColor = getComputedStyle(control).borderColor;
            const backgroundColor = getComputedStyle(control).backgroundColor;

            if (borderColor && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)') {
                potentialIssues.push({
                    type: 'UI Control Border',
                    element: {
                        tagName: control.tagName,
                        className: control.className,
                        id: control.id,
                        role: control.getAttribute('role')
                    },
                    colors: {
                        borderColor,
                        backgroundColor
                    }
                });
            }
        }

        // Check for graphics (SVG, Canvas, etc.)
        const graphics = document.querySelectorAll('svg, canvas, [role="img"], [role="graphics-document"]');

        for (const graphic of graphics) {
            if (getComputedStyle(graphic).display === 'none' ||
                getComputedStyle(graphic).visibility === 'hidden') {
                continue;
            }

            potentialIssues.push({
                type: 'Graphic',
                element: {
                    tagName: graphic.tagName,
                    className: graphic.className,
                    id: graphic.id
                },
                needsReview: true
            });
        }

        return potentialIssues;
    });

    return {
        violations,
        message: 'Non-text contrast requires manual verification with color contrast tools.'
    };
}

// Test for 1.4.12 Text Spacing
async function testTextSpacing(page) {
    // Inject CSS to test text spacing
    const textSpacingResults = await page.evaluate(() => {
        // Save original overflow
        const originalOverflow = document.body.style.overflow;

        // Create a style element for text spacing
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            * {
                line-height: 1.5 !important;
                letter-spacing: 0.12em !important;
                word-spacing: 0.16em !important;
                text-spacing: auto !important;
            }
            p, li, h1, h2, h3, h4, h5, h6 {
                margin-bottom: 2em !important;
                margin-top: 2em !important;
            }
        `;
        document.head.appendChild(styleEl);

        // Function to check elements for clipping, overlapping, or truncation
        function checkVisualIssues() {
            const issues = [];
            const allElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');

            for (const element of allElements) {
                // Skip hidden elements
                if (getComputedStyle(element).display === 'none' ||
                    getComputedStyle(element).visibility === 'hidden') {
                    continue;
                }

                const style = getComputedStyle(element);

                // Check for overflow
                if (style.overflow === 'hidden' &&
                    element.scrollHeight > element.clientHeight) {
                    issues.push({
                        type: 'overflow',
                        element: {
                            tagName: element.tagName,
                            className: element.className,
                            id: element.id,
                            textContent: element.textContent.substring(0, 50) + '...'
                        }
                    });
                }

                // Check if element extends outside its parent
                const parent = element.parentElement;
                if (parent) {
                    const elementRect = element.getBoundingClientRect();
                    const parentRect = parent.getBoundingClientRect();

                    if (elementRect.right > parentRect.right + 2 ||
                        elementRect.bottom > parentRect.bottom + 2) {
                        issues.push({
                            type: 'extends-beyond-parent',
                            element: {
                                tagName: element.tagName,
                                className: element.className,
                                id: element.id,
                                textContent: element.textContent.substring(0, 50) + '...'
                            }
                        });
                    }
                }
            }

            return issues;
        }

        // Apply text spacing and check for issues
        const spacingIssues = checkVisualIssues();

        // Remove the injected style
        document.head.removeChild(styleEl);
        document.body.style.overflow = originalOverflow;

        return {
            issues: spacingIssues
        };
    });

    return {
        passes: textSpacingResults.issues.length === 0,
        details: {
            issues: textSpacingResults.issues.slice(0, 10) // Limit to first 10 issues
        }
    };
}

// Test for 1.4.13 Content on Hover or Focus
async function testContentOnHoverFocus(page) {
    const hoverResults = await page.evaluate(() => {
        const violations = [];

        // Find elements that might show content on hover
        const potentialHoverElements = document.querySelectorAll('[title], [aria-describedby], [data-tooltip], .tooltip, .popover');

        for (const element of potentialHoverElements) {
            // Skip if hidden
            if (getComputedStyle(element).display === 'none' ||
                getComputedStyle(element).visibility === 'hidden') {
                continue;
            }

            violations.push({
                type: 'potential-hover',
                reason: 'Element may show content on hover/focus',
                needs_manual_check: true,
                element: {
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    attributes: {
                        title: element.getAttribute('title'),
                        'aria-describedby': element.getAttribute('aria-describedby')
                    }
                }
            });
        }

        return violations;
    });

    return {
        violations: hoverResults,
        message: 'Content on hover or focus should be dismissible, hoverable, and persistent.'
    };
}

// Test for 2.5.1 Pointer Gestures
async function testPointerGestures(page) {
    // This is hard to fully automate and often requires manual testing
    // We'll look for touch events that might indicate gestures
    const gestureResults = await page.evaluate(() => {
        const violations = [];

        // Check for event listeners that might indicate gesture usage
        const allElements = document.querySelectorAll('*');

        for (const element of allElements) {
            // Look for touch event attributes
            if (element.hasAttribute('ontouchstart') ||
                element.hasAttribute('ontouchmove') ||
                element.hasAttribute('ontouchend') ||
                element.hasAttribute('ongesturestart') ||
                element.hasAttribute('ongesturechange') ||
                element.hasAttribute('ongestureend')) {

                violations.push({
                    type: 'potential-gesture',
                    reason: 'Element has touch/gesture event handlers',
                    element: {
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id
                    },
                    events: {
                        touchstart: element.hasAttribute('ontouchstart'),
                        touchmove: element.hasAttribute('ontouchmove'),
                        touchend: element.hasAttribute('ontouchend'),
                        gesturestart: element.hasAttribute('ongesturestart'),
                        gesturechange: element.hasAttribute('ongesturechange'),
                        gestureend: element.hasAttribute('ongestureend')
                    }
                });
            }
        }

        // Look for common libraries that might use gestures
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || '');
        const potentialGestureLibraries = scripts.filter(src =>
            src.includes('hammer') ||
            src.includes('swipe') ||
            src.includes('gesture') ||
            src.includes('touch')
        );

        if (potentialGestureLibraries.length > 0) {
            violations.push({
                type: 'potential-gesture-library',
                libraries: potentialGestureLibraries
            });
        }

        return violations;
    });

    return {
        violations: gestureResults,
        message: 'Check for multipoint or path-based gestures that lack single-point alternatives.'
    };
}

// Test for 2.5.4 Motion Actuation
async function testMotionActuation(page) {
    // Check for potential device motion usage
    const motionResults = await page.evaluate(() => {
        const report = {
            hasDeviceMotionEventListener: false,
            hasDeviceOrientationEventListener: false,
            hasMotionRelatedAttributes: false,
            motionAttributes: []
        };

        // Check if window has device motion or orientation event listeners
        // Note: We can't actually detect if listeners are attached in this way, but we can note it for review
        report.potentialListenerAPIs = 'DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window;

        // Look for HTML attributes related to motion
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const attributes = Array.from(element.attributes)
                .filter(attr =>
                    attr.name.toLowerCase().includes('motion') ||
                    attr.name.toLowerCase().includes('gesture') ||
                    attr.name.toLowerCase().includes('orientation') ||
                    attr.name.toLowerCase().includes('gyro') ||
                    attr.name.toLowerCase().includes('accelerometer') ||
                    attr.name.toLowerCase().includes('rotate')
                );

            if (attributes.length > 0) {
                report.hasMotionRelatedAttributes = true;
                report.motionAttributes.push({
                    element: {
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className
                    },
                    attributes: attributes.map(attr => ({ name: attr.name, value: attr.value }))
                });
            }
        }

        // Check for scripts that might use motion
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || '');
        report.potentialMotionLibraries = scripts.filter(src =>
            src.includes('gyro') ||
            src.includes('motion') ||
            src.includes('orientation') ||
            src.includes('accelerometer')
        );

        return report;
    });

    return {
        needs_review: motionResults.potentialListenerAPIs ||
            motionResults.hasMotionRelatedAttributes ||
            (motionResults.potentialMotionLibraries && motionResults.potentialMotionLibraries.length > 0),
        details: motionResults
    };
}

// Test for 4.1.1 Parsing
async function testParsing(page) {
    const parsingResults = await page.evaluate(() => {
        const errors = [];

        // Check for duplicate IDs
        const ids = {};
        const elementsWithIds = document.querySelectorAll('[id]');
        for (const el of elementsWithIds) {
            if (ids[el.id]) {
                errors.push(`Duplicate ID found: "${el.id}" on elements ${el.tagName} and ${ids[el.id]}`);
            } else {
                ids[el.id] = el.tagName;
            }
        }

        // Check for invalid nesting patterns
        const invalidNests = [
            { parent: 'ul', invalid: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
            { parent: 'ol', invalid: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
            { parent: 'table', invalid: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }
        ];

        for (const rule of invalidNests) {
            const parents = document.querySelectorAll(rule.parent);
            for (const parent of parents) {
                for (const invalidTag of rule.invalid) {
                    const invalid = parent.querySelectorAll(`:scope > ${invalidTag}`);
                    if (invalid.length > 0) {
                        errors.push(`Invalid nesting: <${invalidTag}> directly inside <${rule.parent}>`);
                    }
                }
            }
        }

        // Check for unclosed tags (this is challenging in DOM, but we can check some common patterns)
        try {
            const html = document.documentElement.outerHTML;
            const openTagCount = (html.match(/<div/g) || []).length;
            const closeTagCount = (html.match(/<\/div>/g) || []).length;

            if (openTagCount > closeTagCount) {
                errors.push(`Possible unclosed DIV tags: ${openTagCount} opens vs ${closeTagCount} closes`);
            }
        } catch (e) {
            errors.push("Error checking for unclosed tags: " + e.message);
        }

        return errors;
    });

    return {
        passes: parsingResults.length === 0,
        errors: parsingResults,
        description: 'Tests for proper HTML structure and syntax including duplicate IDs and invalid nesting'
    };
}

// Test for 4.1.3 Status Messages
async function testStatusMessages(page) {
    // Look for potential status messages that might need ARIA roles
    const statusResults = await page.evaluate(() => {
        const violations = [];

        // Common selectors for elements that might contain status messages
        const potentialStatusElements = document.querySelectorAll(
            '.status, .message, .notification, .alert, .toast, ' +
            '[role="status"], [role="alert"], [role="log"], ' +
            '.error-message, .success-message, .info-message, ' +
            '.validation-message, .help-block'
        );

        for (const element of potentialStatusElements) {
            // Check if it has proper ARIA role
            const hasProperRole = element.hasAttribute('role') &&
                ['status', 'alert', 'log', 'marquee', 'timer', 'progressbar'].includes(element.getAttribute('role'));

            // Check if it's likely to be a status message based on content
            const text = element.textContent.trim().toLowerCase();
            const likelyStatusContent =
                text.includes('success') ||
                text.includes('error') ||
                text.includes('saved') ||
                text.includes('updated') ||
                text.includes('loading') ||
                text.includes('please wait') ||
                text.includes('processing');

            if (!hasProperRole && likelyStatusContent) {
                violations.push({
                    type: 'potential-status-message',
                    element: {
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id,
                        textContent: element.textContent.substring(0, 50)
                    },
                    reason: 'Element appears to be a status message but lacks appropriate ARIA role'
                });
            }
        }

        // Look for form validation messages that might need roles
        const formElements = document.querySelectorAll('form');
        for (const form of formElements) {
            // Check for elements that might be validation messages
            const potentialValidationMessages = form.querySelectorAll('.error, .invalid, .valid, .validation');

            for (const message of potentialValidationMessages) {
                const hasProperRole = message.hasAttribute('role') &&
                    ['alert', 'status'].includes(message.getAttribute('role'));

                if (!hasProperRole) {
                    violations.push({
                        type: 'potential-validation-message',
                        element: {
                            tagName: message.tagName,
                            className: message.className,
                            id: message.id,
                            textContent: message.textContent.substring(0, 50)
                        },
                        reason: 'Element appears to be a validation message but lacks appropriate ARIA role'
                    });
                }
            }
        }

        return violations;
    });

    return {
        violations: statusResults,
        message: 'Status messages should have appropriate ARIA roles to be announced by screen readers.'
    };
}

// Media Content Detection
async function detectMediaContent(page) {
    const mediaResults = await page.evaluate(() => {
        const mediaItems = [];

        // Detect video elements
        const videos = document.querySelectorAll('video');
        for (const video of videos) {
            mediaItems.push({
                type: 'Video',
                hasControls: video.hasAttribute('controls'),
                hasCaptions: !!video.querySelector('track[kind="captions"]'),
                hasAudioDescription: !!video.querySelector('track[kind="descriptions"]'),
                duration: video.duration || 'Unknown',
                source: video.currentSrc || video.src || 'Unknown source',
                wcagRequirements: 'Requires captions (1.2.2) and audio description (1.2.5)'
            });
        }

        // Detect audio elements
        const audios = document.querySelectorAll('audio');
        for (const audio of audios) {
            mediaItems.push({
                type: 'Audio',
                hasControls: audio.hasAttribute('controls'),
                hasTranscript: false, // Can't determine automatically
                duration: audio.duration || 'Unknown',
                source: audio.currentSrc || audio.src || 'Unknown source',
                wcagRequirements: 'Requires transcript (1.2.1)'
            });
        }

        // Detect common video embeds
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            const src = iframe.src.toLowerCase();
            if (src.includes('youtube.com') || src.includes('vimeo.com')) {
                mediaItems.push({
                    type: 'Embedded Video',
                    source: iframe.src,
                    platform: src.includes('youtube.com') ? 'YouTube' : 'Vimeo',
                    wcagRequirements: 'Requires captions (1.2.2) and audio description (1.2.5)'
                });
            } else if (src.includes('spotify.com') || src.includes('soundcloud.com')) {
                mediaItems.push({
                    type: 'Embedded Audio',
                    source: iframe.src,
                    platform: src.includes('spotify.com') ? 'Spotify' : 'SoundCloud',
                    wcagRequirements: 'Requires transcript (1.2.1)'
                });
            }
        }

        return {
            mediaItems,
            description: 'Detection of media content that requires manual testing for WCAG 2.1 compliance'
        };
    });

    return mediaResults;
}

// Test keyboard accessibility with enhanced checks for WCAG 2.1
async function testKeyboardAccessibility(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Get all focusable elements
        const focusableElementsData = await page.evaluate(() => {
            // Enhanced selector for potentially focusable elements
            const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="link"], [role="option"]';
            const elements = Array.from(document.querySelectorAll(selector));

            return elements.map(el => {
                // Get computed styles for visibility check
                const style = window.getComputedStyle(el);
                const isVisible = style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0';

                // Check if element is in the viewport
                const rect = el.getBoundingClientRect();
                const isInViewport = rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth;

                return {
                    tagName: el.tagName,
                    id: el.id,
                    text: el.textContent?.trim().substring(0, 50) || '',
                    type: el.type || '',
                    hasAriaLabel: !!el.getAttribute('aria-label'),
                    isVisible,
                    isInViewport,
                    tabIndex: el.tabIndex,
                    role: el.getAttribute('role') || '',
                    outerHTML: el.outerHTML.substring(0, 200) // First 200 chars only
                };
            });
        });

        // Simulate keyboard navigation
        const focusOrder = [];
        let screenshotCounter = 0;

        await page.keyboard.press('Tab'); // First tab to enter the page

        // Take screenshots folder if it doesn't exist
        const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        // Perform a series of tab presses and record the focused element after each
        for (let i = 0; i < 50; i++) { // Limit to 50 tab presses to avoid infinite loops
            // Get the currently focused element
            const focusedElement = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) return null;

                // Check if the focus indicator is visible
                const hasFocusStyles = (() => {
                    const style = window.getComputedStyle(el);
                    const hasOutline = style.outline !== 'none' && style.outline !== '0px none';
                    const hasBorder = style.border !== 'none' && !style.border.includes('0px');

                    // Check for box-shadow as focus indicator
                    const hasBoxShadow = style.boxShadow !== 'none';

                    // Some elements change background color on focus
                    const backgroundColor = style.backgroundColor;

                    return hasOutline || hasBorder || hasBoxShadow || document.activeElement.classList.contains('focus');
                })();

                return {
                    tagName: el.tagName,
                    id: el.id,
                    text: el.textContent?.trim().substring(0, 50) || '',
                    selector: el.tagName.toLowerCase() +
                        (el.id ? `#${el.id}` : '') +
                        (el.className ? `.${el.className.replace(/\s+/g, '.')}` : ''),
                    role: el.getAttribute('role') || '',
                    hasFocusStyles,
                    outerHTML: el.outerHTML.substring(0, 200) // First 200 chars only
                };
            });

            if (!focusedElement) break; // No element is focused, we've reached the end

            // Save the focused element info
            focusOrder.push(focusedElement);

            // Take a screenshot of the focused state (optional)
            await page.screenshot({
                path: path.join(screenshotsDir, `focus-state-${screenshotCounter++}.png`),
                fullPage: false
            });

            // Press Tab to move to the next element
            await page.keyboard.press('Tab');
        }

        // Find any keyboard traps
        const potentialTraps = [];
        for (let i = 1; i < focusOrder.length; i++) {
            if (focusOrder[i].selector === focusOrder[i - 1].selector) {
                potentialTraps.push(focusOrder[i]);
            }
        }

        // Check for elements without visible focus indicator (WCAG 2.4.7)
        const elementsWithoutFocusStyles = focusOrder.filter(el => !el.hasFocusStyles);

        await browser.close();

        return {
            focusableElements: focusableElementsData,
            focusOrder: focusOrder,
            potentialTraps: potentialTraps,
            elementsWithoutFocusStyles: elementsWithoutFocusStyles,
            report: {
                totalFocusableElements: focusableElementsData.length,
                totalReachedByKeyboard: focusOrder.length,
                unreachableElements: focusableElementsData.length - focusOrder.length,
                hasPotentialKeyboardTraps: potentialTraps.length > 0,
                elementsMissingFocusStyles: elementsWithoutFocusStyles.length
            },
            wcagMapping: {
                '2.1.1': {
                    name: wcagCriteria['2.1.1'].name,
                    level: wcagCriteria['2.1.1'].level,
                    description: wcagCriteria['2.1.1'].description,
                    status: focusableElementsData.length === focusOrder.length ? 'passes' : 'violations',
                    violations: focusableElementsData.length !== focusOrder.length ? [{
                        description: 'Some elements cannot be accessed via keyboard',
                        count: focusableElementsData.length - focusOrder.length
                    }] : []
                },
                '2.1.2': {
                    name: wcagCriteria['2.1.2'].name,
                    level: wcagCriteria['2.1.2'].level,
                    description: wcagCriteria['2.1.2'].description,
                    status: potentialTraps.length === 0 ? 'passes' : 'violations',
                    violations: potentialTraps.length > 0 ? [{
                        description: 'Potential keyboard traps detected',
                        count: potentialTraps.length
                    }] : []
                },
                '2.4.7': {
                    name: wcagCriteria['2.4.7'].name,
                    level: wcagCriteria['2.4.7'].level,
                    description: wcagCriteria['2.4.7'].description,
                    status: elementsWithoutFocusStyles.length === 0 ? 'passes' : 'violations',
                    violations: elementsWithoutFocusStyles.length > 0 ? [{
                        description: 'Elements without visible focus indicator',
                        count: elementsWithoutFocusStyles.length
                    }] : []
                }
            }
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}

// Enhanced endpoint for keyboard accessibility testing
app.post('/test-keyboard', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const results = await testKeyboardAccessibility(url);
        res.json({ results });
    } catch (error) {
        console.error('Error testing keyboard accessibility:', error);
        res.status(500).json({
            error: 'Failed to test keyboard accessibility',
            message: error.message
        });
    }
});

// Enhanced screen reader simulation with WCAG 2.1 mapping
async function simulateScreenReader(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract the accessibility tree - this is what screen readers use
        const accessibilityTree = await page.accessibility.snapshot();

        // Simulate a screen reader traversing the accessibility tree
        const screenReaderOutput = [];

        function traverseAccessibilityTree(node, depth = 0) {
            if (!node) return;

            // Extract relevant information from the node
            const nodeInfo = {
                role: node.role,
                name: node.name,
                value: node.value,
                description: node.description,
                depth: depth,
                properties: node.properties || {},
                hasChildren: !!(node.children && node.children.length)
            };

            // Add this node to the screen reader output
            screenReaderOutput.push(nodeInfo);

            // Traverse children
            if (node.children && node.children.length) {
                node.children.forEach(child => traverseAccessibilityTree(child, depth + 1));
            }
        }

        // Start the traversal
        traverseAccessibilityTree(accessibilityTree);

        // Analyze the accessibility tree for common screen reader issues
        const issues = [];

        // Check for images without alt text
        const imagesWithoutAlt = screenReaderOutput.filter(node =>
            node.role === 'img' && (!node.name || node.name === '')
        );

        if (imagesWithoutAlt.length > 0) {
            issues.push({
                type: 'missing-alt-text',
                description: 'Images without alternative text',
                count: imagesWithoutAlt.length,
                elements: imagesWithoutAlt,
                wcagCriterion: '1.1.1'
            });
        }

        // Check for proper headings structure
        const headings = screenReaderOutput.filter(node =>
            node.role && node.role.match(/^heading/)
        );

        // Check for proper heading hierarchy (should not skip levels)
        let previousHeadingLevel = 0;
        const headingLevelIssues = [];

        headings.forEach(heading => {
            const match = heading.role.match(/heading-(\d+)/);
            if (match) {
                const level = parseInt(match[1]);

                // First heading should be h1
                if (previousHeadingLevel === 0 && level !== 1) {
                    headingLevelIssues.push({
                        description: `First heading is not h1, found h${level}`,
                        element: heading,
                        wcagCriterion: '1.3.1'
                    });
                }

                // Should not skip heading levels (e.g., h1 to h3)
                if (previousHeadingLevel > 0 && level > previousHeadingLevel + 1) {
                    headingLevelIssues.push({
                        description: `Heading level was skipped from h${previousHeadingLevel} to h${level}`,
                        element: heading,
                        wcagCriterion: '1.3.1'
                    });
                }

                previousHeadingLevel = level;
            }
        });

        if (headingLevelIssues.length > 0) {
            issues.push({
                type: 'heading-hierarchy-issues',
                description: 'Improper heading hierarchy',
                count: headingLevelIssues.length,
                details: headingLevelIssues,
                wcagCriterion: '1.3.1'
            });
        }

        // Check for empty buttons or links
        const emptyControls = screenReaderOutput.filter(node =>
            (node.role === 'button' || node.role === 'link') &&
            (!node.name || node.name === '')
        );

        if (emptyControls.length > 0) {
            issues.push({
                type: 'empty-controls',
                description: 'Buttons or links without accessible names',
                count: emptyControls.length,
                elements: emptyControls,
                wcagCriterion: '4.1.2'
            });
        }

        // Check for proper landmarks
        const landmarks = screenReaderOutput.filter(node =>
            ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form'].includes(node.role)
        );

        if (landmarks.length === 0) {
            issues.push({
                type: 'no-landmarks',
                description: 'No ARIA landmarks found on page',
                severity: 'major',
                wcagCriterion: '1.3.1'
            });
        }

        // Check for form fields without labels
        const unlabeledFormFields = screenReaderOutput.filter(node =>
            ['textbox', 'combobox', 'checkbox', 'radio', 'slider'].includes(node.role) &&
            (!node.name || node.name === '')
        );

        if (unlabeledFormFields.length > 0) {
            issues.push({
                type: 'unlabeled-form-fields',
                description: 'Form fields without accessible names',
                count: unlabeledFormFields.length,
                elements: unlabeledFormFields,
                wcagCriterion: '3.3.2'
            });
        }

        // Check for language settings (WCAG 3.1.1)
        const pageLanguage = await page.evaluate(() => {
            return document.documentElement.lang || '';
        });

        if (!pageLanguage) {
            issues.push({
                type: 'missing-language',
                description: 'Page language is not specified',
                wcagCriterion: '3.1.1'
            });
        }

        // Map issues to WCAG criteria
        const wcagMapping = {
            '1.1.1': {
                name: wcagCriteria['1.1.1'].name,
                level: wcagCriteria['1.1.1'].level,
                description: wcagCriteria['1.1.1'].description,
                status: imagesWithoutAlt.length === 0 ? 'passes' : 'violations',
                violations: imagesWithoutAlt.length > 0 ? [{
                    description: 'Images without alternative text',
                    count: imagesWithoutAlt.length
                }] : []
            },
            '1.3.1': {
                name: wcagCriteria['1.3.1'].name,
                level: wcagCriteria['1.3.1'].level,
                description: wcagCriteria['1.3.1'].description,
                status: (headingLevelIssues.length === 0 && landmarks.length > 0) ? 'passes' : 'violations',
                violations: []
            },
            '3.1.1': {
                name: wcagCriteria['3.1.1'].name,
                level: wcagCriteria['3.1.1'].level,
                description: wcagCriteria['3.1.1'].description,
                status: pageLanguage ? 'passes' : 'violations',
                violations: !pageLanguage ? [{
                    description: 'Page language is not specified'
                }] : []
            },
            '3.3.2': {
                name: wcagCriteria['3.3.2'].name,
                level: wcagCriteria['3.3.2'].level,
                description: wcagCriteria['3.3.2'].description,
                status: unlabeledFormFields.length === 0 ? 'passes' : 'violations',
                violations: unlabeledFormFields.length > 0 ? [{
                    description: 'Form fields without accessible names',
                    count: unlabeledFormFields.length
                }] : []
            },
            '4.1.2': {
                name: wcagCriteria['4.1.2'].name,
                level: wcagCriteria['4.1.2'].level,
                description: wcagCriteria['4.1.2'].description,
                status: emptyControls.length === 0 ? 'passes' : 'violations',
                violations: emptyControls.length > 0 ? [{
                    description: 'UI elements without proper names, roles, or values',
                    count: emptyControls.length
                }] : []
            }
        };

        if (headingLevelIssues.length > 0) {
            wcagMapping['1.3.1'].violations.push({
                description: 'Improper heading hierarchy',
                count: headingLevelIssues.length
            });
        }

        if (landmarks.length === 0) {
            wcagMapping['1.3.1'].violations.push({
                description: 'No ARIA landmarks found on page'
            });
        }

        await browser.close();

        return {
            accessibilityTree: screenReaderOutput.slice(0, 100), // Limit for brevity
            issues: issues,
            summary: {
                totalNodes: screenReaderOutput.length,
                headings: headings.length,
                landmarks: landmarks.length,
                images: screenReaderOutput.filter(node => node.role === 'img').length,
                buttons: screenReaderOutput.filter(node => node.role === 'button').length,
                links: screenReaderOutput.filter(node => node.role === 'link').length,
                formControls: screenReaderOutput.filter(node =>
                    ['textbox', 'combobox', 'checkbox', 'radio', 'slider'].includes(node.role)
                ).length,
                totalIssues: issues.reduce((sum, issue) => sum + (issue.count || 1), 0),
                pageLanguage: pageLanguage
            },
            wcagMapping
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}

// Enhanced endpoint for screen reader simulation
app.post('/simulate-screen-reader', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const results = await simulateScreenReader(url);
        res.json({ results });
    } catch (error) {
        console.error('Error simulating screen reader:', error);
        res.status(500).json({
            error: 'Failed to simulate screen reader',
            message: error.message
        });
    }
});

// API endpoint to generate a WCAG 2.1 AA Compliance Report
app.post('/generate-wcag-report', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Run all tests sequentially
        const axeResults = await fetch(`http://localhost:${port}/analyze-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        }).then(res => res.json());

        const keyboardResults = await fetch(`http://localhost:${port}/test-keyboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        }).then(res => res.json());

        const screenReaderResults = await fetch(`http://localhost:${port}/simulate-screen-reader`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        }).then(res => res.json());

        // Combine all WCAG mappings from different tests
        const combinedWcagMapping = {
            ...axeResults.results.wcagMapping,
            ...keyboardResults.results.wcagMapping,
            ...screenReaderResults.results.wcagMapping
        };

        // Calculate overall compliance metrics
        const criteriaCount = Object.keys(combinedWcagMapping).length;
        const passedCriteria = Object.values(combinedWcagMapping).filter(c => c.status === 'passes').length;
        const violationCriteria = Object.values(combinedWcagMapping).filter(c => c.status === 'violations').length;
        const needsReviewCriteria = Object.values(combinedWcagMapping).filter(c => c.status === 'needs-review').length;
        const notTestedCriteria = Object.values(combinedWcagMapping).filter(c => c.status === 'not-tested').length;
        const notApplicableCriteria = Object.values(combinedWcagMapping).filter(c => c.status === 'not-applicable').length;

        // Calculate compliance percentage
        const applicableCriteria = criteriaCount - notApplicableCriteria;
        const complianceScore = Math.round((passedCriteria / (applicableCriteria - notTestedCriteria)) * 100) || 0;

        // Generate comprehensive report
        const report = {
            url,
            timestamp: new Date().toISOString(),
            summary: {
                totalCriteria: criteriaCount,
                passedCriteria,
                violationCriteria,
                needsReviewCriteria,
                notTestedCriteria,
                notApplicableCriteria,
                complianceScore
            },
            criteriaResults: combinedWcagMapping,
            axeViolations: axeResults.results.violations,
            keyboardIssues: {
                focusOrder: keyboardResults.results.focusOrder.length,
                traps: keyboardResults.results.potentialTraps.length,
                missingFocusStyles: keyboardResults.results.elementsWithoutFocusStyles.length
            },
            screenReaderIssues: screenReaderResults.results.issues,
            additionalTests: axeResults.results.additionalTests || {}
        };

        res.json({ report });
    } catch (error) {
        console.error('Error generating WCAG report:', error);
        res.status(500).json({
            error: 'Failed to generate WCAG report',
            message: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Enhanced WCAG 2.1 AA Testing Server running at http://localhost:${port}`);
    console.log(`Open your browser and go to: http://localhost:${port}`);
});