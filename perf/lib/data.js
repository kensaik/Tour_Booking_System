const guestRaw = open('../data/guest-fixture.json');
const companyRaw = open('../data/company-fixture.json');
const adminRaw = open('../data/admin-fixture.json');

export const guestCreds = JSON.parse(guestRaw);
export const companyCreds = JSON.parse(companyRaw);
export const adminCreds = JSON.parse(adminRaw);
