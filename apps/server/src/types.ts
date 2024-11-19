import { z } from "zod";
import app from ".";

export type App = typeof app;

const ComponentTypeSchema = z.union([
  z.literal("text"),
  z.literal("textarea"),
  z.literal("password"),
  z.literal("number"),
  z.literal("date"),
  z.lazy(() => ComponentSchema),
  z.lazy(() => z.array(ComponentSchema)),
]);

export type Component = {
  name: string;
  key: string;
  type:
    | "text"
    | "textarea"
    | "password"
    | "number"
    | "date"
    | Component
    | Component[];
};
export const ComponentSchema: z.ZodType<Component> = z.object({
  name: z.string(),
  key: z.string(),
  type: ComponentTypeSchema,
});

export type GetOnboardingFormResponse = z.infer<
  typeof GetOnboardingFormResponseSchema
>;
export const GetOnboardingFormResponseSchema = z.array(
  z.object({
    index: z.number(),
    components: z.array(
      z.object({
        name: z.string(),
        key: z.string(),
        type: ComponentTypeSchema,
      })
    ),
  })
);

export type UpdateOnboardingFormRequest = z.infer<
  typeof UpdateOnboardingFormRequestSchema
>;
export const UpdateOnboardingFormRequestSchema = z.array(
  z.object({
    index: z.number().min(0),
    components: z.array(ComponentSchema),
  })
);

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  dynamic: z.object({
    aboutMe: z.string().min(1),
    birthday: z.string().datetime(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().length(5),
    }),
  }),
});

export type GetDataPageResponse = z.infer<typeof GetDataPageResponseSchema>;
export const GetDataPageResponseSchema = z.array(
  z.object({
    email: z.string().email(),
    aboutMe: z.string(),
    birthday: z.string().datetime(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
    }),
  })
);
