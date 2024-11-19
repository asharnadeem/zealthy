import { Container, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { queryClient } from "../utils";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <MantineProvider>
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <Container h="100dvh" py="xl" maw="600px">
            <Outlet />
          </Container>
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
}
