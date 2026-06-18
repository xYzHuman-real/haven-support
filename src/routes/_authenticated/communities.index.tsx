import { createFileRoute } from "@tanstack/react-router";
import { CommunitiesIndex } from "./communities";

export const Route = createFileRoute("/_authenticated/communities/")({
  component: CommunitiesIndex,
});
