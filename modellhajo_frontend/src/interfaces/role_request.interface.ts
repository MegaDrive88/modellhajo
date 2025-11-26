import Role from "./role.interface";
import User from "./user.interface";

export default interface RoleReq{
    id: number;
    felhasznalo_id: number;
    kivant_szerepkor_id: number;
    user: User;
    desired_role: Role;
}