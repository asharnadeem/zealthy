import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono, TypedResponse } from "hono";
import { cors } from "hono/cors";
import { groupBy } from "lodash";
import { db } from "./db";
import { onboardingPagesTable, userAddressesTable, usersTable } from "./schema";
import { seedDatabase } from "./seed";
import {
  CreateUserRequestSchema,
  GetDataPageResponse,
  GetDataPageResponseSchema,
  GetOnboardingFormResponse,
  GetOnboardingFormResponseSchema,
  UpdateOnboardingFormRequestSchema,
} from "./types";

seedDatabase();

const app = new Hono()
  .use(cors())
  .get(
    "/onboarding-form",
    async (c): Promise<TypedResponse<GetOnboardingFormResponse>> => {
      const pages = await db
        .select({
          index: onboardingPagesTable.index,
          components: onboardingPagesTable.components,
        })
        .from(onboardingPagesTable)
        .orderBy(asc(onboardingPagesTable.index));
      return c.json(GetOnboardingFormResponseSchema.parse(pages), 200);
    }
  )
  .put(
    "/onboarding-form",
    zValidator("json", UpdateOnboardingFormRequestSchema),
    async (c): Promise<Response> => {
      const input = c.req.valid("json");
      const groupedByIndex = groupBy(input, "index");
      for (const index in groupedByIndex) {
        if (groupedByIndex[index].length === 0) {
          return c.json(
            { error: "Each index must have at least one component" },
            400
          );
        }
      }
      return await db.transaction(async (tx) => {
        await db.delete(onboardingPagesTable);
        await tx.insert(onboardingPagesTable).values(input);
        return c.json(null, 200);
      });
    }
  )
  .get("/data", async (c): Promise<TypedResponse<GetDataPageResponse>> => {
    const data = await db
      .select({
        email: usersTable.email,
        aboutMe: usersTable.aboutMe,
        birthday: usersTable.birthday,
        address: {
          street: userAddressesTable.street,
          city: userAddressesTable.city,
          state: userAddressesTable.state,
          zipCode: userAddressesTable.zipCode,
        },
      })
      .from(usersTable)
      .innerJoin(
        userAddressesTable,
        eq(usersTable.id, userAddressesTable.userId)
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          birthday: row.birthday?.toISOString(),
        }))
      );
    return c.json(GetDataPageResponseSchema.parse(data), 200);
  })
  .post(
    "/users",
    zValidator("json", CreateUserRequestSchema),
    async (c): Promise<Response> => {
      const {
        email,
        password,
        dynamic: { aboutMe, birthday, address },
      } = c.req.valid("json");
      return await db.transaction(async (tx) => {
        const user = await tx
          .insert(usersTable)
          .values({
            email,
            password: await Bun.password.hash(password),
            aboutMe,
            birthday: new Date(birthday),
          })
          .returning()
          .then((rows) => rows[0]);
        await tx
          .insert(userAddressesTable)
          .values({ userId: user.id, ...address });
        return c.json(null, 201);
      });
    }
  );

export default app;
