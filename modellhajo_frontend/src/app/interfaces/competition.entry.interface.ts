import Group from './group.interface';

export default interface CompetitionEntry{
    id:number,
    versenyid:number,
    kategoriaid:number,
    versenyzoid:number,
    egyesulet: string|null,
    rajtszam: number|null,
    is_junior: boolean,
    pontszam: null|number,
    csoportid: null|number,
    group?: Group | null
}
