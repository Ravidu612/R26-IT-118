# Frontend Instructions for Codex

## Frontend Stack

Use the following frontend stack:
- React
- Vite
- Tailwind CSS
- TypeScript if the project is already using TypeScript
- JavaScript only if the project is created with JavaScript

## Frontend Architecture

Follow a clean feature-based frontend architecture.

Preferred folder structure:

src/
├── assets/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
├── constants/
└── styles/

## Component Rules

- Use functional React components only.
- Keep components small, reusable, and easy to understand.
- No frontend file should exceed 200 lines.
- If a component becomes large, split it into smaller child components.
- Avoid deeply nested JSX.
- Avoid duplicate UI code.
- Use meaningful component, prop, variable, and function names.
- Keep UI logic separate from API logic.

## Tailwind CSS Rules

- Use Tailwind CSS as the main styling method.
- Follow mobile-first responsive design.
- Use responsive classes for mobile, tablet, laptop, and desktop screens.
- Keep spacing, typography, colors, border radius, and shadows consistent.
- Avoid large custom CSS files unless absolutely necessary.
- Use reusable style patterns for buttons, cards, forms, alerts, and layouts.

## HCI Principles

All frontend UI must follow Human-Computer Interaction principles.

### 1. Consistency

- Use consistent buttons, icons, colors, spacing, typography, and layout patterns.
- Similar actions must look similar across the system.
- Navigation style must remain consistent across pages.

### 2. Visibility of System Status

- Show loading states when data is being fetched.
- Show success messages after completed actions.
- Show error messages when something fails.
- Do not leave users confused after clicking a button.

### 3. Feedback

- Every user action should give feedback.
- Buttons should show hover, focus, disabled, and loading states.
- Forms should show validation feedback clearly.
- API errors should be displayed in simple user-friendly language.

### 4. Error Prevention

- Validate forms before submitting.
- Disable submit buttons while requests are processing.
- Ask for confirmation before dangerous actions such as delete or logout.
- Use clear labels and helper text to prevent user mistakes.

### 5. User Control and Freedom

- Provide cancel, back, close, and reset options where needed.
- Do not trap users on a page or modal.
- Allow users to correct mistakes easily.

### 6. Recognition Rather Than Recall

- Use clear labels, placeholders, icons, and section titles.
- Do not make users remember hidden steps.
- Important actions should be visible and easy to find.

### 7. Accessibility

- Use semantic HTML where possible.
- Add `alt` text for images.
- Use readable font sizes.
- Maintain good color contrast.
- Ensure buttons and inputs are keyboard accessible.
- Use focus styles for interactive elements.
- Do not depend only on color to show meaning.

### 8. Minimal and Clean Design

- Avoid unnecessary UI elements.
- Keep screens simple and focused.
- Use whitespace properly.
- Show only the most important information first.

## Icon Usage Rules

Icons must be used to improve user understanding and visual clarity.

Preferred icon library:
- Use `lucide-react` for modern, clean, professional icons.

Alternative:
- Use `react-icons` only if the project already uses it.

Icon rules:
- Use icons with text labels for important actions.
- Do not use icons alone unless the meaning is very clear.
- Keep icon size consistent.
- Use icons for navigation, buttons, alerts, cards, empty states, and status indicators.
- Icons must match the action or content meaning.
- Do not overuse icons.
- Icons should support usability, not only decoration.

Recommended icon examples:
- Home: `Home`
- Search: `Search`
- User/Profile: `User`
- Settings: `Settings`
- Login: `LogIn`
- Logout: `LogOut`
- Upload: `Upload`
- Download: `Download`
- Delete: `Trash`
- Edit: `Pencil`
- Success: `CheckCircle`
- Error: `CircleAlert`
- Warning: `TriangleAlert`
- Info: `Info`
- AI/Model: `Brain`
- Image/File Upload: `Image`, `FileUp`
- Dashboard: `LayoutDashboard`

Example button pattern:

```tsx
<Button>
  <Upload className="h-4 w-4" />
  <span>Upload Image</span>
</Button>