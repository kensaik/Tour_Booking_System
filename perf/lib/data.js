// Fixture loaders. k6 requires open() at init scope (top of module).
// Importers receive parsed objects — no JSON.parse on each iteration.

const guestRaw = open('../data/guest-fixture.json');
const companyRaw = open('../data/company-fixture.json');
const adminRaw = open('../data/admin-fixture.json');

export const guestCreds = JSON.parse(guestRaw);
export const companyCreds = JSON.parse(companyRaw);   // { approved, pending }
export const adminCreds = JSON.parse(adminRaw);
