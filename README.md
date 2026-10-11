# StudentSync

A campus web application where students report lost and found items and exchange skills with each other.

- **Lost & Found:** report a lost or found item with its category, location and date. StudentSync scores likely matches between lost and found reports, lets a student submit a claim, and lets the reporter verify it and mark the item recovered.
- **Skill Exchange:** list the skills you can teach and the ones you want to learn, browse other students' profiles, send a learning request, schedule a session once it's accepted, and rate it afterwards.

| Layer | Technology |
|---|---|
| Frontend | React.js (JavaScript / JSX), Vite, React Router |
| Backend | Java 17, Spring Boot 3, Spring Web (REST API) |
| Database | MySQL, via Spring Data JPA |
| IDEs | VS Code (frontend), Spring Tools for Eclipse (backend) |

Student: Tirumala Sai Madhavan, 24EG107C55, AIML-C

---

## Project structure

```
StudentSync/
├── backend/                     Spring Boot project (open in STS)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/studentsync/
│       │   ├── StudentSyncApplication.java
│       │   ├── config/          CORS, password hashing, interceptor setup
│       │   ├── security/        Token check for protected endpoints
│       │   ├── model/           JPA entities: User, Item, Claim, Skill, SkillRequest
│       │   ├── repository/      Spring Data JPA repositories
│       │   ├── service/         MatchingService (lost/found matching)
│       │   ├── controller/      REST controllers
│       │   └── dto/             Request and response objects
│       └── resources/application.properties
└── frontend/                    React app (open in VS Code)
    ├── package.json
    └── src/
        ├── api.js               All REST calls
        ├── auth.jsx             Login state
        ├── components/          Layout, item tag, avatar, messages
        └── pages/               Landing, Login, Register, Dashboard, Items,
                                 ReportItem, ItemDetail, MyItems, Skills,
                                 MySkills, Requests, Profile
```

---

## What you need installed

- **JDK 17** or newer
- **Spring Tools for Eclipse (STS)**
- **MySQL Server 8** (with MySQL Workbench if you like)
- **Node.js 18** or newer (includes npm)
- **VS Code**
- **Git**

---

## 1. Run the backend in STS

1. Start MySQL. You don't need to create the database; the app creates `studentsync` on first run.
2. Open `backend/src/main/resources/application.properties` and set your MySQL login:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. In STS: **File > Import > Maven > Existing Maven Projects**, browse to the `backend` folder, and click **Finish**. Wait for the dependencies to download (bottom-right progress bar).
4. Right-click `StudentSyncApplication.java` > **Run As > Spring Boot App**.
5. The console should end with `Tomcat started on port 8080`. Tables are created automatically.

Quick check in a browser: <http://localhost:8080/api/stats> should show a small JSON object.

## 2. Run the frontend in VS Code

1. **File > Open Folder** and choose the `frontend` folder.
2. Open a terminal (**Terminal > New Terminal**) and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open <http://localhost:5173>. Create an account and start using the app.

If your backend runs on a different address, copy `.env.example` to `.env` and change `VITE_API_URL`.

To try the full flow, register two accounts (use a second browser or a private window): report a lost item from one and a matching found item from the other.

---

## How it works

### Login
`POST /api/auth/register` and `POST /api/auth/login` return a random token. The React app stores it and sends `Authorization: Bearer <token>` with every request. Passwords are stored as BCrypt hashes. Every `/api/**` endpoint except register, login and stats needs the token.

### Lost and found matching
When an item is opened, `MatchingService` compares it with open items of the opposite type in the same category and gives each a score out of 100:

| Signal | Points |
|---|---|
| Shared keywords in title and description | up to 60 |
| Same location (or a shared word in the location) | 25 (or 10) |
| Found within 2 / 7 / 30 days after the loss date | 15 / 10 / 5 |

Results scoring 20 or more are shown, best first, with the reasons.

### Flow (matches the project flow diagram)

```
Lost & Found:   report item -> view matches -> submit claim -> owner verifies -> item recovered
Skill Exchange: add skills -> browse / view profile -> send request -> accept or reject
                -> schedule session -> learner rates the session -> exchange completed
```

---

## REST API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/items?type=&category=&status=&q=` | View and search items |
| GET | `/api/items/mine` | My reports |
| GET | `/api/items/{id}` | Item details |
| POST | `/api/items` | Report a lost or found item |
| PUT | `/api/items/{id}` | Edit my report |
| DELETE | `/api/items/{id}` | Delete my report |
| GET | `/api/items/{id}/matches` | Possible matches |
| POST | `/api/items/{id}/claims` | Submit a claim |
| GET | `/api/items/{id}/claims` | Claims on my item |
| GET | `/api/claims/received` · `/api/claims/sent` | My claims |
| POST | `/api/claims/{id}/verify` | Verify claim, mark item recovered |
| POST | `/api/claims/{id}/reject` | Reject claim |
| GET | `/api/skills?kind=TEACH\|LEARN&q=` | Browse skills |
| GET | `/api/skills/mine` | My skills |
| POST | `/api/skills` | Add a skill |
| DELETE | `/api/skills/{id}` | Remove a skill |
| GET | `/api/users/{id}` | Student profile with skills and rating |
| PUT | `/api/users/me` | Edit my profile |
| POST | `/api/requests` | Send a learning request |
| GET | `/api/requests/received` · `/api/requests/sent` | My requests |
| POST | `/api/requests/{id}/accept` · `/reject` | Respond to a request |
| PUT | `/api/requests/{id}/schedule` | Set session time and place |
| POST | `/api/requests/{id}/feedback` | Rate the session and complete it |
| GET | `/api/stats` | Public counts for the landing page |

### Database tables
`users`, `items`, `claims`, `skills`, `skill_requests` (created by Hibernate from the entity classes).
