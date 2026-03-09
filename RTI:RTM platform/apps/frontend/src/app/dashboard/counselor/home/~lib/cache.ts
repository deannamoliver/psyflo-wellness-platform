"server-only";

import { createSearchParamsCache } from "nuqs/server";
import { searchParamsParsers } from "./parsers";

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
