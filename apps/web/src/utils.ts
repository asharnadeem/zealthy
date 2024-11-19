import { QueryClient } from "@tanstack/react-query";
import type { App } from "@zealthy/server";
import { hc } from "hono/client";

export const queryClient = new QueryClient();

export const server = hc<App>("http://localhost:3000");
