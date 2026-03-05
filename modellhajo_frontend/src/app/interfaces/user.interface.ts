import Role from "./role.interface";

export default interface User{
    id: number;
    email: string;
    felhasznalonev: string;
    jelszo: string;
    megjeleno_nev: string;
    szerepkor_id: number;
    szerepkort_elfogadta: number;
    szerepkor_elfogadva: Date;
    tamogatott_versenyzo:number|null|undefined;
    mmsz_id:string|null|undefined;
    isadmin:boolean;
    role: Role;
}