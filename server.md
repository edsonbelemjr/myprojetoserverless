https://github.com/nestjs/ng-universal

https://github.com/nestjs/ng-universal


Mayron Ceccon  11:20 AM
1 - Autenticação API ANYMARKET(endpoints)
token: https://keepersecurity.com/vault/#detail/l6nbvNCjCAsYm45zrPMtaA
appId: https://keepersecurity.com/vault/#detail/PVLjbjFjdABpK-fdf1Fn-w
New

Mayron Ceccon  4:09 PM
https://documenter.getpostman.com/view/7213315/TW76CPzn#intro
4:13
https://gitlab.olist.io/partners/anymarket/integration-anymarket
4:14
https://miro.com/app/board/uXjVOQY7ySk=/

edson.junior  4:17 PM


Paulo Roberto Lima da Silva5:08 PM
https://www.schoolofnet.com/
https://fullcycle.com.br/
Paulo Roberto Lima da Silva5:10 PM
https://www.youtube.com/c/FullCycle/videos
Regina Beretta5:17 PM
https://app.callrox.com/37/trail/287


https://geekblog.com.br/dual-boot-entenda-o-que-e-e-como-fazer/

=================================================================
import { Ctx } from "blitz"
import { authenticateUser } from "app/auth/auth-utils"
import { LoginInput, LoginInputType } from "../validations"

export default async function login(input: LoginInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await session.$create({ userId: user.id })

  return user
}


====================================================


import { Ctx } from "blitz"
import { authenticateUser } from "app/auth/auth-utils"
import { LoginInput, LoginInputType } from "../validations"

export default async function login(input: LoginInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = LoginInput.parse(input)

  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  await session.$create({ userId: user.id })

  return user
}

============


import { Ctx } from "blitz"

export default async function logout(_: any, { session }: Ctx) {
  return await session.$revoke()
}

======================

import { Ctx, SecurePassword } from "blitz"
import db from "db"
import { SignupInput, SignupInputType } from "app/auth/validations"
import { gql } from "graphql-request"

export default async function signup(input: SignupInputType, { session }: Ctx) {
  // This throws an error if input is invalid
  const { email, password } = SignupInput.parse(input)

  const hashedPassword = await SecurePassword.hash(password)
  const { user } = await db.request(
    gql`
      mutation createUser($email: String!, $hashedPassword: String, $role: String!) {
        user: createUser(data: { email: $email, hashedPassword: $hashedPassword, role: $role }) {
          id: _id
          email
          name
          role
        }
      }
    `,
    { email: email.toLowerCase(), hashedPassword, role: "user" }
  )
  console.log("Create user result:", user)

=====================================================




import { useRouter, BlitzPage } from "blitz"
import Layout from "app/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <LoginForm onSuccess={() => router.push("/")} />
    </div>
  )
}

LoginPage.getLayout = (page) => <Layout title="Log In">{page}</Layout>

export default LoginPage


===================================


import { useRouter, BlitzPage } from "blitz"
import Layout from "app/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <SignupForm onSuccess={() => router.push("/")} />
    </div>
  )
}

SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage


==================================
import { SecurePassword, AuthenticationError } from "blitz"
import db from "db"
import { gql } from "graphql-request"

export const authenticateUser = async (email: string, password: string) => {
  const { user } = await db.request(
    gql`
      query getUser($email: String!) {
        user: findUserByEmail(email: $email) {
          id: _id
          email
          name
          role
          hashedPassword
        }
      }
    `,
    { email: email.toLowerCase() }
  )

  if (!user || !user.hashedPassword) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.request(
      gql`
        mutation UpdateUser($data: UserInput!) {
          updateUser(data: $data) {
            id: _id
          }
        }
      `,
      {
        data: {
          id: user.id,
          hashedPassword: improvedHash,
        },
      }
    )
  }

  const { hashedPassword, ...rest } = user
  return rest
}


==========================================
import { z } from "zod"

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(100),
})
export type SignupInputType = z.infer<typeof SignupInput>

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginInputType = z.infer<typeof LoginInput>


======================================================

import { Head, BlitzLayout } from "blitz"

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "fauna"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </>
  )
}

export default Layout


=========================================

import { Ctx } from "blitz"
import db from "db"
import { gql } from "graphql-request"

export default async function getCurrentUser(_ = null, { session }: Ctx) {
  if (!session.userId) return null

  const { user } = await db.request(
    gql`
      query getUser($id: ID!) {
        user: findUserByID(id: $id) {
          id: _id
          email
          name
          role
        }
      }
    `,
    { id: session.userId }
  )

  return user
}


