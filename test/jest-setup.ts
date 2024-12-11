import "jest";
import { isEqlAvailableMoves } from "./custom-matcher";
import { expect } from "@jest/globals";

expect.extend({ isEqlAvailableMoves });
