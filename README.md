# Member Management System (Mini)

**Document ID**: YV-HR-INT-MERN-01  
**Candidate Take-Home Assignment**: Software Engineer Internship (MERN Stack)  
**Company**: Yarl Ventures (PVT) Ltd.  

---

##  Setup Steps & Execution Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection URI.

---

### 1. Server Setup (`/server`)

```bash
cd server
npm install
npm run seed
npm start
```
The backend server will run on `http://localhost:5000`.

---

### 2. Client Setup (`/client`)

```bash
cd client
npm install
npm start
```
The React frontend application will run on `http://localhost:3000`.

---

##  Chairman Login Credentials & Seed Data

### Chairman Account Details
- **Email**: `chairman@yarlventures.com`
- **Password**: `Chairman@123`
- **Role**: `CHAIRMAN` (Full Access, bypasses permission keys automatically)

### Seed Script Info (`npm run seed` in `/server`)
Running `npm run seed` automatically initializes:
1. **Chairman Account**: `chairman@yarlventures.com` / `Chairman@123`
2. **6 Permission Keys**: `member.view`, `application.view`, `application.approve`, `application.reject`, `role.manage`, `audit.view`
3. **3 Membership Types**:
   - Individual Standard (LKR 5,000 / year)
   - Individual Premium (LKR 15,000 / year)
   - Corporate Gold (LKR 50,000 / year)
4. **Default Officer Role**: `Senior Application Reviewer`

---

##  Environment Variables

### Backend Server (`/server/.env.example`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/member_management
JWT_SECRET=yarl_ventures_super_secret_jwt_key_2026_change_in_prod
JWT_EXPIRES_IN=1d
```

### Frontend Client (`/client/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

##  How Permission Checking Works (Section 8 & F-12)

The system implements strict Role-Based Access Control (RBAC) enforced on the backend via Express middleware (`permissionMiddleware.js`):

1. **Chairman Authority Rule (BR-05)**:
   - When a request arrives, `permissionMiddleware` checks `req.user.userType === 'CHAIRMAN'`.
   - If `CHAIRMAN`, the middleware bypasses key checks and grants immediate access (`next()`).

2. **Officer Role Key Enforcement (BR-06 & BR-12)**:
   - For `OFFICER` users, the middleware retrieves the user's populated `officerRoleId.permissions` array.
   - If the required permission key (e.g. `application.approve`) is present in the role's permission array, request proceeds.
   - If missing, the backend immediately halts execution and returns HTTP Status `403 Forbidden` with body:
     ```json
     {
       "success": false,
       "error": {
         "code": "FORBIDDEN",
         "message": "Permission denied. Missing required permission: 'application.approve'"
       }
     }
     ```

3. **Role Management Restriction (BR-08)**:
   - Permission key `role.manage` is restricted strictly to `userType === 'CHAIRMAN'`. Non-Chairman users receive HTTP `403`.

4. **Permission-Aware Frontend (F-12)**:
   - The React UI utilizes `hasPermission(key)` from `AuthContext` to dynamically hide navigation tabs and action buttons for unauthorized features.
   - Server-side validation strictly enforces permission checks regardless of frontend state.

---

##  Completed Features Checklist

- [x] **F-01**: Member account registration (email & password)
- [x] **F-02**: JWT login & logout
- [x] **F-03**: My profile & effective permissions list
- [x] **F-04**: Membership application submission (`INDIVIDUAL` vs `COMPANY`)
- [x] **F-05**: Application status tracking (`PENDING`, `APPROVED`, `REJECTED` with reason)
- [x] **F-06**: Staff application review list with status filtering & pagination
- [x] **F-07**: Application approval with auto-generated unique membership number (`YV-2026-XXXXXX`)
- [x] **F-08**: Application rejection requiring reason
- [x] **F-09**: Member directory listing with search (name/email), status filter, and pagination
- [x] **F-10**: Chairman screen to create Officer Roles & select permission keys
- [x] **F-11**: Chairman screen to assign Officer Roles to users
- [x] **F-12**: Permission enforcement middleware (returns HTTP 403 when missing permission, hides UI actions)
- [x] **F-13**: Comprehensive Audit Log tracking all approvals, rejections, role changes, and role assignments
- [x] **F-14**: Automated seed script creating Chairman, permissions list, and 3 membership types
- [x] **Bonus**: Jest unit test suite for permission middleware (`npm test` in `/server`)
- [x] **Bonus**: Export member directory as CSV (`GET /api/members/export/csv`)
- [x] **Bonus**: Dashboard summary count metrics (`GET /api/dashboard/stats`)

---

##  Incomplete Features & Known Issues

- None. All 14 required features and bonus items have been fully built, verified, and tested.

---

##  Mandatory Demo Video Link

- **Google Drive Link**: `[Insert your public Google Drive video link here]`  