===================


import { GraphQLClient } from "graphql-request"

const graphQLClient = new GraphQLClient(process.env.FAUNA_GRAPHQL_URL, {
  headers: {
    authorization: "Bearer " + process.env.FAUNA_SECRET,
  },
})

export default graphQLClient


======================

import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized
    PublicData: {
      userId: string
    }
  }
}

===================================


import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized
    PublicData: {
      userId: string
    }
  }
}


===================


import db from "db"
import {BlitzApiRequest, BlitzApiResponse} from "blitz"

export default async function users(_req: BlitzApiRequest, res: BlitzApiResponse) {
  const products = await db.product.findMany()
  res.status(200).send(products)
}


====================================

{
  "name": "Using fixtures to represent data",
  "email": "hello@cypress.io",
  "body": "Fixtures are a great way to mock data for responses to routes"
}


===================

describe("admin#index page", () => {
  beforeEach(() => {
    cy.visit("/admin")
  })

  it("Has H1", () => {
    cy.visit("/admin")
    cy.contains("h1", "Store Admin")
  })

  it("goes to admin/products page", () => {
    cy.contains("a", "Manage Products").click()
    cy.location("pathname").should("equal", "/admin/products")
  })
})

export {}


==========================

describe("index page", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("Has title and H1", () => {
    cy.contains("h1", "Blitz Store Example")
    cy.title().should("eq", "Blitz Example Store")
    cy.get("#referer").contains("http://localhost:3099")
  })

  it("goes to products page", () => {
    cy.contains("a", "Static Product Listings").click()
    cy.location("pathname").should("equal", "/products")
  })

  it("goes to admin page", () => {
    cy.contains("a", "Admin Section (client-rendered)").click()
    cy.location("pathname").should("equal", "/admin/products")
  })
})

export {}

====================


/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
}

=====================

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "storeId" INTEGER
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "price" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product.handle_unique" ON "Product"("handle");

==================================


generator client {
  provider = "prisma-client-js"
}

// --------------------------------------

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  email     String   @unique
  name      String?
  role      String?
  storeId   Int?
}

model Product {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  handle      String   @unique
  name        String?
  description String?
  price       Int?

  variants Variant[]
}

model Variant {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  name      String
  product   Product  @relation(fields: [productId], references: [id])
  productId Int
}


======================

import db from "./index"

const randomString = (len: number, offset = 3) => {
  let output = ""

  for (let i = 0; i < len + Math.ceil((Math.random() - 0.5) * offset); i++) {
    const ascii = Math.floor(Math.random() * 26) + (i % 2 === 0 ? 97 : 65)
    output += String.fromCharCode(ascii)
  }

  return output
}

const randomProduct = () => {
  return {
    name: randomString(10),
    handle: randomString(6, 0),
    description: Array.from(new Array(10), () => randomString(10)).join(" "),
    price: Math.floor(Math.random() * 10000),
  }
}

const seed = async () => {
  for (let i = 0; i < 5; i++) {
    await db.product.create({data: randomProduct()})
  }
  await db.user.create({data: {email: randomString(5) + "@bar.com", name: "Foobar"}})
}

export default seed


==================


DATABASE_URL=postgresql://USERNAME@localhost:5432/blitz-example-store

===============


{
  "baseUrl": "http://localhost:3099",
  "defaultCommandTimeout": 10000,
  "retries": {
    "runMode": 1
  },
  "video": false,
  "chromeWebSecurity": false
}


===================


module.exports = {
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        modules: false,
        loose: true,
        exclude: [
          "@babel/plugin-transform-async-to-generator",
          "@babel/plugin-transform-regenerator",
        ],
      },
    ],
  ],
  plugins: [
    "babel-plugin-annotate-pure-calls",
    "babel-plugin-dev-expression",
    ["@babel/plugin-proposal-class-properties", {loose: true}],
    "babel-plugin-macros",
    [
      "transform-inline-environment-variables",
      {
        include: ["BLITZ_PROD_BUILD"],
      },
    ],
  ],
  overrides: [
    {
      test: "./test/**/*",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            exclude: [
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-regenerator",
            ],
          },
        ],
        "blitz/babel",
      ],
      plugins: [],
    },
    {
      test: "./nextjs/test/**/*",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            exclude: [
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-regenerator",
            ],
          },
        ],
        "blitz/babel",
      ],
    },
  ],
}


=================


const {jsWithBabel: tsjPreset} = require("ts-jest/preset")

