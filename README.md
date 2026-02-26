# InfinixFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Run backend + frontend together (local dev)

### Backend (Spring Boot + MySQL)

- **Prereqs**: Java 17, Maven, MySQL running locally.
- **Config**: backend default port is **`8081`** (see backend `application.properties`).
- **Run**:

```bash
mvn spring-boot:run
```

### Frontend (Angular)

This Angular app uses a dev proxy so all API calls go to **`/api/...`** (no CORS issues).

- **Proxy**: `proxy.conf.json` forwards `/api` to `http://localhost:8081`.
- **Run**:

```bash
npm install
npm start
```

### Quick URLs

- **Frontend**: `http://localhost:4200`
- **Backoffice Vehicles CRUD**: `http://localhost:4200/admin/vehicles`
- **Marketplace**: `http://localhost:4200/vehicles`
- **Backend API (vehicles)**: `http://localhost:8081/api/vehicles`

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
