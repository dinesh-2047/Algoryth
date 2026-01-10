# TODO: Enhance CodeEditor and Replace Static Problems with Database

## 1. Install Dependencies
- [ ] Install Prisma, @prisma/client, and pg (PostgreSQL client)

## 2. Set Up Prisma
- [ ] Initialize Prisma (npx prisma init)
- [ ] Create schema.prisma with models for Problem, User, Submission
- [ ] Generate Prisma client

## 3. Migrate Data from problems.js
- [ ] Create a migration script to insert data from problems.js into DB
- [ ] Run Prisma migrations

## 4. Enhance CodeEditor.jsx
- [ ] Enable all languages in selector (JavaScript, TypeScript, C++, Python)
- [ ] Enable auto-completion in Monaco options
- [ ] Add theme selector (vs-dark, vs-light, etc.)
- [ ] Add "Run Code" button that calls /api/execute

## 5. Update APIs
- [ ] Modify /api/problems/route.js to query DB instead of static file
- [ ] Modify /api/problems/[slug]/route.js to query DB
- [ ] Add new /api/execute/route.js for code execution (basic Node.js eval)

## 6. Remove Static File
- [ ] Delete src/lib/problems.js after migration

## 7. Test and Followup
- [ ] Test the app locally
- [ ] Ensure execution engine works
- [ ] Verify DB queries work
