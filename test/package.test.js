// Lightweight package sanity test (no browser / puppeteer, so the adapter can be
// installed straight from GitHub without a Chrome download during git dep preparation).
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const io = JSON.parse(fs.readFileSync(path.join(root, 'io-package.json'), 'utf8'));

const EXPECTED_WIDGETS = ['FeederStatus', 'FeedControl', 'Environment', 'DynamicFeeding', 'SeasonBanner'];

assert.strictEqual(pkg.name, 'iobroker.vis-2-widgets-automatic-feeder', 'package name');
assert.strictEqual(io.common.name, 'vis-2-widgets-automatic-feeder', 'io-package common.name');
assert.strictEqual(pkg.version, io.common.version, 'version in package.json and io-package.json match');

const set = io.common.visWidgets && io.common.visWidgets.vis2AutomaticFeeder;
assert.ok(set, 'io-package.json common.visWidgets.vis2AutomaticFeeder exists');
assert.deepStrictEqual(set.components, EXPECTED_WIDGETS, 'the five widget components are declared');

const bundle = path.join(root, 'widgets', 'vis-2-widgets-automatic-feeder', 'customWidgets.js');
assert.ok(fs.existsSync(bundle), 'built widget bundle exists at widgets/.../customWidgets.js');

for (const lang of ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn']) {
    const p = path.join(root, 'src-widgets-ts', 'src', 'i18n', `${lang}.json`);
    JSON.parse(fs.readFileSync(p, 'utf8')); // throws on invalid JSON
}

console.log('package sanity test: OK — 5 widgets declared, bundle present, 11 i18n files valid');
