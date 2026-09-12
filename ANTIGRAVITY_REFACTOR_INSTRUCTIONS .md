# Antigravity --- Human-Centered Code Refactoring Instructions

## 1. PRIMARY OBJECTIVE

You are working on an **already completed and functional software
project**.

Your job is **NOT to rebuild the project from scratch**.

Carefully inspect the existing codebase, understand how it works, and
refactor/improve the implementation so it is clear, practical,
maintainable, and naturally structured.

The final project must: - Continue working exactly as it does now. -
Preserve all existing features. - Preserve existing API behavior unless
absolutely necessary. - Preserve database functionality and data
structures. - Preserve frontend/backend communication. - Preserve
authentication and authorization. - Preserve environment-variable
usage. - Preserve deployment compatibility. - Avoid unnecessary
architectural changes. - Avoid unnecessary dependencies. - Remain
understandable to another developer. - Avoid excessive abstraction.

> **FUNCTIONALITY COMES FIRST. CODE STYLE COMES SECOND.**

Do not modify working functionality merely for stylistic reasons.

------------------------------------------------------------------------

## 2. FIRST STEP --- UNDERSTAND THE ENTIRE PROJECT

Before modifying anything, inspect the complete repository.

Understand: - frontend - backend - APIs - database - authentication -
configuration - environment variables - services - utility functions -
components - routes - controllers - models - middleware - API calls -
error handling - state management - external services - deployment
configuration - package dependencies

Do not immediately start rewriting files. First build a mental map of
the project and understand how data moves through it.

``` text
Frontend
    ↓
User interaction
    ↓
API / service layer
    ↓
Backend
    ↓
Business logic
    ↓
Database / external services
```

------------------------------------------------------------------------

## 3. DO NOT REBUILD THE PROJECT

The existing project is already functional.

### DO NOT:

-   delete and recreate the entire project
-   replace the architecture unnecessarily
-   migrate frameworks
-   replace the database or APIs without a strong reason
-   rewrite every file
-   create unnecessary design patterns, classes, or abstractions
-   change working business logic just to make it look different

### INSTEAD:

Modify the existing implementation gradually.

If a file is already clean and understandable, leave it alone.

Do not force every part of the project into one uniform style.

------------------------------------------------------------------------

## 4. CODE SHOULD FEEL NATURAL

The objective is **clear and contextually written code**, not
mechanically uniform code.

Use names appropriate to the context.

``` javascript
const user = ...
const data = ...
const result = ...
const count = ...
const items = ...
```

When additional clarity is useful:

``` javascript
const userProfile = ...
const uploadedFiles = ...
const totalAmount = ...
const nearbyLocations = ...
```

Do not deliberately make code confusing or inconsistent.

------------------------------------------------------------------------

## 5. VARIABLE NAMING

Avoid unnecessarily long generated-looking names.

### Avoid:

``` javascript
const processedUserAuthenticationResponseData = ...
const dynamicallyCalculatedLocationProcessingResult = ...
const optimizedDatabaseQueryExecutionResult = ...
```

### Prefer:

``` javascript
const authResult = ...
const locationData = ...
const queryResult = ...
```

Do not deliberately use meaningless names such as `abc`, `qwerty`, or
`temp1` unless the context genuinely justifies them.

------------------------------------------------------------------------

## 6. FUNCTION NAMING

Functions should describe what they actually do.

Prefer:

``` javascript
getUser()
saveReport()
updateStatus()
sendNotification()
calculateDistance()
loadDashboard()
```

Avoid unnecessarily verbose generated-looking names such as:

``` javascript
executeCompleteUserDataRetrievalOperation()
performComprehensiveReportDatabaseInsertion()
```

Also avoid meaningless names such as:

``` javascript
doStuff()
handleEverything()
processData2()
function1()
```

Use the simplest useful name.

------------------------------------------------------------------------

## 7. DO NOT OVER-ABSTRACT

Do not create unnecessary layers such as:

``` text
Controller
    ↓
Service
    ↓
Manager
    ↓
Processor
    ↓
Handler
    ↓
Utility
    ↓
Repository
```

Only use such architecture when the project genuinely benefits from it.

If `Route → Controller → Database` is enough, do not create five
additional abstraction layers.

Prefer practical architecture.

------------------------------------------------------------------------

## 8. AVOID "PERFECT" CODE EVERYWHERE

Do not make every file maximally abstract or clever.

Straightforward code is often better:

``` javascript
for (const item of items) {
    if (item.active) {
        activeItems.push(item);
    }
}
```

Use loops, conditionals, helper functions, arrays, objects, and classes
when they make sense.

