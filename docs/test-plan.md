# Test Plan — Tour Booking System

---

## 1. Document Revision History

| Date | Version | Description | Author |
|---|---:|---|---|
| Apr 29, 2025 | 1.0 | Initial draft | Trương Hưng Phát, QA/Tester |

---

## 2. Acronyms

| Acronym | Meaning |
|---|---|
| QA | Quality Assurance |
| UC | Use Case |
| API | Application Programming Interface |
| UI | User Interface |
| DB | Database |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| PM | Project Manager |
| SRS | Software Requirement Specification |

---

## 3. Project Overview and Objectives

### Project Overview

The **Tour Booking System** is a capstone web application that connects tourists with registered tourism companies through a centralized platform. The system supports three actor types: **Tourist** (Du khách), **Tourism Company** (Công ty du lịch), and **Admin**.

- **Backend:** Python (Flask) — REST API
- **Frontend:** React — Single Page Application
- **Database:** MySQL

The system allows tourism companies to register (pending admin approval), manage tours and departure schedules, and view business statistics. Tourists can search, view, and book tours by paying a deposit. Admins oversee company approvals, tour content, and destination categories.

If there are major changes to scope, requirements, or testing schedule, this plan must be reviewed and re-approved.

### Objectives

This test plan defines:

- Testing scope across all three actor flows
- Testing approach, tools, and test types
- Required resources and environment
- Entry and exit criteria
- Roles, responsibilities, and timeline
- Risks and contingency plans
- Approval process

---

## 4. Testing Scope

### 4.1 Features to Be Tested

#### Tourism Company Actor

| ID | Use Case | Testing Types |
|---|---|---|
| TC-UC-01 | Register with pending approval status | Functional, Validation, DB |
| TC-UC-02 | Login and receive JWT token | Functional, Security |
| TC-UC-03 | Create / edit / delete tour and daily itinerary | Functional, DB, UI |
| TC-UC-04 | Schedule departures (date + seat capacity) | Functional, DB, Validation |
| TC-UC-05 | View business statistics dashboard | Functional, UI |

#### Tourist Actor

| ID | Use Case | Testing Types |
|---|---|---|
| T-UC-01 | Register tourist account | Functional, Validation, DB |
| T-UC-02 | Login and receive JWT token | Functional, Security |
| T-UC-03 | Search tours by destination and departure date | Functional, UI |
| T-UC-04 | View tour detail (itinerary, price, policy) | Functional, UI |
| T-UC-05 | Book tour and pay deposit — booking created, seats updated, notifications sent | Functional, DB, Integration |

#### Admin Actor

| ID | Use Case | Testing Types |
|---|---|---|
| A-UC-01 | Approve or reject tourism company registrations | Functional, DB |
| A-UC-02 | Manage approved tourism companies (edit, deactivate) | Functional, DB |
| A-UC-03 | Manage destination category list (CRUD) | Functional, DB |
| A-UC-04 | Manage tours listed on the platform | Functional, DB, UI |

---

### 4.2 Features Not to Be Tested

| Excluded Area | Reason |
|---|---|
| Full online payment gateway (VNPay, Stripe, etc.) | Not in project scope — deposit flow is simulated |
| Email / SMS notification delivery | Notification trigger is in scope; delivery infrastructure is out of scope |
| Mobile native app (iOS / Android) | Project targets web only |
| Performance / load testing | Out of scope for capstone sprint |
| Security penetration testing | Not in scope — basic auth security checks only |

---

## 5. Test Approach

### 5.1 Test Case Management

| Item | Description |
|---|---|
| Test case storage | Markdown file `docs/test-case.md` + Google Sheets (shared with team) |
| Test case preparation | QA writes cases based on use case specs |
| Test case review | PM or Backend Developer reviews before execution |
| Defect tracking | GitHub Issues — label `bug`, `severity: critical / high / medium / low` |
| Test execution tracking | Checkboxes in `docs/test-case.md`, status updated per sprint |

---

### 5.2 Types of Testing

#### Unit Testing
Backend unit tests written in **pytest**. Each Flask route and service function is tested in isolation. CI runs `pytest` on every push via GitHub Actions.

#### Smoke Testing
Performed after each new build is deployed to the QA/local environment. Validates that login, tour listing, and booking entry points are reachable before running deeper tests.

#### Functional Testing
Manual test execution for each use case in section 4.1. QA verifies expected behavior, error messages, and edge cases against the use case specification.

#### Regression Testing
Run full functional test suite after each bug fix or new feature merge. Priority on all UC flows that share authentication and booking pipelines.

#### Database Testing
Verify data is correctly inserted, updated, and deleted for:
- User registration (tourists and companies)
- Tour and itinerary records
- Departure schedule records
- Booking records (status, seat count updates)

#### UI Testing
Manual visual inspection of React frontend:
- Layout, alignment, labels, and button states
- Form validation feedback (inline errors)
- Responsive layout on desktop and mobile viewport

#### Compatibility Testing
Cross-browser functional and visual testing on the latest versions of supported browsers.

---

### 5.3 Browser, OS, and Device Compatibility

