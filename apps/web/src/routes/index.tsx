import {
  Box,
  Button,
  Group,
  NumberInput,
  PasswordInput,
  Stack,
  Stepper,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Component, CreateUserRequest } from "@zealthy/server";
import { useState } from "react";
import { server } from "../utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState(
    localStorage.getItem("password") || ""
  );
  const [dynamicFormState, setDynamicFormState] = useState<
    CreateUserRequest["dynamic"]
  >({
    aboutMe: "",
    birthday: new Date().toISOString(),
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

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

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const res = await server["users"].$post({ json: data });
      if (!res.ok) {
        throw new Error("Failed to create user");
      }
    },
    onSuccess: async () => {
      notifications.show({
        title: "Success",
        message: "User created successfully",
        color: "green",
      });
      localStorage.removeItem("email");
      localStorage.removeItem("password");
      // sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to create user",
        color: "red",
      });
    },
  });

  if (!pages || pages.length === 0) {
    return <Title>An error has occurred</Title>;
  }

  // e.g. handleInputChange("address.street", "123 Main St")
  function handleInputChange(key: string, value: string) {
    setDynamicFormState((prevState) => {
      const newState = { ...prevState };
      setNestedValue(newState, key, value);
      return newState;
    });
  }

  // e.g. setNestedValue(formState, "address.street", "123 Main St")
  function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split(".");
    let current = obj;
    keys.slice(0, -1).forEach((key) => {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    });
    current[keys[keys.length - 1]] = value;
  }

  function isDynamicFormPageComplete(index: number) {
    return pages[index].components.every(
      (c) =>
        dynamicFormState[c.key as keyof CreateUserRequest["dynamic"]] !==
        undefined
    );
  }

  function renderDynamicComponent(
    component: Component,
    parentKey?: string
  ): React.ReactNode {
    const { name, key, type } = component;
    const fullKey = parentKey ? `${parentKey}.${key}` : key; // e.g. aboutMe, address.street
    const value = dynamicFormState?.[key as keyof CreateUserRequest["dynamic"]];
    switch (type) {
      case "text":
        return (
          <TextInput
            label={name}
            name={name}
            value={value as string}
            onChange={(e) => handleInputChange(fullKey, e.target.value)}
          />
        );
      case "textarea":
        return (
          <Textarea
            label={name}
            name={name}
            value={value as string}
            onChange={(e) => handleInputChange(fullKey, e.target.value)}
            rows={8}
          />
        );
      case "password":
        return (
          <PasswordInput
            label={name}
            name={name}
            value={value as string}
            onChange={(e) => handleInputChange(fullKey, e.target.value)}
          />
        );
      case "number":
        return (
          <NumberInput
            label={name}
            name={name}
            value={value as string}
            onChange={(value) => handleInputChange(fullKey, value.toString())}
          />
        );
      case "date":
        return (
          <DatePickerInput
            label={name}
            name={name}
            value={new Date(value as string)}
            onChange={(value) =>
              handleInputChange(fullKey, value!.toISOString())
            }
          />
        );
      default:
        // Component[]
        if (Array.isArray(type)) {
          return (
            <Stack>
              {type.map((subComponent, index) => (
                <Box key={`${fullKey}-${index}`}>
                  {renderDynamicComponent(subComponent, fullKey)}
                </Box>
              ))}
            </Stack>
          );
        }
        // Component
        return (
          <Box>
            {Object.entries(type).map(([nestedKey, subComponent]) => (
              <Box key={`${fullKey}-${nestedKey}`}>
                {renderDynamicComponent(
                  subComponent as Component,
                  `${fullKey}.${nestedKey}`
                )}
              </Box>
            ))}
          </Box>
        );
    }
  }

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep}>
      <Stepper.Step label="Step 1">
        <Stack>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            mt="xs"
            ml="auto"
            onClick={() => {
              setActiveStep(1);
              localStorage.setItem("email", email);
              localStorage.setItem("password", password);
            }}
            disabled={!email || !password}
          >
            Next
          </Button>
        </Stack>
      </Stepper.Step>
      <Stepper.Step label="Step 2">
        <Stack>
          {pages
            .find((page) => page.index === 0)!
            .components.map((component, i) => (
              <Box key={i}>{renderDynamicComponent(component)}</Box>
            ))}
          <Group ml="auto">
            <Button variant="default" mt="xs" onClick={() => setActiveStep(0)}>
              Previous
            </Button>
            <Button
              mt="xs"
              onClick={() => setActiveStep(2)}
              disabled={!isDynamicFormPageComplete(0)}
            >
              Next
            </Button>
          </Group>
        </Stack>
      </Stepper.Step>
      <Stepper.Step label="Step 3">
        <Stack>
          {pages
            .find((page) => page.index === 1)!
            .components.map((component, i) => (
              <Box key={i}>{renderDynamicComponent(component)}</Box>
            ))}
          <Group ml="auto">
            <Button variant="default" mt="xs" onClick={() => setActiveStep(1)}>
              Previous
            </Button>
            <Button
              type="submit"
              mt="xs"
              disabled={!isDynamicFormPageComplete(1)}
              onClick={async () =>
                await createUser({
                  email,
                  password,
                  dynamic: dynamicFormState,
                })
              }
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Stepper.Step>
    </Stepper>
  );
}
