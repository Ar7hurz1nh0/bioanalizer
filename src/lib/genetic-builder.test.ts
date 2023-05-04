/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
import { Gene, Locus, Subject, Cross } from './genetic-builder';

/* ===============    TESTING AREA     =============== */


const gene1 = new Gene({
  alias: 'Y',
  description: 'This is a test gene',
});

const gene2 = new Gene({
  alias: 'W',
  description: 'This is a test gene'
});

const sub1 = new Subject({
  genes: [
    { from: gene1, locus: Locus.HETERO },
    { from: gene2, locus: Locus.HETERO },
  ]
});

const sub2 = new Subject({
  genes: [
    { from: gene1, locus: Locus.HETERO },
    { from: gene2, locus: Locus.HETERO },
  ]
});

const sub3 = new Subject({
  genes: [
    { from: gene1, locus: Locus.HETERO },
    { from: gene2, locus: Locus.HETERO },
  ]
});

const cross1 = new Cross(sub1, sub2);

console.log(sub3.parsedGenes)
console.log(cross1.chanceOf(sub3))

console.log(sub1.id)
const parsedGeneCross = cross1.parsedGeneCross.flat();
console.log('Has chance', parsedGeneCross.includes(sub3.parsedGenes), '|', parsedGeneCross.filter(gene => gene === sub3.parsedGenes).length, 'out of', parsedGeneCross.length)

/* =============== END OF TESTING AREA =============== */