Choose readability over cleverness.

------------------------------------------------------------------------

## 9. COMMENTS

Remove comments that merely explain obvious code.

Avoid:

``` javascript
// Increment counter by one
count++;
```

Prefer comments that explain: - why something unusual is being done - an
important business rule - an external API limitation - a non-obvious
workaround - an architectural decision

Example:

``` javascript
// The external API sometimes returns duplicate records,
// so we remove them before storing the result.
```

Do not add comments everywhere, and do not remove useful comments just
for the sake of changing code.

------------------------------------------------------------------------

## 10. ERROR HANDLING

Keep error handling practical.

Do not build enormous generic error-handling systems unless the project
requires them.

``` javascript
try {
    const result = await saveUser(user);
    return result;
} catch (err) {
    console.error(err);
    throw err;
}
```

Use meaningful errors where users or developers need them.

Do not silently swallow errors without a legitimate reason.

------------------------------------------------------------------------

## 11. ASYNC / API CODE

Prefer readable asynchronous code:

``` javascript
const user = await getUser(id);
const reports = await getReports(user.id);
```

Do not blindly convert every pattern. Preserve behavior.

Pay special attention to: - loading states - API failures - timeouts -
retries - authentication - request validation - response formats

------------------------------------------------------------------------

## 12. FRONTEND CODE

Inspect frontend components for: - unnecessarily large components -
duplicated UI logic - excessive props - unnecessary state - unnecessary
effects - repeated API calls - unused imports - dead code - overly
generic component names

Break components apart only when it genuinely improves readability.

Do not turn every small JSX/UI section into its own component.

------------------------------------------------------------------------

## 13. BACKEND CODE

Review: - routes - controllers - services - middleware - database
operations - validation - response formatting

Refactor duplicated or genuinely tangled logic where useful.

Keep business logic easy to follow:

``` text
Request
   ↓
Route
   ↓
Controller / handler
   ↓
Business logic
   ↓
Database
   ↓
Response
```

Avoid unnecessary indirection.

------------------------------------------------------------------------

## 14. DATABASE CODE

Do not change the database schema unless absolutely necessary.

Preserve: - collection/table names - field names - relationships -
indexes - queries - IDs - assumptions about existing data

Clean up duplicated queries where appropriate.

Do not introduce a new ORM/database library merely to change code style.

------------------------------------------------------------------------

## 15. API CONTRACTS

Treat existing API endpoints as stable contracts.

Before changing anything, identify:

``` text
HTTP method
Endpoint
Request body
Query parameters
Headers
Authentication
Response format
Error format
```

Do not casually change endpoints or request/response structures.

If a change is genuinely necessary, update every dependent
frontend/backend location.

------------------------------------------------------------------------

## 16. ENVIRONMENT VARIABLES

Do not hard-code: - API keys - passwords - database credentials -
tokens - secrets - private URLs

Preserve existing `.env` usage.

Do not expose secrets to frontend code.

Do not commit secrets.

------------------------------------------------------------------------

## 17. REMOVE UNNECESSARY REDUNDANCY

Look for wrappers and configuration that provide no practical value.

Example:

``` javascript
function getUserData(id) {
    return userService.getUserData(id);
}
```

If the wrapper adds no meaningful abstraction, consider simplifying it.

Do not create constants for obvious values or utility functions for
every tiny operation without a reason.

------------------------------------------------------------------------

## 18. DUPLICATED CODE

If the same complex operation appears in multiple places, consider
extracting it.

For example:

``` javascript
calculateDistance()
```

can be reused if several modules genuinely need the same calculation.

Do not extract tiny one-line expressions merely to eliminate every
repeated line.

Use judgment.

------------------------------------------------------------------------

## 19. IMPORTS AND DEPENDENCIES

Clean unused imports.

Check package files.

Do not add a dependency unless it is actually required.

If an existing dependency already does the job, keep it.

Avoid unnecessary: - frameworks - utility libraries - state-management
libraries - validation libraries - AI libraries

------------------------------------------------------------------------

## 20. FILE STRUCTURE

Keep the folder structure understandable.

A structure such as this is acceptable when appropriate:

``` text
project/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── ...
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   └── ...
├── README.md
├── package.json
└── ...
```

Do not reorganize the entire repository if the current structure is
already reasonable.

------------------------------------------------------------------------

## 21. AVOID MASSIVE AUTOMATED REWRITES

Do not perform a giant transformation such as rewriting every JavaScript
file, React component, backend file, or variable name at once.

Work in stages:

