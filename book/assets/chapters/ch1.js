// Chapter 1: the story of AI. Content lives in ../content.js (shared with the ?autoplay=1 reel); this file only adds the
// chapter wrapper and the beat name of each spread.
import { SPREADS } from '../content.js';
const BEATS = ['turing', 'chess', 'net', 'words', 'chat'];
export default {
  id: 'ch1',
  spreads: SPREADS.map((s, i) => ({ ...s, beat: BEATS[i], needs: i === 1 ? ['s3_cat'] : [] })),
};
