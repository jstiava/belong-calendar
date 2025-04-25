import { Member } from "@/schema";
import { Type } from "@/types/globals";


export type StartViewer = (type: Type, item: Member, props?: any) => void;