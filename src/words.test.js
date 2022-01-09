import { compareWords } from './words';

test('comparison', () => {
  expect(compareWords('eagle', 'gorge')).toStrictEqual([0, 0, 1, 0, 2]);
  expect(compareWords('great', 'gorge')).toStrictEqual([2, 1, 1, 0, 0]);
  expect(compareWords('egged', 'gorge')).toStrictEqual([1, 1, 1, 0, 0]);
  expect(compareWords('gaged', 'gorge')).toStrictEqual([2, 0, 1, 1, 0]);
});
