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
type mortaldef = false | Phenotype | Phenotype[];

interface GeneCross {
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
  readonly geneCross: GeneCross;
  constructor(
    public readonly subject1: Subject,
    public readonly subject2: Subject
  ) {
    let genotype1: boolean[][] = subject1.genes.map((gene) => gene.bilocus);
    let genotype2: boolean[][] = subject2.genes.map((gene) => gene.bilocus);
  
    genotype1 = genotype1.reduce((acc, curr) => {
      const [a, b] = curr as [boolean, boolean];
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
  
    genotype2 = genotype2.reduce((acc, curr) => {
      const [a, b] = curr as [boolean, boolean];
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
    
    this.geneCross = {
      from: sub1.genes.map(x => x.from),
      bilocus: [genotype1, genotype2]
    }
  }

  get parsedGeneCross(): string[][] {
    return this.geneCross.bilocus.map((genotype) => {
      return genotype.map((bilocus) => {
        return bilocus.map((locus, index) => {
          return locus ? this.geneCross.from[index]!.alias.toUpperCase() : this.geneCross.from[index]!.alias.toLowerCase();
        }).join('');
      });
    });
  }
}

function cross(sub1: Subject, sub2: Subject): GeneCross {
  let genotype1: boolean[][] = sub1.genes.map((gene) => gene.bilocus);
  let genotype2: boolean[][] = sub2.genes.map((gene) => gene.bilocus);

  genotype1 = genotype1.reduce((acc, curr) => {
    const [a, b] = curr as [boolean, boolean];
    const newAcc: boolean[][] = [];
    acc.forEach((el) => {
      newAcc.push([...el, a]);
      newAcc.push([...el, b]);
    });
    return newAcc;
  }, [[]] as boolean[][]);

  genotype2 = genotype2.reduce((acc, curr) => {
    const [a, b] = curr as [boolean, boolean];
    const newAcc: boolean[][] = [];
    acc.forEach((el) => {
      newAcc.push([...el, a]);
      newAcc.push([...el, b]);
    });
    return newAcc;
  }, [[]] as boolean[][]);
  
  return {
    from: sub1.genes.map(x => x.from),
    bilocus: [genotype1, genotype2]
  }
}

/* ===============    TESTING AREA     =============== */

const gene1 = new Genotype({
  alias: 'A',
  description: 'This is a test gene',
  mortal: false,
  multiple: false
});

const gene2 = new Genotype({
  alias: 'B',
  description: 'This is a test gene'
});

const gene3 = new Genotype({
  alias: 'C',
  description: 'This is a test gene'
})

const sub1 = new Subject({
  id: '1',
  genes: [
    { from: gene1, bilocus: [true, false] },
    { from: gene2, bilocus: [true, false] },
    { from: gene3, bilocus: [true, false]}
  ]
});

const sub2 = new Subject({
  id: '2',
  genes: [
    { from: gene1, bilocus: [true, false] },
    { from: gene2, bilocus: [true, false] },
    { from: gene3, bilocus: [true, false]}
  ]
});

// console.log(res);
const cross1 = new Cross(sub1, sub2);
console.log(cross1.geneCross)
console.log(cross1.geneCross)

/* =============== END OF TESTING AREA =============== */

export { Genotype, Subject, cross };
