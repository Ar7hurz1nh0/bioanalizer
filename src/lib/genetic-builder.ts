/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
const enum ErrorCode {
  InvalidLocus = 'InvalidLocus',
  InvalidGene = 'InvalidGene',
  InvalidSubject = 'InvalidSubject',
  GeneNotFound = 'GeneNotFound',
}

const enum Locus {
  DOMINANT = '{homodominant}',
  HETERO = '{hetero}',
  RECESSIVE = '{homorecessive}'
}

const enum Phenotype {
  DOMINANT = '{dominant}',
  RECESSIVE = '{recessive}'
}

type RawLocus = [boolean, boolean];
type Bilocus = [ RawLocus, RawLocus ]
type singleCrossBilocus = [ Bilocus, Bilocus ];
type MortalDefinition = false | [ Phenotype, Phenotype ];
type GeneCross = GeneLocus[][][];

interface ISingleCross {
  from: Gene;
  cross: singleCrossBilocus;
}

interface GeneCrossTableEdge {
  from: Gene[];
  bilocus: [boolean[][], boolean[][]];
}

interface GeneLocus<GeneType extends RawLocus | Locus = RawLocus> {
  from: Gene;
  locus: GeneType;
}

interface MultiGene {
  alias: string;
  priority: number;
  mortal: MortalDefinition;
}

declare interface IGene {
  alias: string;
  description: string;
  mortal: MortalDefinition;
  multiple: false; // | MultiGene[];
}

type IGeneContructor = Omit<Omit<IGene, 'multiple'>, 'mortal'> & { multiple?: IGene["multiple"], mortal?: IGene["mortal"] };

declare interface ISubject<GeneType extends RawLocus | Locus> {
  id: string;
  genes: GeneLocus<GeneType extends Locus ? Locus : RawLocus>[];
}

const locusSort = (locus: boolean): -1 | 0 => locus ? -1 : 0
const genSeed = (rounds: number) => {
  let acc = 0;
  let i = 0;
  // eslint-disable-next-line no-plusplus
  for (; i <= rounds; i++) acc += Math.random() * 3;
  return acc / i;
}
const genId = () => genSeed(Math.random() * 100).toString(36).substring(2);

class Gene implements Readonly<IGene> {
  readonly alias: string;
  readonly description: string;
  readonly mortal: MortalDefinition;
  readonly multiple: false; // | MultiGene[];
  readonly id: string;

  constructor({ alias, description, mortal = false, multiple = false }: IGeneContructor) {
    this.alias = alias;
    this.description = description;
    this.mortal = mortal;
    this.multiple = multiple;
    this.id = genId();
  }
}

class Subject implements Readonly<ISubject<RawLocus | Locus>> {
  readonly id: string;
  readonly genes: GeneLocus<RawLocus>[];

  private static isLocusEnum(genes: RawLocus | Locus): genes is Locus {
    return !(genes instanceof Array) && typeof genes === 'string';
  }

  constructor({ genes }: Omit<ISubject<RawLocus | Locus>, 'id'>) {
    this.id = genId();
    this.genes = genes.map(({ locus, from }) => {
      if (Subject.isLocusEnum(locus)) switch (locus) {
        case Locus.HETERO:
          return { from, locus: [true, false] }
  
        case Locus.DOMINANT:
          return { from, locus: [true, true] }
  
        case Locus.RECESSIVE:
          return { from, locus: [false, false] }

        default:
          throw new Error('Invalid locus', { cause: ErrorCode.InvalidLocus });
      }
      else return { from, locus: locus.sort(locusSort) };
    })
  }

  public get parsedGenes() {
    return this.genes.map((gene) => {
      return gene.locus.map((locus) => {
        return locus ? gene.from.alias.toUpperCase() : gene.from.alias.toLowerCase();
      }).join('');
    }).join('');
  }
}

class Cross {
  readonly geneCrossTableEdge: GeneCrossTableEdge;
  readonly geneCross: GeneCross;
  readonly individualGeneCross: ISingleCross[];

  constructor(
    public readonly subject1: Subject,
    public readonly subject2: Subject
  ) {
    const genotypeNames: Gene[] = [];
    let genotype1: boolean[][] = []
    let genotype2: boolean[][] = []

    subject1.genes.forEach((gene) => {
      const gen2 = subject2.genes.findIndex(gen => gen.from === gene.from);
      if (gen2 === -1) throw new Error('Gene not found', { cause: ErrorCode.GeneNotFound });
      genotypeNames.push(gene.from);
      genotype1.push(gene.locus);
      genotype2.push(subject2.genes[gen2]!.locus);
    });
    
    genotype1 = genotype1.reduce((acc, curr) => {
      const [a, b] = curr as RawLocus;
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
  
    genotype2 = genotype2.reduce((acc, curr) => {
      const [a, b] = curr as RawLocus;
      const newAcc: boolean[][] = [];
      acc.forEach((el) => {
        newAcc.push([...el, a]);
        newAcc.push([...el, b]);
      });
      return newAcc;
    }, [[]] as boolean[][]);
    

    this.individualGeneCross = genotypeNames.map(name => {
      const gen = subject1.genes.find(g => g.from === name)!;
      const gen2 = subject2.genes.find(g => g.from === name)!;
      const [g1A, g1a] = gen.locus
      const [g2A, g2a] = gen2.locus

      return {
        from: name,
        cross: [
          [
            [ g1A, g2A ].sort(locusSort) as RawLocus, [ g1a, g2A ].sort(locusSort) as RawLocus ],
          [ [ g1A, g2a ].sort(locusSort) as RawLocus, [ g1a, g2a ].sort(locusSort) as RawLocus ]
        ]
      }
    })

    this.geneCrossTableEdge = {
      from: subject1.genes.map(x => x.from),
      bilocus: [genotype1, genotype2]
    }

    this.geneCross = genotype1.map((genotype1) => {
      return genotype2.map((genotype2) => {
        return genotype1.map((locus, index) => {
          return {
            from: subject1.genes[index]!.from,
            locus: [locus, genotype2[index]!]
          };
        });
      });
    }, [[]] as GeneLocus[][]);
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
          return gene.locus.map((locus) => {
            return locus ? gene.from.alias.toUpperCase() : gene.from.alias.toLowerCase();
          }).join('');
        }).join('');
      });
    });
  }

  /**
   * 
   * @param subject Subject to get the chance of breed
   * @returs the chance in decimal format, the chance in fraction format (tuple in [divisor, dividend] format), and the number of matches in the table
   * @throws if the subject does not contain matching genes with the crossing subjects
   */
  public chanceOf(subject: Subject): {
    chance: number;
    fraction: [ number, number ];
    parsedChance: number;
    occurencies: number;
  } {
    const lenght: number = this.geneCross.flat().length
    const occurencies: number = this.geneCross.reduce((acc, curr) => {
      return acc + curr.map(genelocus => {
          const res: boolean[] = genelocus.map(gene => {
            const gen = subject.genes.find(g => g.from.id === gene.from.id)
            if (!gen) throw new Error('Gene not found', { cause: ErrorCode.GeneNotFound });
            return gene.locus.toString() === gen.locus.toString()
          })
          return Array(res.length).fill(true).toString() === res.toString()
        }).filter(x => x).length
    }, 0)

    return {
      chance: occurencies/lenght,
      fraction: [occurencies, lenght],
      parsedChance: Math.floor((occurencies/lenght)*10000)/100,
      occurencies
    }
  }
}

export { Gene, Subject, Cross, Phenotype, Locus };
