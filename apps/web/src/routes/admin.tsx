import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UpdateOnboardingFormRequest } from "@zealthy/server";
import { useState } from "react";
import { server } from "../utils";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: pages } = useSuspenseQuery({
    queryKey: ["onboarding-form"],
    queryFn: async () => {
      const res = await server["onboarding-form"].$get();
      if (!res.ok) {
        throw new Error("Failed to get onboarding form");
      }
      return await res.json();
    },
  });

  const { mutateAsync: updateOnboardingForm } = useMutation({
    mutationFn: async (data: UpdateOnboardingFormRequest) => {
      const res = await server["onboarding-form"].$put({ json: data });
      if (!res.ok) {
        throw new Error("Failed to update onboarding form");
      }
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Onboarding form updated successfully",
        color: "green",
      });
    },
  });

  const [localPages, setLocalPages] = useState(pages);

  function updateLocalPages(oldIndex: number, newIndex: number, key: string) {
    setLocalPages((prev) => {
      const newPages = [...prev];
      const component = newPages[oldIndex].components.find(
        (c) => c.key === key
      )!;
      newPages[oldIndex].components.splice(
        newPages[oldIndex].components.findIndex((c) => c.key === key),
        1
      );
      newPages[newIndex].components.push(component);
      return newPages;
    });
  }

  return (
    <Stack>
      {localPages.map((page) => (
        <Box key={page.index}>
          <Title order={5}>Page {page.index + 1}</Title>
          {page.components.map((component) => (
            <Card key={component.key}>
              <Group align="flex-end">
                <Select
                  value={(page.index + 1).toString()}
                  onChange={(value) =>
                    updateLocalPages(
                      page.index,
                      parseInt(value!) - 1,
                      component.key
                    )
                  }
                  data={Array.from({ length: pages.length }, (_, i) =>
                    (i + 1).toString()
                  )}
                  size="xs"
                />
                <Text>{component.name}</Text>
              </Group>
            </Card>
          ))}
        </Box>
      ))}
      <Button
        onClick={() => updateOnboardingForm(localPages)}
        ml="auto"
        disabled={localPages.some((page) => page.components.length === 0)}
      >
        Save
      </Button>
      {localPages.some((page) => page.components.length === 0) && (
        <Alert color="red">
          Please make sure each page has at least one component.
        </Alert>
      )}
    </Stack>
  );
}
