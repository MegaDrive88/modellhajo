export default interface Competition{
    id: number;
    kezdet: Date | string;
    veg: Date | string;
    nev: string;
    evszam: string | null; // number inkabb?
    letrehozo_id: number;
    helyszin: string;
    megjelenik: Date | string;
    nevezesi_hatarido: Date | string;
    gps_x: number | null;
    gps_y: number | null;
    szervezo_egyesulet: number | null;
    leiras: string | null;
    nevezesi_dij_junior: number;
    nevezesi_dij_normal: number;
    nevezesi_dij_senior: number;
    kep_url: string | null;
    kep_fajlnev: string | null;
}