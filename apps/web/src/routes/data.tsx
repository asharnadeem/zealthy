import {
  Box,
  Card,
  HoverCard,
  MantineStyleProp,
  Table,
  Title,
} from "@mantine/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { server } from "../utils";

export const Route = createFileRoute("/data")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const res = await server.data.$get();
      if (!res.ok) {
        throw new Error("Failed to get data");
      }
      return await res.json();
    },
  });

  if (!data) {
    return <Title>An error has occurred</Title>;
  }

  return (
    <Card withBorder>
      <Table.ScrollContainer minWidth={500}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>About Me</Table.Th>
              <Table.Th>Birthday</Table.Th>
              <Table.Th>Address</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr>
                <Table.Td>{row.email}</Table.Td>
                <Table.Td style={truncatedTableTextStyling}>
                  <TruncatedHoverableText text={row.aboutMe} />
                </Table.Td>
                <Table.Td>
                  {new Date(row.birthday).toLocaleDateString()}
                </Table.Td>
                <Table.Td style={truncatedTableTextStyling}>
                  <TruncatedHoverableText
                    text={`${row.address.street}, ${row.address.city}, ${row.address.state} ${row.address.zipCode}`}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}

function TruncatedHoverableText({ text }: { text: string }) {
  return (
    <HoverCard width="500px" shadow="xl">
      <HoverCard.Target>
        <Box>{text}</Box>
      </HoverCard.Target>
      <HoverCard.Dropdown style={{ fontSize: 14 }}>{text}</HoverCard.Dropdown>
    </HoverCard>
  );
}

const truncatedTableTextStyling: MantineStyleProp = {
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  maxWidth: "250px",
};