module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["<rootDir>/tmp", "<rootDir>/dist", "<rootDir>/templates"],
  moduleNameMapper: {},
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    ...tsjPreset.transform,
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  testMatch: ["<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}"],
  testURL: "http://localhost",
  // watchPlugins: [
  //   require.resolve("jest-watch-typeahead/filename"),
  //   require.resolve("jest-watch-typeahead/testname"),
  // ],
  coverageReporters: ["json", "lcov", "text", "clover"],
  // collectCoverage: !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  coveragePathIgnorePatterns: ["/templates/"],
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.test.json",
      isolatedModules: true,
    },
  },
}



=================


module.exports = {
  testMatch: ["**/*.test.js", "**/*.test.ts"],
  verbose: true,
  rootDir: "test",
  modulePaths: ["<rootDir>/lib"],
  moduleNameMapper: {
    "^lib/(.+)$": "<rootDir>/lib/$1",
  },
  globalSetup: "<rootDir>/jest-global-setup.js",
  globalTeardown: "<rootDir>/jest-global-teardown.js",
  setupFilesAfterEnv: ["<rootDir>/jest-setup-after-env.js"],
  testEnvironment: "<rootDir>/jest-environment.js",
}

====================================







---
description: API Routes provide built-in middlewares that parse the incoming request. Learn more about them here.
---

# API Middlewares

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-middleware">API Routes with middleware</a></li>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-cors">API Routes with CORS</a></li>
  </ul>
</details>

API routes provide built in middlewares which parse the incoming request (`req`). Those middlewares are:

