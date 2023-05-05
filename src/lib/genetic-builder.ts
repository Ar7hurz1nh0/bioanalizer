/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */

const enum ErrorCode {
  INVALID_LOCUS = 'InvalidLocus',
  INVALID_GENE = 'InvalidGene',
  INVALID_SUBJECT = 'InvalidSubject',
  GENE_NOT_FOUND = 'GeneNotFound',
}

const enum Locus {
  /** The equivalent to an "AA" allele, or
   * ```
   * [true, true]
   * ```
   */
  HOMODOMINANT = '{homodominant}',
  /** The equivalent to an "Aa" allele, or
   * ```
   * [true, false]
   * ```
   */
  HETERO = '{hetero}',
  /** The equivalent to an "aa" allele, or
   * ```
   * [false, false]
   * ```
   */
  HOMORECESSIVE = '{homorecessive}'
}

const enum Phenotype {
  /** Represents a locus with at least one dominant allele */
  DOMINANT = '{dominant}',
  /** Represents a locus with both alleles being recessive */
  RECESSIVE = '{recessive}'
}

type RawLocus = [boolean, boolean];
type singleCrossBilocus = [ [ RawLocus, RawLocus ], [ RawLocus, RawLocus ] ];
type MortalDefinition = false | IMortal;
type GeneCross = GeneLocus[][][];

interface IMortal {
  fulfillment: Phenotype;
  type: Phenotype;
};

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

interface IGeneContructor {
  alias: string;
  description: string;
  multiple?: false;
  mortal?: MortalDefinition;
}

type IGene = Required<IGeneContructor>

declare interface ISubject<GeneType extends RawLocus | Locus> {
  id: string;
  genes: GeneLocus<GeneType extends Locus ? Locus : RawLocus>[];
}

const locusSort = (locus: boolean): -1 | 0 => locus ? -1 : 0
const genSeed = (rounds: number): number => {
  let acc = 0;
  let i = 0;
  // eslint-disable-next-line no-plusplus
  for (; i <= rounds; i++) acc += Math.random() * 3;
  return acc / i;
}
const genId = (): string => genSeed(Math.random() * 100).toString(36).substring(2);

function StdError(code: ErrorCode): Error {
  switch (code) {
    case ErrorCode.GENE_NOT_FOUND:
      return new Error('Gene not found', { cause: ErrorCode.GENE_NOT_FOUND })
    case ErrorCode.INVALID_GENE:
      return new Error('')
    case ErrorCode.INVALID_LOCUS:
      return new Error('Invalid locus', { cause: ErrorCode.INVALID_LOCUS })
    case ErrorCode.INVALID_SUBJECT:
      return new Error('Invalid subject', { cause: ErrorCode.INVALID_SUBJECT })
    default: return new Error('Generic error', { cause: 'unknown' })
  }
}

class Gene implements Readonly<IGene> {
  readonly alias: string;
  readonly description: string;
  readonly mortal: MortalDefinition;
  readonly multiple: false; // | MultiGene[];
  // TODO: ^^ Start code for handling Multi/Mortal genes
  readonly id: string;

  public static EnumToRaw(locus: Locus): RawLocus {
    switch (locus) {
      case Locus.HETERO:
        return [true, false]
      case Locus.HOMODOMINANT:
        return [true, true]
      case Locus.HOMORECESSIVE:
        return [false, false]
      default:
        throw StdError(ErrorCode.INVALID_LOCUS);
    }
  }

  constructor({ alias, description, mortal = false, multiple = false }: IGeneContructor) {
    this.alias = alias;
    this.description = description;
    this.mortal = mortal;
    this.multiple = multiple;
    this.id = genId();
  }

  // eslint-disable-next-line class-methods-use-this
  public static isMortal({ from, locus }: GeneLocus<RawLocus | Locus>): boolean {
    // eslint-disable-next-line no-param-reassign
    if (Subject.isLocusEnum(locus)) locus = Gene.EnumToRaw(locus)
    

    return false
  }

  /**
   * @param def Mortal gene definition
   * @returns The usable format to a mortal gene interface
   * @returns null if a invalid value is given
   */
  public static MortalToLocus(def: IMortal): RawLocus {
    switch (def) {
      case {
        fulfillment: Phenotype.DOMINANT,
        type: Phenotype.DOMINANT
      }: return [true, false]

      case {
        fulfillment: Phenotype.DOMINANT,
        type: Phenotype.RECESSIVE
      }: return [true, false]

      case {
        fulfillment: Phenotype.RECESSIVE,
        type: Phenotype.DOMINANT
      }: return [true, true]

      case {
        fulfillment: Phenotype.RECESSIVE,
        type: Phenotype.RECESSIVE
      }: return [false, false]

      default: return null as unknown as RawLocus
    }
  }
}

class Subject implements Readonly<ISubject<RawLocus | Locus>> {
  readonly id: string;
  readonly genes: GeneLocus<RawLocus>[];

  public static isLocusEnum(genes: RawLocus | Locus): genes is Locus {
    return !(genes instanceof Array) && typeof genes === 'string';
  }

  constructor({ genes }: Omit<ISubject<RawLocus | Locus>, 'id'>) {
    this.id = genId();
    const genesMap = new Set<string>()
    genes.forEach(({ from, locus }) => {
      const rawlocus = Subject.isLocusEnum(locus)
        ? { from, locus: Gene.EnumToRaw(locus)}
        : { from, locus: locus.sort(locusSort) }
      
      if (genesMap.has(rawlocus.from.id)) throw StdError(ErrorCode.INVALID_SUBJECT)
      else genesMap.add(rawlocus.from.id);
    })
    this.genes = Array.from(genesMap.values()).map((id): GeneLocus<RawLocus> => {
      const { locus, from } = genes.find(gene => gene.from.id === id)!
      if (Subject.isLocusEnum(locus))
        return { from, locus: Gene.EnumToRaw(locus)}
      return { from, locus: locus.sort(locusSort) };
    })
  }

  public get parsedGenes(): string {
    return this.genes.map((gene): string => {
      return gene.locus.map((locus): string => {
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
      if (gen2 === -1) throw StdError(ErrorCode.GENE_NOT_FOUND);
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
            if (!gen) throw StdError(ErrorCode.GENE_NOT_FOUND);
            return gene.locus.toString() === gen.locus.toString()
          })
          return Array(res.length).fill(true).toString() === res.toString()
        }).filter(x => x).length
    }, 0)

    return {
      chance: occurencies/lenght,
      fraction: [occurencies, lenght],
      parsedChance: Math.round((occurencies/lenght)*10000)/100,
      occurencies
    }
  }
}

export { Gene, Subject, Cross, Phenotype, Locus, ErrorCode };