/**
 * School configuration for seed data
 *
 * Defines the 4 schools used in development/testing:
 * - Lincoln High School
 * - Washington Elementary
 * - Roosevelt Middle School
 * - Psyflo Academy (default school for test users and scenarios)
 */

export type SchoolConfig = {
  name: string;
  address: string;
  email: string;
  domain: string;
};

export const SCHOOLS: Record<string, SchoolConfig> = {
  lincoln: {
    name: "Lincoln High School",
    address: "123 School St",
    email: "info@lincoln.edu",
    domain: "lincoln.edu",
  },
  washington: {
    name: "Washington Elementary",
    address: "456 Education Ave",
    email: "contact@washington.edu",
    domain: "washington.edu",
  },
  roosevelt: {
    name: "Roosevelt Middle School",
    address: "789 Learning Blvd",
    email: "admin@roosevelt.edu",
    domain: "roosevelt.edu",
  },
  psyflo: {
    name: "Psyflo Academy",
    address: "100 Wellness Way",
    email: "info@psyflo.com",
    domain: "psyflo.com",
  },
};

/**
 * Default school for test scenarios
 */
export const DEFAULT_SCHOOL = "psyflo";