| Platform Type | Supported Targets |
|---|---|
| Browsers | Latest Google Chrome, Mozilla Firefox, Microsoft Edge |
| Operating Systems | Windows 10/11, macOS |
| Devices | Desktop (1280px+), Tablet (768px), Mobile (375px) |

---

### 5.4 Automation Approach

After manual testing confirms stability, the following happy paths will be automated using **pytest + Selenium**:

**Tourist Happy Path:**
1. Register tourist account
2. Log in
3. Search for a tour by destination
4. Open tour detail page
5. Submit booking with deposit
6. Verify booking confirmation

**Tourism Company Happy Path:**
1. Register company (pending state)
2. Admin approves company
3. Company logs in
4. Creates a tour with itinerary
5. Schedules a departure

Automated tests are added to the GitHub Actions CI pipeline after the manual test pass rate reaches 100% on critical paths.

---

## 6. Entry and Exit Criteria

### 6.1 Entry Criteria

Testing can begin when all of the following conditions are met:

- Backend API is deployed and reachable on the local / QA environment
- Frontend React app is running and connected to the backend
- MySQL database is seeded with required test data
- All use case specs in this test plan have been reviewed
- GitHub Issues is set up for defect tracking
- QA environment is confirmed stable by Backend Developer

### 6.2 Exit Criteria

Testing is considered complete when:

- 100% of scoped test cases have been executed
- No open Critical or High severity bugs remain
- All discovered bugs are logged in GitHub Issues with reproduction steps
- Screenshots are attached to UI-related bug reports
- Regression suite is completed after last bug fix
- Final test summary is shared with the team and PM approves release readiness

---

## 7. Suspension and Resumption Criteria

### 7.1 Suspension Criteria

Testing will stop if any of the following occur:

- Local / QA environment crashes or becomes inaccessible
- Login API does not return a valid token — blocking all authenticated flows
- Database connection fails
- A Critical bug blocks more than one major UC flow
- Required test data is unavailable or corrupted

### 7.2 Resumption Criteria

Testing resumes when:

- Backend Developer confirms the environment is restored
- A hotfix for the blocking bug is deployed and smoke test passes
- Database is restored with valid test data
- PM confirms the team can continue

---

## 8. Roles, Responsibilities, and Timeline

### 8.1 Roles and Responsibilities

| Role | Name | Testing Responsibilities |
|---|---|---|
| QA / Tester | Trương Hưng Phát | Write test cases, execute manual tests, log bugs, retest fixes, produce test summary |
| Project Manager | Lê Duy Mạnh | Review and approve test plan, coordinate timeline, accept or reject release readiness |
| Frontend Developer | Nguyễn Trần Minh Quân | Fix UI bugs, support QA with frontend environment setup |
| Backend Developer | Tô Nguyễn Sơn Nam | Fix API and DB bugs, maintain QA environment, provide test data |

### 8.2 Timeline

| Activity | Start | End | Owner | Notes |
|---|---|---|---|---|
| Test planning | Week 6 | Week 6 | QA | Draft, review, and approve this test plan |
| Test case preparation | Week 7 | Week 7 | QA | Write test cases per use case |
| Environment setup | Week 7 | Week 7 | Backend Dev | Deploy API + DB + seed data |
| Smoke testing | Week 8 | Week 8 | QA | Validate build stability |
| Functional test execution | Week 8 | Week 9 | QA | Execute all manual test cases |
| Defect retesting | Week 9 | Week 10 | QA | Verify all fixed bugs |
| Regression testing | Week 10 | Week 10 | QA | Final regression run |
| Test summary + sign-off | Week 10 | Week 10 | QA + PM | Final approval |

---

## 9. Dependencies, Risks, and Contingencies

### 9.1 Dependencies

- Backend API must be deployed before QA can begin functional testing
- Database seed scripts must be provided by Backend Developer
- Frontend must be integrated with backend before UI testing begins
- Admin approval flow must work before Tourism Company flows can be fully tested
- GitHub Issues must be set up before execution begins

### 9.2 Risks and Contingency Plans

| Risk | Impact | Contingency Plan |
|---|---|---|
| Backend API delivered late | High — blocks functional test start | QA will prepare all test cases and test data during the delay; execution starts as soon as API is available |
| Local / QA environment unstable | High — testing blocked | QA and Backend Dev coordinate to restore; QA documents affected test cases as blocked |
| Admin approval flow not ready | High — company and admin UCs cannot be tested | QA tests tourist flows first; company/admin flows deferred until approval UC is stable |
| Scope changes during testing | Medium — test cases may need revision | QA updates affected test cases; PM approves revised scope before continuing |
| Key team member unavailable | Medium — execution pace drops | PM reassigns critical test cases to another available member or adjusts timeline |

---

## 10. Approvals

| Role | Name | Status | Date |
|---|---|---|---|
| QA / Tester | Trương Hưng Phát | Pending | — |
| Project Manager | Lê Duy Mạnh | Pending | — |
| Backend Developer | Tô Nguyễn Sơn Nam | Pending | — |
