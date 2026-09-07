# NexusLock

Physical room access control: an **ESP32 with a fingerprint reader and a keypad** drives the lock, a **.NET 8 API** decides who is allowed in, and a **React admin panel** manages people, rooms and permissions. Every attempt — granted or denied — is logged.

---

## How it works

```
┌──────────────────────┐   HTTP    ┌────────────────────┐         ┌─────────┐
│ ESP32 at the door    │ ────────► │  .NET 8 Web API    │ ──────► │  MySQL  │
│ fingerprint · keypad │  attempt  │  RBAC + audit log  │         └─────────┘
│ relay → lock         │ ◄──────── │                    │              ▲
└──────────────────────┘  allow?   └────────────────────┘              │
                                            ▲                   ┌──────────────┐
                                            └───────────────────│ React admin  │
                                                                └──────────────┘
```

The door hardware holds **no access rules**. It captures a fingerprint or a keypad code, posts an attempt to `/api/AccessAttempt/attempt`, and does exactly one thing with the answer: energise the relay for two seconds, or not. Every authorisation decision is made server-side and written to the log before the door moves.

That split is the whole design. A lock that decides locally is a lock you have to re-flash to revoke someone.

## Authorization model

Several tables, because "who can open which door" is not a single relationship:

| Table | Meaning |
|---|---|
| `Employees` | People |
| `Roles` + `EmployeeRoles` | A person holds roles |
| `Permissions` + `RolePermissions` | A role grants permissions |
| `EmployeeRoomAccess` | Access to a specific room, granted per person |
| `AccessLogs` | Every attempt, with outcome and timestamp |

Enforcement is **policy-based**, through ASP.NET Core's authorization pipeline — [`PermissionRequirement`](Nexus-webapi/api/Authorization/PermissionRequirement.cs) and [`PermissionHandler`](Nexus-webapi/api/Authorization/PermissionHandler.cs) — rather than `if (user.Role == "admin")` scattered through controllers. Granting a capability means adding a row, not editing an endpoint.

`AccessLogs` is append-only by intent: the point of an access control system is being able to answer "who went in, and when" afterwards.

## Hardware

`esp32/prototype/prototype.ino`

| Component | Purpose |
|---|---|
| ESP32 | Wi-Fi, orchestration |
| FPM fingerprint sensor | Biometric identification (pins 25/32) |
| 4×4 matrix keypad | PIN entry fallback |
| Relay on GPIO 13 | Drives the strike; 2 s activation |

> **Before flashing:** the prototype sketch has the Wi-Fi SSID, password and API address written into the source as constants. Replace `ssid`, `password` and `serverUrl` with your own, and keep real credentials out of version control.

## Stack

**API** — .NET 8 · ASP.NET Core · Entity Framework Core (Pomelo MySQL) · Dapper · JWT Bearer · BCrypt · Swagger

**Frontend** — React · React Router · React Bootstrap · Axios · protected routes

**Firmware** — Arduino/ESP32 · ArduinoJson · FPM · Keypad

**Database** — MySQL, with a MySQL Workbench model and seed data in [`database/`](database)

## API

| Controller | Purpose |
|---|---|
| `AccessAttemptController` | The door's endpoint — takes an attempt, returns allow/deny, writes the log |
| `AccessLogsController` | Audit trail |
| `AuthController` | Login, JWT issue |
| `EmployeesController` · `RolesController` · `PermissionsController` · `RolePermissionsControllers` · `EmployeeRoleController` | RBAC administration |
| `EmployeeRoomAccessController` | Per-person room grants |
| `RoomsController` | Rooms and their devices |

Swagger is served at `/swagger` in development.

## Running it

```bash
mysql -u root -p < database/Modelo-BD-NexusLock-text.sql
```

```bash
cd Nexus-webapi/api && dotnet run
```

```bash
cd frontend && npm install && npm run dev
```

Set the connection string and `JwtSettings` in `appsettings.json` before the first run.

## Status

Built in 2024 as a prototype. Kept public as a reference for the hardware-plus-RBAC pattern; not actively maintained.

## License

See [LICENSE](LICENSE).