- `req.cookies` - An object containing the cookies sent by the request. Defaults to `{}`
- `req.query` - An object containing the [query string](https://en.wikipedia.org/wiki/Query_string). Defaults to `{}`
- `req.body` - An object containing the body parsed by `content-type`, or `null` if no body was sent

## Custom config

Every API route can export a `config` object to change the default configs, which are the following:

```js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
```

The `api` object includes all configs available for API routes.

`bodyParser` Enables body parsing, you can disable it if you want to consume it as a `Stream`:

```js
export const config = {
  api: {
    bodyParser: false,
  },
}
```

`bodyParser.sizeLimit` is the maximum size allowed for the parsed body, in any format supported by [bytes](https://github.com/visionmedia/bytes.js), like so:

```js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500kb',
    },
  },
}
```

`externalResolver` is an explicit flag that tells the server that this route is being handled by an external resolver like _express_ or _connect_. Enabling this option disables warnings for unresolved requests.

```js
export const config = {
  api: {
    externalResolver: true,
  },
}
```

## Connect/Express middleware support

You can also use [Connect](https://github.com/senchalabs/connect) compatible middleware.

For example, [configuring CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for your API endpoint can be done leveraging the [cors](https://www.npmjs.com/package/cors) package.

First, install `cors`:

```bash
npm i cors
# or
yarn add cors
```

Now, let's add `cors` to the API route:

```js
import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors)

  // Rest of the API logic
  res.json({ message: 'Hello Everyone!' })
}

export default handler
```

> Go to the [API Routes with CORS](https://github.com/vercel/next.js/tree/canary/examples/api-routes-cors) example to see the finished app

## Extending the `req`/`res` objects with TypeScript

For better type-safety, it is not recommended to extend the `req` and `res` objects. Instead, use functions to work with them:

```ts
// utils/cookies.ts

import { serialize, CookieSerializeOptions } from 'cookie'
import { NextApiResponse } from 'next'

/**
 * This sets `cookie` using the `res` object
 */

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

// pages/api/cookies.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from '../../utils/cookies'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Calling our pure function using the `res` object, it will add the `set-cookie` header
  setCookie(res, 'Next.js', 'api-middleware!')
  // Return the `set-cookie` header so we can display it in the browser and show that it works!
  res.end(res.getHeader('Set-Cookie'))
}

export default handler
```

If you can't avoid these objects from being extended, you have to create your own type to include the extra properties:

```ts
// pages/api/foo.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { withFoo } from 'external-lib-foo'

type NextApiRequestWithFoo = NextApiRequest & {
  foo: (bar: string) => void
}

const handler = (req: NextApiRequestWithFoo, res: NextApiResponse) => {
  req.foo('bar') // we can now use `req.foo` without type errors
  res.end('ok')
}

export default withFoo(handler)
```

Keep in mind this is not safe since the code will still compile even if you remove `withFoo()` from the export.

===================

---
description: You can add the dynamic routes used for pages to API Routes too. Learn how it works here.
---

# Dynamic API Routes

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes">Basic API Routes</a></li>
  </ul>
</details>

API routes support [dynamic routes](/docs/routing/dynamic-routes.md), and follow the same file naming rules used for `pages`.

For example, the API route `pages/api/post/[pid].js` has the following code:

```js
export default function handler(req, res) {
  const { pid } = req.query
  res.end(`Post: ${pid}`)
}
```

Now, a request to `/api/post/abc` will respond with the text: `Post: abc`.

### Index routes and Dynamic API routes

A very common RESTful pattern is to set up routes like this:

- `GET api/posts` - gets a list of posts, probably paginated
- `GET api/posts/12345` - gets post id 12345

We can model this in two ways:

- Option 1:
  - `/api/posts.js`
  - `/api/posts/[postId].js`
- Option 2:
  - `/api/posts/index.js`
  - `/api/posts/[postId].js`

Both are equivalent. A third option of only using `/api/posts/[postId].js` is not valid because Dynamic Routes (including Catch-all routes - see below) do not have an `undefined` state and `GET api/posts` will not match `/api/posts/[postId].js` under any circumstances.

### Catch all API routes

API Routes can be extended to catch all paths by adding three dots (`...`) inside the brackets. For example:

- `pages/api/post/[...slug].js` matches `/api/post/a`, but also `/api/post/a/b`, `/api/post/a/b/c` and so on.

> **Note**: You can use names other than `slug`, such as: `[...param]`

Matched parameters will be sent as a query parameter (`slug` in the example) to the page, and it will always be an array, so, the path `/api/post/a` will have the following `query` object:

```json
{ "slug": ["a"] }
```

And in the case of `/api/post/a/b`, and any other matching path, new parameters will be added to the array, like so:

```json
{ "slug": ["a", "b"] }
```

An API route for `pages/api/post/[...slug].js` could look like this:

```js
export default function handler(req, res) {
  const { slug } = req.query
  res.end(`Post: ${slug.join(', ')}`)
}
```

Now, a request to `/api/post/a/b/c` will respond with the text: `Post: a, b, c`.

### Optional catch all API routes

Catch all routes can be made optional by including the parameter in double brackets (`[[...slug]]`).

For example, `pages/api/post/[[...slug]].js` will match `/api/post`, `/api/post/a`, `/api/post/a/b`, and so on.

The main difference between catch all and optional catch all routes is that with optional, the route without the parameter is also matched (`/api/post` in the example above).

The `query` objects are as follows:

```json
{ } // GET `/api/post` (empty object)
{ "slug": ["a"] } // `GET /api/post/a` (single-element array)
{ "slug": ["a", "b"] } // `GET /api/post/a/b` (multi-element array)
```

## Caveats

- Predefined API routes take precedence over dynamic API routes, and dynamic API routes over catch all API routes. Take a look at the following examples:
  - `pages/api/post/create.js` - Will match `/api/post/create`
  - `pages/api/post/[pid].js` - Will match `/api/post/1`, `/api/post/abc`, etc. But not `/api/post/create`
  - `pages/api/post/[...slug].js` - Will match `/api/post/1/2`, `/api/post/a/b/c`, etc. But not `/api/post/create`, `/api/post/abc`

## Related

For more information on what to do next, we recommend the following sections:

<div class="card">
  <a href="/docs/routing/dynamic-routes.md">
    <b>Dynamic Routes:</b>
    <small>Learn more about the built-in dynamic routes.</small>
  </a>
</div>

==============

---
description: Next.js supports API Routes, which allow you to build your API without leaving your Next.js app. Learn how it works here.
---

# API Routes

<details open>
  <summary><b>Examples</b></summary>
  <ul>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes">Basic API Routes</a></li>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-middleware">API Routes with middleware</a></li>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-graphql">API Routes with GraphQL</a></li>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-rest">API Routes with REST</a></li>
    <li><a href="https://github.com/vercel/next.js/tree/canary/examples/api-routes-cors">API Routes with CORS</a></li>
  </ul>
</details>

API routes provide a solution to build your **API** with Next.js.

Any file inside the folder `pages/api` is mapped to `/api/*` and will be treated as an API endpoint instead of a `page`. They are server-side only bundles and won't increase your client-side bundle size.

For example, the following API route `pages/api/user.js` returns a `json` response with a status code of `200`:

```js
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
}
```

For an API route to work, you need to export a function as default (a.k.a **request handler**), which then receives the following parameters:

- `req`: An instance of [http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage), plus some [pre-built middlewares](/docs/api-routes/api-middlewares.md)
- `res`: An instance of [http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse), plus some [helper functions](/docs/api-routes/response-helpers.md)

To handle different HTTP methods in an API route, you can use `req.method` in your request handler, like so:

```js
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Process a POST request
  } else {
    // Handle any other HTTP method
  }
}
```

To fetch API endpoints, take a look into any of the examples at the start of this section.

## Use Cases

For new projects, you can build your entire API with API Routes. If you have an existing API, you do not need to forward calls to the API through an API Route. Some other use cases for API Routes are:

- Masking the URL of an external service (e.g. `/api/secret` instead of `https://company.com/secret-url`)
- Using [Environment Variables](/docs/basic-features/environment-variables.md) on the server to securely access external services.

## Caveats

- API Routes [do not specify CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), meaning they are **same-origin only** by default. You can customize such behavior by wrapping the request handler with the [cors middleware](/docs/api-routes/api-middlewares.md#connectexpress-middleware-support).
- API Routes can't be used with [`next export`](/docs/advanced-features/static-html-export.md)

## Related

For more information on what to do next, we recommend the following sections:

<div class="card">
  <a href="/docs/api-routes/api-middlewares.md">
    <b>API Middlewares:</b>
    <small>learn about the built-in middlewares for the request.</small>
  </a>
</div>

<div class="card">
  <a href="/docs/api-routes/response-helpers.md">
    <b>Response Helpers:</b>
    <small>learn about the built-in methods for the response.</small>
  </a>
</div>

<div class="card">
  <a href="/docs/basic-features/typescript.md#api-routes">
    <b>TypeScript:</b>
    <small>Add TypeScript to your API Routes.</small>
  </a>
</div>


======================================



---
description: Learn how to upgrade Next.js.
---

# Upgrade Guide

## Upgrading from version 10 to 11

### Upgrade React version to latest

Most applications already use the latest version of React, with Next.js 11 the minimum React version has been updated to 17.0.2.

To upgrade you can run the following command:

```
npm install react@latest react-dom@latest
```

Or using `yarn`:

```
yarn add react@latest react-dom@latest
```

### Upgrade Next.js version to latest

To upgrade you can run the following command in the terminal:

```
npm install next@latest
```

or

```
yarn add next@latest
```

### Webpack 5

Webpack 5 is now the default for all Next.js applications. If you did not have custom webpack configuration your application is already using webpack 5. If you do have custom webpack configuration you can refer to the [Next.js webpack 5 documentation](https://nextjs.org/docs/messages/webpack5) for upgrading guidance.

### Cleaning the `distDir` is now a default

The build output directory (defaults to `.next`) is now cleared by default except for the Next.js caches. You can refer to [the cleaning `distDir` RFC](https://github.com/vercel/next.js/discussions/6009) for more information.

If your application was relying on this behavior previously you can disable the new default behavior by adding the `cleanDistDir: false` flag in `next.config.js`.

### `PORT` is now supported for `next dev` and `next start`

Next.js 11 supports the `PORT` environment variable to set the port the application has to run on. Using `-p`/`--port` is still recommended but if you were prohibited from using `-p` in any way you can now use `PORT` as an alternative:

Example:

```
PORT=4000 next start
```

### `next.config.js` customization to import images

Next.js 11 supports static image imports with `next/image`. This new feature relies on being able to process image imports. If you previously added the `next-images` or `next-optimized-images` packages you can either move to the new built-in support using `next/image` or disable the feature:

```js
module.exports = {
  images: {
    disableStaticImages: true,
  },
}
```

### Remove `super.componentDidCatch()` from `pages/_app.js`

The `next/app` component's `componentDidCatch` has been deprecated since Next.js 9 as it's no longer needed and has since been a no-op, in Next.js 11 it has been removed.

If your `pages/_app.js` has a custom `componentDidCatch` method you can remove `super.componentDidCatch` as it is no longer needed.

### Remove `Container` from `pages/_app.js`

This export has been deprecated since Next.js 9 as it's no longer needed and has since been a no-op with a warning during development. In Next.js 11 it has been removed.

If your `pages/_app.js` imports `Container` from `next/app` you can remove `Container` as it has been removed. Learn more in [the documentation](https://nextjs.org/docs/messages/app-container-deprecated).

### Remove `props.url` usage from page components

This property has been deprecated since Next.js 4 and has since shown a warning during development. With the introduction of `getStaticProps` / `getServerSideProps` these methods already disallowed usage of `props.url`. In Next.js 11 it has been removed completely.

You can learn more in [the documentation](https://nextjs.org/docs/messages/url-deprecated).

### Remove `unsized` property on `next/image`

The `unsized` property on `next/image` was deprecated in Next.js 10.0.1. You can use `layout="fill"` instead. In Next.js 11 `unsized` was removed.

### Remove `modules` property on `next/dynamic`

The `modules` and `render` option for `next/dynamic` have been deprecated since Next.js 9.5 showing a warning that it has been deprecated. This was done in order to make `next/dynamic` close to `React.lazy` in API surface. In Next.js 11 the `modules` and `render` options have been removed.

This option hasn't been mentioned in the documentation since Next.js 8 so it's less likely that your application is using it.

If you application does use `modules` and `render` you can refer to [the documentation](https://nextjs.org/docs/messages/next-dynamic-modules).

### Remove `Head.rewind`

`Head.rewind` has been a no-op since Next.js 9.5, in Next.js 11 it was removed. You can safely remove your usage of `Head.rewind`.

### Moment.js locales excluded by default

Moment.js includes translations for a lot of locales by default. Next.js now automatically excludes these locales by default to optimize bundle size for applications using Moment.js.

To load a specific locale use this snippet:

```js
import moment from 'moment'
import 'moment/locale/ja'

moment.locale('ja')
```

You can opt-out of this new default by adding `excludeDefaultMomentLocales: false` to `next.config.js` if you do not want the new behavior, do note it's highly recommended to not disable this new optimization as it significantly reduces the size of Moment.js.

### Update usage of `router.events`

In case you're accessing `router.events` during rendering, in Next.js 11 `router.events` is no longer provided during pre-rendering. Ensure you're accessing `router.events` in `useEffect`:

```js
useEffect(() => {
  const handleRouteChange = (url, { shallow }) => {
    console.log(
      `App is changing to ${url} ${
        shallow ? 'with' : 'without'
      } shallow routing`
    )
  }

  router.events.on('routeChangeStart', handleRouteChange)

  // If the component is unmounted, unsubscribe
  // from the event with the `off` method:
  return () => {
    router.events.off('routeChangeStart', handleRouteChange)
  }
}, [router])
```

If your application uses `router.router.events` which was an internal property that was not public please make sure to use `router.events` as well.

## React 16 to 17

React 17 introduced a new [JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) that brings a long-time Next.js feature to the wider React ecosystem: Not having to `import React from 'react'` when using JSX. When using React 17 Next.js will automatically use the new transform. This transform does not make the `React` variable global, which was an unintended side-effect of the previous Next.js implementation. A [codemod is available](/docs/advanced-features/codemods.md#add-missing-react-import) to automatically fix cases where you accidentally used `React` without importing it.

## Upgrading from version 9 to 10

There were no breaking changes between version 9 and 10.

To upgrade run the following command:

```
npm install next@10
```

Or using `yarn`:

```
yarn add next@10
```

## Upgrading from version 8 to 9

### Preamble

#### Production Deployment on Vercel

If you previously configured `routes` in your `vercel.json` file for dynamic routes, these rules can be removed when leveraging Next.js 9's new [Dynamic Routing feature](/docs/routing/dynamic-routes.md).

Next.js 9's dynamic routes are **automatically configured on [Vercel](https://vercel.com/)** and do not require any `vercel.json` customization.

You can read more about [Dynamic Routing here](/docs/routing/dynamic-routes.md).

#### Check your Custom <App> (`pages/_app.js`)

If you previously copied the [Custom `<App>`](/docs/advanced-features/custom-app.md) example, you may be able to remove your `getInitialProps`.

Removing `getInitialProps` from `pages/_app.js` (when possible) is important to leverage new Next.js features!

The following `getInitialProps` does nothing and may be removed:

```js
class MyApp extends App {
  // Remove me, I do nothing!
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render() {
    // ... etc
  }
}
```

### Breaking Changes

#### `@zeit/next-typescript` is no longer necessary

Next.js will now ignore usage `@zeit/next-typescript` and warn you to remove it. Please remove this plugin from your `next.config.js`.

Remove references to `@zeit/next-typescript/babel` from your custom `.babelrc` (if present).

Usage of [`fork-ts-checker-webpack-plugin`](https://github.com/Realytics/fork-ts-checker-webpack-plugin/issues) should also be removed from your `next.config.js`.

TypeScript Definitions are published with the `next` package, so you need to uninstall `@types/next` as they would conflict.

The following types are different:

> This list was created by the community to help you upgrade, if you find other differences please send a pull-request to this list to help other users.

From:

```tsx
import { NextContext } from 'next'
import { NextAppContext, DefaultAppIProps } from 'next/app'
import { NextDocumentContext, DefaultDocumentIProps } from 'next/document'
```

to

```tsx
import { NextPageContext } from 'next'
import { AppContext, AppInitialProps } from 'next/app'
import { DocumentContext, DocumentInitialProps } from 'next/document'
```

#### The `config` key is now an export on a page

You may no longer export a custom variable named `config` from a page (i.e. `export { config }` / `export const config ...`).
This exported variable is now used to specify page-level Next.js configuration like Opt-in AMP and API Route features.

You must rename a non-Next.js-purposed `config` export to something different.

#### `next/dynamic` no longer renders "loading..." by default while loading

Dynamic components will not render anything by default while loading. You can still customize this behavior by setting the `loading` property:

```jsx
import dynamic from 'next/dynamic'

const DynamicComponentWithCustomLoading = dynamic(
  () => import('../components/hello2'),
  {
    loading: () => <p>Loading</p>,
  }
)
```

#### `withAmp` has been removed in favor of an exported configuration object

Next.js now has the concept of page-level configuration, so the `withAmp` higher-order component has been removed for consistency.

This change can be **automatically migrated by running the following commands in the root of your Next.js project:**

```bash
curl -L https://github.com/vercel/next-codemod/archive/master.tar.gz | tar -xz --strip=2 next-codemod-master/transforms/withamp-to-config.js npx jscodeshift -t ./withamp-to-config.js pages/**/*.js
```

To perform this migration by hand, or view what the codemod will produce, see below:

**Before**

```jsx
import { withAmp } from 'next/amp'

function Home() {
  return <h1>My AMP Page</h1>
}

export default withAmp(Home)
// or
export default withAmp(Home, { hybrid: true })
```

**After**

```jsx
export default function Home() {
  return <h1>My AMP Page</h1>
}

export const config = {
  amp: true,
  // or
  amp: 'hybrid',
}
```

#### `next export` no longer exports pages as `index.html`

Previously, exporting `pages/about.js` would result in `out/about/index.html`. This behavior has been changed to result in `out/about.html`.

You can revert to the previous behavior by creating a `next.config.js` with the following content:

```js
// next.config.js
module.exports = {
  trailingSlash: true,
}
```

#### `./pages/api/` is treated differently

Pages in `./pages/api/` are now considered [API Routes](https://nextjs.org/blog/next-9#api-routes).
Pages in this directory will no longer contain a client-side bundle.

## Deprecated Features

#### `next/dynamic` has deprecated loading multiple modules at once

The ability to load multiple modules at once has been deprecated in `next/dynamic` to be closer to React's implementation (`React.lazy` and `Suspense`).

Updating code that relies on this behavior is relatively straightforward! We've provided an example of a before/after to help you migrate your application:

**Before**

```jsx
import dynamic from 'next/dynamic'

const HelloBundle = dynamic({
  modules: () => {
    const components = {
      Hello1: () => import('../components/hello1').then((m) => m.default),
      Hello2: () => import('../components/hello2').then((m) => m.default),
    }

    return components
  },
  render: (props, { Hello1, Hello2 }) => (
    <div>
      <h1>{props.title}</h1>
      <Hello1 />
      <Hello2 />
    </div>
  ),
})

function DynamicBundle() {
  return <HelloBundle title="Dynamic Bundle" />
}

export default DynamicBundle
```

**After**

```jsx
import dynamic from 'next/dynamic'

const Hello1 = dynamic(() => import('../components/hello1'))
const Hello2 = dynamic(() => import('../components/hello2'))

function HelloBundle({ title }) {
  return (
    <div>
      <h1>{title}</h1>
      <Hello1 />
      <Hello2 />
    </div>
  )
}

function DynamicBundle() {
  return <HelloBundle title="Dynamic Bundle" />
}

export default DynamicBundle
```
==============================


const escape = require('shell-quote').quote
const { ESLint } = require('eslint')

const eslint = new ESLint()
const isWin = process.platform === 'win32'

module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => {
    const escapedFileNames = filenames
      .map((filename) => `"${isWin ? filename : escape([filename])}"`)
      .join(' ')
    return [
      `prettier --with-node-modules --ignore-path .prettierignore_staged --write ${escapedFileNames}`,
      `eslint --no-ignore --max-warnings=0 --fix ${filenames
        .filter((file) => !eslint.isPathIgnored(file))
        .map((f) => `"${f}"`)
        .join(' ')}`,
    ]
  },
  '**/*.{json,md,mdx,css,html,yml,yaml,scss}': (filenames) => {
    const escapedFileNames = filenames
      .map((filename) => `"${isWin ? filename : escape([filename])}"`)
      .join(' ')
    return [
      `prettier --with-node-modules --ignore-path .prettierignore_staged --write ${escapedFileNames}`,
    ]
  },
}


========================
{
  "name": "root",
  "workspaces": {
    "packages": [
      "packages/*",
      "nextjs",
      "nextjs/packages/next",
      "nextjs/packages/next-mdx",
      "nextjs/packages/installer",
      "nextjs/packages/eslint-config-next",
      "nextjs/packages/eslint-plugin-next",
      "nextjs/packages/next-env",
      "examples/*",
      "recipes/*"
    ],
    "nohoist": [
      "**/@prisma",
      "**/@prisma/**"
    ]
  },
  "preconstruct": {
    "packages": [
      "packages/*",
      "nextjs/packages/installer",
      "!packages/cli",
      "!packages/eslint-config"
    ]
  },
  "scripts": {
    "postinstall": "husky install && patch-package",
    "wait:nextjs": "wait-on -d 1000 nextjs/packages/next/dist/build/index.js",
    "wait:nextjs-types": "wait-on -d 1000 nextjs/packages/next/dist/build/index.d.ts",
    "dev:nextjs": "yarn workspace next dev",
    "dev:next-env": "yarn workspace @blitzjs/env dev",
    "dev:nextjs-types": "yarn wait:nextjs && yarn workspace next types && echo 'Finished building nextjs types'",
    "dev:blitz": "cross-env BLITZ_PROD_BUILD=true preconstruct watch",
    "dev:tsc": "yarn dev:nextjs-types && tsc --watch --pretty --preserveWatchOutput",
    "dev:cli": "yarn wait:nextjs-types && yarn workspace @blitzjs/cli dev",
    "dev:templates": "yarn workspace @blitzjs/generator dev",
    "dev": "concurrently --names \"nextjs,blitz,typecheck,cli,templates,next-env\" -c \"magenta,cyan,green,yellow,black,blue\" -p \"{name}\" \"npm:dev:nextjs\" \"npm:dev:blitz\" \"npm:dev:tsc\" \"npm:dev:cli\" \"npm:dev:templates\" \"npm:dev:next-env\"",
    "build:nextjs": "yarn workspace next prepublish",
    "build:next-env": "yarn workspace @blitzjs/env prepublish",
    "build": "yarn build:nextjs && yarn build:next-env && cross-env BLITZ_PROD_BUILD=true preconstruct build && ultra -r --filter \"packages/*\" buildpkg && tsc",
    "lint": "eslint --ext \".js,.ts,.tsx\" .",
    "link-cli": "yarn workspace blitz link",
    "unlink-cli": "yarn workspace blitz unlink",
    "test": "yarn run lint && yarn run build && ultra -r test",
    "testheadless": "cross-env HEADLESS=true yarn test:integration",
    "test:integration": "jest --runInBand",
    "test:packages": "yarn run build && yarn testonly:packages",
    "test:examples": "yarn run build && yarn testonly:examples",
    "test:nextjs-size": "yarn --cwd nextjs testheadless --testPathPattern \"integration/(build-output|size-limit|fallback-modules)\"",
    "testonly": "yarn test:packages && yarn test:examples",
    "testonly:packages": "ultra -r --filter \"packages/*\" --concurrency 15 test",
    "testonly:examples": "ultra -r --filter \"examples/*\" --concurrency 1 test",
    "reset": "rimraf node_modules && git clean -xfd packages && git clean -xfd test && git clean -xfd nextjs && yarn",
    "publish-prep": "yarn && yarn build",
    "prepack": "node scripts/prepack.js",
    "postpublish": "rimraf packages/blitz/README.md && git checkout packages/blitz/package.json && git checkout nextjs/packages/next/package.json",
    "publish-local": "yarn workspaces run yalc publish",
    "publish-canary": "yarn run publish-prep && lerna publish --no-private --force-publish --preid canary --pre-dist-tag canary && manypkg fix && git add . && git commit -m 'bump recipe/example versions (ignore)' --no-verify && git push",
    "publish-latest": "yarn run publish-prep && lerna publish --no-private --force-publish && manypkg fix && git add . && git commit -m 'bump recipe/example versions (ignore)' --no-verify && git push",
    "publish-danger": "lerna publish --canary --