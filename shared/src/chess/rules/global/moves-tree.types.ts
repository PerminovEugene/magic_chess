import { Color } from "../../piece";
import { Affect } from "../piece-movement/movement-rule";

export type X = number;
export type Y = number;
export type Hash = string;

export type GlobalMoveAffects = {
  check?: boolean;
  checkmate?: boolean;
  stalemate?: boolean;
};

export type Node = {
  // piece coordinate to its move
  // from -> to
  // isCheckMate?: boolean;
  // isCheck?: boolean;
  color: Color;
  winner?: Color;
  staleMate?: boolean;
  underCheck?: boolean;
  movements: {
    [key in Hash]: {
      [key in Hash]: {
        next: Node;
        affects?: Affect[];
        suisidal?: boolean;
      };
    };
  };
};
