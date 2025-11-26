import Role from "./role.interface";

export default interface User{
    id: number;
    email: string;
    felhasznalonev: string;
    jelszo: string;
    megjeleno_nev: string;
    szerepkor_id: number;
    role: Role
}