const enum Phenotype {
  HomoDominant = '{homodominant}',
  HeteroDominant = '{heterodominant}',
  HomoRecessive = '{homorecessive}'
}

type gene = [boolean, boolean]
type mortal = false | Phenotype

interface MultiGene {
  alias: string,
  priority: number,
  mortal: mortal
}

declare interface GeneInit {
  alias: string,
  description: string,
  mortal: mortal,
  multiple: false | MultiGene[]
}

declare interface SubjectInit {
  id: string
  genes: Gene[]
}

class Gene implements Readonly<GeneInit> {
  readonly alias: string
  readonly description: string
  readonly mortal: mortal
  readonly multiple: false | MultiGene[]

  constructor({ alias, description, mortal = false, multiple = false}: GeneInit) {
    this.alias = alias
    this.description = description
    this.mortal = mortal
    this.multiple = multiple
  }
}

class Subject implements Readonly<SubjectInit> {
  readonly id: string
  readonly genes: Gene[]

  constructor({ id, genes }: SubjectInit) {
    this.id = id
    this.genes = genes
  }
}

export { Gene, Subject }