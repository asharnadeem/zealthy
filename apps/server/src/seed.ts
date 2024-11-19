import { db } from "./db";
import { onboardingPagesTable } from "./schema";

export async function seedDatabase() {
  const isDatabaseEmpty = (await db.$count(onboardingPagesTable)) === 0;
  if (!isDatabaseEmpty) {
    return;
  }
  console.log("Seeding database");
  await db.insert(onboardingPagesTable).values([
    {
      index: 0,
      components: [
        {
          name: "About Me",
          key: "aboutMe",
          type: "textarea",
        },
        {
          name: "Address",
          key: "address",
          type: [
            {
              name: "Street",
              key: "street",
              type: "text",
            },
            {
              name: "City",
              key: "city",
              type: "text",
            },
            {
              name: "State",
              key: "state",
              type: "text",
            },
            {
              name: "Zip Code",
              key: "zipCode",
              type: "text",
            },
            {
              name: "Country",
              key: "country",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      index: 1,
      components: [
        {
          name: "Birthday",
          key: "birthday",
          type: "date",
        },
      ],
    },
  ]);
}
