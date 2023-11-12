'use strict'
const tap = require('tap');

const {isValidEncoding} = require('../utils');

tap.test('Encoding Validation', async (t) => {
    t.ok(isValidEncoding('utf8'), 'utf8 should be a valid encoding');
    t.ok(isValidEncoding('ascii'), 'ascii should be a valid encoding');
    t.ok(isValidEncoding('base64'), 'base64 should be a valid encoding');
    t.ok(isValidEncoding('utf16le'), 'utf16le should be valid encoding');
    t.ok(isValidEncoding('UTF8'), 'UTF8 should be case insensitive and valid');
    t.ok(isValidEncoding('Ascii'), 'Ascii should be case insensitive and valid');
    t.ok(isValidEncoding(''), 'empty string should be a valid encoding, defaults to utf8');
    t.notOk(isValidEncoding('fakeEncoding'), 'fakeEncoding should not be a valid encoding');
    t.notOk(isValidEncoding(null), 'null should not be a valid encoding');
    t.notOk(isValidEncoding(undefined), 'undefined should not be a valid encoding');
    t.end();
});

const mockFs = require('mock-fs');
const {checkDirectory} = require('../utils');

tap.test('Directory Checks', async (t) => {
    // Setup mock filesystem
    mockFs({
        '/existing-readable-dir': mockFs.directory({
            mode: 0o755, // Readable directory
        }),
        '/existing-unreadable-dir': mockFs.directory({
            mode: 0o000, // Unreadable directory
        }),
        // Do not create '/non-existing-dir' to simulate its absence
    });

    // Test cases
    await t.test('should pass for existing readable directory', async (t) => {
        await t.resolves(checkDirectory('/existing-readable-dir'), 'Directory is readable');
    });

    await t.test('should throw for non-existing directory', async (t) => {
        await t.rejects(checkDirectory('/non-existing-dir'), /does not exist/, 'Correctly throws for non-existent directory');
    });

    await t.test('should throw for existing unreadable directory', async (t) => {
        await t.rejects(checkDirectory('/existing-unreadable-dir'), /is not readable/, 'Correctly throws for unreadable directory');
    });

    // Restore the normal filesystem before ending the tests
    mockFs.restore();

    t.end();
});

const {assert} = require('../utils');

tap.test('assert function', async (t) => {
    t.test('should not throw an error for a true condition', (t) => {
        t.doesNotThrow(() => {
            assert(true, 'value', 'should not throw');
        }, 'assert does not throw when condition is true');
        t.end();
    });

    t.test('should throw an error for a false condition', (t) => {
        t.throws(() => {
            assert(false, 'value', 'should throw');
        }, /should throw, received: value/, 'assert throws when condition is false');
        t.end();
    });

    t.end();
});

const {backwardLineSegmentation} = require('../utils');

tap.test('backwardLineSegmentation function', async (t) => {
    // Test with a simple case
    t.test('should handle a single complete line', async (t) => {
        const buffer = Buffer.from("Hello\n");
        const partial_right = Buffer.alloc(0);
        const expected = [Buffer.from("Hello\n"), []];
        const result = backwardLineSegmentation(buffer, partial_right);
        t.same(result, expected, 'Single complete line is handled correctly');
    });

    // Test with multiple lines
    t.test('should handle multiple lines', async (t) => {
        const buffer = Buffer.from("Line1\nLine2\nLine3\n");
        const partial_right = Buffer.alloc(0);
        const expected = [Buffer.from("Line1\n"), [Buffer.from("Line2\n"), Buffer.from("Line3\n")]];
        const result = backwardLineSegmentation(buffer, partial_right);
        t.same(result, expected, 'Multiple lines are handled correctly');
    });

    // Test with partial line on right
    t.test('should handle partial line on right', async (t) => {
        const buffer = Buffer.from("Line1\nLine2\n");
        const partial_right = Buffer.from("Line3\n");
        const expected = [Buffer.from("Line1\n"), [Buffer.from("Line2\n"), Buffer.from("Line3\n")]];
        const result = backwardLineSegmentation(buffer, partial_right);
        t.same(result, expected, 'Partial line on right is handled correctly');
    });

    t.end();
});

const {SeedableRandom} = require('../utils');

tap.test('SeedableRandom output should be in the range [0, 1)', (t) => {
    let seed = 12345;
    const rng = new SeedableRandom(seed);
    for (let i = 0; i < 100; i++) {
        const value = rng.random();
        t.ok(value >= 0 && value < 1, 'Generated value should be within [0, 1)');
    }
    t.end();
});
