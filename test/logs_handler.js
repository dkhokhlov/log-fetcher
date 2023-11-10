const tap = require('tap');
const mock_fs = require('mock-fs');
const { logs_handler } = require('../logs_handler');

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
  return { lines, async_output };
}

tap.test('logs_handler function', async (t) => {
  // Setup mock filesystem
  mock_fs({
    '/var/log': {
      'app.log': mock_log_content
    }
  });

  const { lines, async_output } = create_async_output_collector();

  await logs_handler('/var/log/app.log', 'utf8', 1024, undefined, undefined, async_output);

  // Since the logs_handler function returns lines with '\n', split mock_log_content accordingly.
  // The trim() call removes the trailing newline from the last line of expected content.
  const expected_lines = mock_log_content.trim().split('\n').reverse().map(line => `${line}\n`);

  t.same(lines, expected_lines, 'Collected lines should match the log file content');

  mock_fs.restore(); // Always clean up the mocked filesystem after your tests.
});