``` text
1. Understand architecture
2. Inspect frontend
3. Inspect backend
4. Inspect database/API layer
5. Identify unnecessary complexity
6. Refactor high-value areas
7. Remove dead code
8. Clean naming where useful
9. Run tests/build
10. Verify application manually
```

------------------------------------------------------------------------

## 22. PRESERVE FUNCTIONALITY AFTER EVERY MAJOR CHANGE

After significant modifications, check: - application starts - frontend
builds - backend starts - API requests work - database connection
works - authentication works - forms work - navigation works - external
integrations work - important user flows work

Do not assume the project still works merely because it compiles.

------------------------------------------------------------------------

## 23. TEST IMPORTANT USER FLOWS

Identify the project's primary workflows.

Example:

``` text
User opens application
        ↓
User logs in
        ↓
Dashboard loads
        ↓
User creates record
        ↓
Backend processes request
        ↓
Database stores data
        ↓
Frontend updates
```

Test the complete flow.

Also test relevant failure cases: - invalid input - missing data - API
failure - database failure - unauthorized request - network failure

------------------------------------------------------------------------

## 24. DO NOT INTENTIONALLY INTRODUCE BUGS

Do not intentionally: - add syntax errors - add random unused
variables - add broken functions - add meaningless comments - introduce
bad security practices - create inconsistent indentation - introduce
fake bugs - duplicate code unnecessarily - break naming conventions
randomly - remove error handling - weaken validation

Natural code does **not** mean bad code.

The final result should remain professional.

------------------------------------------------------------------------

## 25. NATURAL DEVELOPMENT STYLE

The project should feel like it has evolved through normal development.

That means: - simple solutions where simple solutions are enough -
abstractions where abstractions are useful - descriptive names where
clarity matters - short names where context makes them obvious -
different modules may have slightly different styles - not every
function needs the same structure - not every file needs identical
formatting - not every operation needs a helper - not every component
needs to be generalized

Do not artificially force inconsistency.

Allow **context-driven variation**.

------------------------------------------------------------------------

## 26. CODE QUALITY TARGET

Aim for:

``` text
                    CODE QUALITY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
      Readable       Practical       Maintainable
          │              │              │
          └──────────────┼──────────────┘
                         │
                  Simple where possible
                         │
                  Abstract when useful
```

The goal is not to make the code messy.

The goal is:

``` text
"Make the code understandable, practical,
and consistent with how a real developer
would naturally structure the project."
```

------------------------------------------------------------------------

## 27. DO NOT CHANGE EVERYTHING

Before editing a file, ask:

> Does this file actually need improvement?

If the answer is no, **leave it alone**.

Good refactoring does not mean changing every line.

Avoid unnecessary churn.

------------------------------------------------------------------------

## 28. FINAL VERIFICATION

After completing the refactoring, run:

``` text
dependency installation
linting
type checking (if applicable)
build
tests
application startup
```

Then manually verify the major application flows.

Check for: - console errors - API errors - broken imports - missing
environment variables - database errors - frontend rendering problems -
broken routes - authentication issues - broken forms - unexpected UI
changes

------------------------------------------------------------------------

## 29. FINAL REPORT

At the end, provide a concise report containing:

### Files inspected

List the important files reviewed.

### Files modified

List only files actually changed.

### Main improvements

Explain: - naming improvements - simplifications - removed duplication -
architecture improvements - dead-code removal - readability improvements

### Functionality verification

State which important flows were tested.

### Potential issues

Mention anything that could not be fully verified.

------------------------------------------------------------------------

## 30. ABSOLUTE RULES

1.  **Do not rebuild the application from scratch.**
2.  **Do not remove working features.**
3.  **Do not intentionally introduce bugs.**
4.  **Do not intentionally make code worse.**
5.  **Do not hard-code secrets.**
6.  **Do not change APIs unnecessarily.**
7.  **Do not change the database unnecessarily.**
8.  **Do not add unnecessary dependencies.**
9.  **Do not create unnecessary abstractions.**
10. **Do not rewrite files that are already good.**
11. **Do not modify functionality just for stylistic reasons.**
12. **Prefer simple and understandable implementations.**
13. **Test after meaningful changes.**
14. **Preserve the existing project's behavior.**
15. **If uncertain about a potentially breaking change, inspect
    dependencies and usage before modifying it.**

------------------------------------------------------------------------

# FINAL INSTRUCTION

Treat this as an existing software project maintained by developers.

**First understand it.**

**Then improve it.**

**Do not blindly rewrite it.**

Do not optimize for artificial stylistic inconsistency.

Optimize for:

**clarity + practicality + maintainability + preserved functionality.**

The final result should be a clean, understandable codebase where each
implementation choice makes sense in its context.
