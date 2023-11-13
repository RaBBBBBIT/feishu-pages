import { describe, test } from '@jest/globals';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '../src';

const fixture = (filename: string): string => {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), 'utf8');
};

const fixtureJSON = (filename: string): any => {
  return JSON.parse(fixture(filename));
};

describe('MarkdownRenderer', () => {
  test('parse', () => {
    let render = new MarkdownRenderer({});
    let result = render.parse();

    assert.strictEqual(result, '');
  });

  test('parse file', () => {
    ['case0', 'case1', 'case2', 'case3'].forEach((caseName) => {
      const doc = fixtureJSON(`${caseName}.raw.json`);
      const expected = fixture(`${caseName}.expect.md`);

      let render = new MarkdownRenderer(doc);
      let result = render.parse();

      assert.equal(result.trim(), expected.trim(), caseName);
    });
  });

  test('pageMeta', () => {
    let render = new MarkdownRenderer(fixtureJSON(`case1.raw.json`));
    render.parse();
    assert.equal(render.meta?.slug, 'test-slug');

    render = new MarkdownRenderer(fixtureJSON(`case3.raw.json`));
    render.parse();
    assert.equal(render.meta?.slug, 'gettting-started');
    assert.equal(render.meta?.keywords, 'feishu-pages, feishu-docx');
  });

  test('fileTokens', () => {
    const doc = fixtureJSON(`case3.raw.json`);

    let render = new MarkdownRenderer(doc);
    render.parse();

    assert.deepEqual(Object.keys(render.fileTokens), [
      'Bwk8bcQH6oLQn1xjzdacPBckn8d',
      'DkwibdF3ooVi0KxttdocdoQ5nPh',
      'M9hDb8WXzo7TU5xg4xtcvArPnxe',
      'TVEyb1pmWo8oIwxyL3kcIfrrnGd',
      'SzJmbprNwo5Y7Cx2MzAc7k7dnCt',
      'DPH0bRiUuohOKlxHKnCce5SRnMd',
    ]);
    assert.deepEqual(render.fileTokens['DkwibdF3ooVi0KxttdocdoQ5nPh'], {
      token: 'DkwibdF3ooVi0KxttdocdoQ5nPh',
      type: 'image',
    });
    assert.deepEqual(render.fileTokens['TVEyb1pmWo8oIwxyL3kcIfrrnGd'], {
      token: 'TVEyb1pmWo8oIwxyL3kcIfrrnGd',
      type: 'file',
    });
  });

  test('parse unsupport', () => {
    const doc = fixtureJSON(`unsupport.raw.json`);

    let render = new MarkdownRenderer(doc, { outputUnsupported: true });
    let result = render.parse();
    let expect = fixture(`unsupport.a.md`);

    assert.equal(result.trim(), expect.trim());

    expect = fixture(`unsupport.b.md`);
    render = new MarkdownRenderer(doc);
    result = render.parse();

    assert.equal(result.trim(), expect.trim());
  });

  test('markdownToHTML', () => {
    let raw = `<img src="/feishu-pages/assets/TGgab0uVmo6rumxnH7RcMEuHnLf.png" src-width="576" src-height="128" align="center">[This is a Link](https://github.com) this is suffix.`;
    let render = new MarkdownRenderer({});
    let result = render.markdownToHTML(raw);
    let expect = `<p><img src="/feishu-pages/assets/TGgab0uVmo6rumxnH7RcMEuHnLf.png" src-width="576" src-height="128" align="center"><a href="https://github.com">This is a Link</a> this is suffix.</p>\n`;
    assert.equal(result, expect);

    raw = `<div><img src="/feishu-pages/assets/TGgab0uVmo6rumxnH7RcMEuHnLf.png" src-width="576" src-height="128" align="center"></div>\n\n[This is a Link](https://github.com)\nThis is suffix.`;
    result = render.markdownToHTML(raw);
    expect = `<div><img src="/feishu-pages/assets/TGgab0uVmo6rumxnH7RcMEuHnLf.png" src-width="576" src-height="128" align="center"></div>\n\n<p><a href="https://github.com">This is a Link</a><br>This is suffix.</p>\n`;
    assert.equal(result, expect);
  });
});
