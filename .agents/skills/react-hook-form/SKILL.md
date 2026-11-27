---
name: react-hook-form
description: >-
  Provides best practices and standardized guidelines for implementing forms using react-hook-form. 
  Use this skill whenever you need to create, modify, or review a form implementation in React.
---

# React Hook Form Standards

Always follow these guidelines when working with forms in this project:

## 1. Setup and Initialization
- Always use `useForm` hook from `react-hook-form`.
- Define explicit interfaces or types for your form data using TypeScript.
- Pass the type to the hook: `useForm<FormValues>()`.
- Specify default values where applicable to avoid uncontrolled to controlled input warnings.

## 2. Validation
- Strongly prefer using a schema validation library like `zod` combined with `@hookform/resolvers/zod` for validation.
- Keep validation logic outside of the component render cycle (e.g., define the schema outside the component).

## 3. Component Structure
- Because this project strictly uses **Material-UI (MUI)**, you must wrap all MUI input components (like `TextField`, `Select`, `Checkbox`, etc.) with the `Controller` component from `react-hook-form`.
- Do not use native HTML inputs.
- Pass the `control` object from `useForm` to your components or controllers.

## 4. Error Handling
- Always display validation errors using MUI's built-in error states.
- For `TextField`, use the `error` (boolean) and `helperText` (string) props.
- Access errors efficiently from the `formState` object: `const { formState: { errors } } = useForm(...)`.

## 5. Submission
- Use `handleSubmit(onSubmit)` on the `<form>` element's `onSubmit` event handler.
- Ensure the `onSubmit` function handles loading states and asynchronous requests appropriately.

## Example Structure (with Material-UI)

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Box } from '@mui/material';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof formSchema>;

export const ExampleForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    // Perform submission logic here
    console.log(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Username"
            variant="outlined"
            error={!!errors.username}
            helperText={errors.username?.message}
            fullWidth
          />
        )}
      />
      
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
        )}
      />

      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </Box>
  );
};
```
