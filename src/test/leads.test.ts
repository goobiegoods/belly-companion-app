import { describe, expect, it } from 'vitest';
import { classify } from '../../api/_lib/leads';

const cases: [string, string][] = [
  ['Dio Morota 😂', 'tag'],
  ['Tyler Holden', 'tag'],
  ['Jessica Degler😅🤣', 'tag'],
  ['@sam_k @jo.b', 'tag'],
  ['I AGREE🥲', 'chatter'],
  ['😂😂😂', 'chatter'],
  ['Because food and pregnancy is sometimes so cruel lol 🤣🤣', 'chatter'],
  ['Me rn at 10 weeks 😭🤣', 'lead'],
  ['March!', 'lead'],
  ['Due in April with my first 💛', 'lead'],
  ['Is it normal to feel this nauseous at 8 weeks?', 'lead'],
  ['What app is this?', 'lead'],
  ['ftm here and so scared', 'lead'],
  ['Oh good, I’m not the only one.. 😮‍💨', 'chatter'],
];
describe('comment triage', () => {
  it.each(cases)('%s -> %s', (text, want) => expect(classify(text).intent).toBe(want));
});
