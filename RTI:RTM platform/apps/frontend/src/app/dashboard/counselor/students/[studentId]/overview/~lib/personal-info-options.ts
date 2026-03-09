import {
  ethnicityEnum,
  genderEnum,
  languageEnum,
  pronounEnum,
} from "@feelwell/database";
import { titleCase } from "@/lib/string-utils";

export const GENDER_OPTIONS = genderEnum.enumValues.map((value) => ({
  value,
  label: titleCase(value, { delimiter: "_" }),
}));

export const PRONOUN_OPTIONS = pronounEnum.enumValues.map((value) => ({
  value,
  label: titleCase(value, { delimiter: "_" }),
}));

export const LANGUAGE_OPTIONS = languageEnum.enumValues.map((value) => ({
  value,
  label: titleCase(value, { delimiter: "_" }),
}));

export const ETHNICITY_OPTIONS = ethnicityEnum.enumValues.map((value) => ({
  value,
  label: titleCase(value, { delimiter: "_" }),
}));
