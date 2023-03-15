/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
const enum Phenotype {
  HomoDominant = '{homodominant}',
  HeteroDominant = '{heterodominant}',
  HomoRecessive = '{homorecessive}'
}

type bilocus = [boolean, boolean];
type mortaldef = false | [Phenotype, Phenotype];
type GeneCross = Gene[][][];

interface GeneCrossTableEdge {
  from: Genotype[];
  bilocus: [boolean[][], boolean[][]];
}

interface Gene {
  from: Genotype;
  bilocus: bilocus;
}

interface MultiGene {
  alias: string;
  priority: number;
  mortal: mortaldef;
}

declare interface GeneInit {
  alias: string;
  description: string;
  mortal?: mortaldef;
  multiple?: false | MultiGene[];
}

declare interface SubjectInit {
  id: string;
  genes: Gene[];
}

class Genotype implements Readonly<GeneInit> {
  readonly alias: string;
  readonly description: string;
  readonly mortal: mortaldef;
  readonly multiple: false | MultiGene[];

  constructor({ alias, description, mortal = false, multiple = false }: GeneInit) {
    this.alias = alias;
    this.description = description;
    this.mortal = mortal;
    this.multiple = multiple;
  }
}

class Subject implements Readonly<SubjectInit> {
  readonly id: string;
  readonly genes: Gene[];

  constructor({ id, genes }: SubjectInit) {
    this.id = id;
    this.genes = genes;
  }
}

class Cross {
  readonly geneCrossTableEdge: GeneCrossTableEdge;
  readonly geneCross: GeneCross;

  constructor(
    public readonly subject1: Subject,
    public readonly subject2: Subject
  ) {
    let genotype1: boolean[][] = subject1.genes.map((gene) => gene.bilocus);
    let genotype2: boolean[][] = subject2.genes.map((gene) => gene.bilocus);
  
    genotype1 = genotype1.reduce((acc, curr) => {
      const [a, b] = curr as bilocus;
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
  
    genotype2 = genotype2.reduce((acc, curr) => {
      const [a, b] = curr as bilocus;
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
    
    this.geneCrossTableEdge = {
      from: sub1.genes.map(x => x.from),
      bilocus: [genotype1, genotype2]
    }

    this.geneCross = genotype1.map((genotype1) => {
      return genotype2.map((genotype2) => {
        return genotype1.map((locus, index) => {
          return {
            from: subject1.genes[index]!.from,
            bilocus: [locus, genotype2[index]!]
          };
        });
      });
    }, [[]] as Gene[][]);
  }

  get parsedGeneCrossTableEdge(): string[][] {
    return this.geneCrossTableEdge.bilocus.map((genotype) => {
      return genotype.map((bilocus) => {
        return bilocus.map((locus, index) => {
          return locus ? this.geneCrossTableEdge.from[index]!.alias.toUpperCase() : this.geneCrossTableEdge.from[index]!.alias.toLowerCase();
        }).join('');
      });
    });
  }

  get parsedGeneCross(): string[][] {
    return this.geneCross.map((genotype1) => {
      return genotype1.map((genotype2) => {
        return genotype2.map((gene) => {
          return gene.bilocus.map((locus) => {
            return locus ? gene.from.alias.toUpperCase() : gene.from.alias.toLowerCase();
          }).join('');
        }).join('');
      });
    });
  }
}

/* ===============    TESTING AREA     =============== */

const gene1 = new Genotype({
  alias: 'Y',
  description: 'This is a test gene',
  mortal: false,
  multiple: false
});

const gene2 = new Genotype({
  alias: 'W',
  description: 'This is a test gene'
});

const sub1 = new Subject({
  id: '1',
  genes: [
    { from: gene1, bilocus: [true, false] },
    { from: gene2, bilocus: [true, false] }
  ]
});

const sub2 = new Subject({
  id: '2',
  genes: [
    { from: gene1, bilocus: [true, false] },
    { from: gene2, bilocus: [false, false] }
  ]
});

const cross1 = new Cross(sub1, sub2);

console.log(cross1.parsedGeneCrossTableEdge)
console.log(cross1.parsedGeneCross)

/* =============== END OF TESTING AREA =============== */

export { Genotype, Subject, Cross, Phenotype };
