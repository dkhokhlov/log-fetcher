'use strict'
const tap = require('tap');
const mock_fs = require('mock-fs');
const {logs_handler} = require('../logs_handler');

// Mock log data with a newline character at the end to simulate a real log file.
const mock_log_content = `Critical: Something broke
Info: All is well
Warning: Something is slow
Error: Something else broke
`;

function create_async_output_collector() {
    const lines = [];

    async function async_output(line) {
        // The line is expected to include the newline character at the end.
        lines.push(line.toString());
    }

    return {lines, async_output};
}

tap.test('logs_handler function', async (t) => {
    // Setup mock filesystem
    mock_fs({
        '/var/log': {
            'app.log': mock_log_content
        }
    });

    const {lines, async_output} = create_async_output_collector();

    await logs_handler('/var/log/app.log', 'utf8', 1024, undefined, undefined, async_output);

    // Since the logs_handler function returns lines with '\n', split mock_log_content accordingly.
    // The trim() call removes the trailing newline from the last line of expected content.
    const expected_lines = mock_log_content.trim().split('\n').reverse().map(line => `${line}\n`);

    t.same(lines, expected_lines, 'Collected lines should match the log file content');

    mock_fs.restore(); // Always clean up the mocked filesystem after your tests.
});

const path = require('path');
const fs = require('fs');

const totalLines = 10000;
const testDirPath = path.resolve(__dirname, '..');
const tapDirPath = path.join(testDirPath, '.tap');
const testFilePath = path.join(tapDirPath, 'test_log_file.log');

// Ensure the .tap directory exists
tap.beforeEach(async () => {
    await fs.promises.mkdir(tapDirPath, {recursive: true});
});

// Test log file creation
tap.test('Creating a test log file', async (t) => {
    let testData = '';
    for (let i = 0; i < totalLines; i++) {
        testData += `Test log line ${i}\n`;
    }
    await fs.promises.writeFile(testFilePath, testData);
    t.pass('Test log file created');
    t.end();
});

// Test for `num_lines` functionality
tap.test('Testing num_lines parameter', async (t) => {
    // Test retrieving a specific number of lines
    let linesReceived = 0;
    let num_lines = 0;
    await logs_handler(
        testFilePath,
        'utf-8',
        1024, // Assuming a chunk size of 1024 for the test
        num_lines,
        null, // No keyword filtering for this test
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), /Test log line \d+/, 'Line matches expected format');
        }
    );
    t.equal(linesReceived, num_lines, `Received the correct number of lines (${num_lines})`);

    linesReceived = 0;
    num_lines = 1;
    await logs_handler(
        testFilePath,
        'utf-8',
        1024, // Assuming a chunk size of 1024 for the test
        num_lines,
        null, // No keyword filtering for this test
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), /Test log line \d+/, 'Line matches expected format');
        }
    );
    t.equal(linesReceived, num_lines, `Received the correct number of lines (${num_lines})`);

    linesReceived = 0;
    num_lines = 10;
    await logs_handler(
        testFilePath,
        'utf-8',
        10, // Assuming a chunk size of 1024 for the test
        num_lines,
        null, // No keyword filtering for this test
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), /Test log line \d+/, 'Line matches expected format');
        }
    );
    t.equal(linesReceived, num_lines, `Received the correct number of lines (${num_lines})`);

    linesReceived = 0;
    num_lines = 101;
    await logs_handler(
        testFilePath,
        'utf-8',
        1024, // Assuming a chunk size of 1024 for the test
        num_lines,
        null, // No keyword filtering for this test
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), /Test log line \d+/, 'Line matches expected format');
        }
    );
    t.equal(linesReceived, num_lines, `Received the correct number of lines (${num_lines})`);

    linesReceived = 0;
    num_lines = 1001;
    await logs_handler(
        testFilePath,
        'utf-8',
        1024, // Assuming a chunk size of 1024 for the test
        num_lines,
        null, // No keyword filtering for this test
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), /Test log line \d+/, 'Line matches expected format');
        }
    );
    t.equal(linesReceived, num_lines, `Received the correct number of lines (${num_lines})`);

    t.end();
});

// Clean up the .tap directory and test files after all tests
tap.teardown(async () => {
    await fs.promises.rm(tapDirPath, {recursive: true, force: true});
});


const keyword = 'special_keyword';
const linesWithKeyword = 25; // Assuming we have 25 lines with the keyword

// Ensure the .tap directory exists
tap.beforeEach(async () => {
    await fs.promises.mkdir(tapDirPath, {recursive: true});
});

// Test log file creation with a keyword
tap.test('Creating a test log file with keyword', async (t) => {
    let testData = '';
    for (let i = 0; i < totalLines; i++) {
        if (i < linesWithKeyword) {
            testData += `Test log line with ${keyword} ${i}\n`;
        } else {
            testData += `Test log line ${i}\n`;
        }
    }
    await fs.promises.writeFile(testFilePath, testData);
    t.pass('Test log file with keyword created');
    t.end();
});

// Test for `keyword` functionality
tap.test('Testing keyword parameter', async (t) => {
    let linesReceived = 0;
    await logs_handler(
        testFilePath,
        'utf-8',
        1024, // Assuming a chunk size of 1024 for the test
        undefined, // No limit on the number of lines
        keyword, // Filter lines containing the keyword
        async (line) => {
            linesReceived++;
            t.match(line.toString('utf-8'), new RegExp(keyword), 'Line contains the keyword');
        }
    );
    t.equal(linesReceived, linesWithKeyword, `Received the correct number of lines with the keyword (${linesWithKeyword})`);
    t.end();
});

// Clean up the .tap directory and test files after all tests
tap.teardown(async () => {
    await fs.promises.rm(tapDirPath, {recursive: true, force: true});
});
