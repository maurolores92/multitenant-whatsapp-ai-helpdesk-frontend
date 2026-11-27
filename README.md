# Vuexy Next.js Admin Template

Welcome to the **Vuexy Next.js Admin Template** project! This is a modern, responsive, and highly customizable React-based admin template built with Next.js and Material-UI (MUI). It provides a solid foundation for building enterprise-level dashboards and single-page applications.

## 🚀 Features

- **Built with Next.js 13**: Leveraging the power of React, Server-Side Rendering (SSR), and Static Site Generation (SSG).
- **Material-UI (MUI v5)**: Comprehensive set of UI components tailored for an excellent developer experience and beautiful designs.
- **Form Management**: Easy and robust forms with `react-hook-form` and validation via `yup`.
- **State Management**: Predictable state management using Redux Toolkit (`@reduxjs/toolkit`).
- **Data Tables**: Feature-rich data grids and tables with `@mui/x-data-grid`.
- **Charts & Graphs**: Interactive visualizations using `chart.js`, `recharts`, and `react-apexcharts`.
- **Internationalization (i18n)**: Out-of-the-box support for multiple languages using `i18next` and `react-i18next`.
- **Authentication**: JWT-based authentication context ready to be connected to your backend.
- **Calendar & Events**: Event management components powered by `@fullcalendar/react`.
- **Fully Responsive**: Carefully designed layouts that work perfectly on desktop, tablet, and mobile devices.

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine. This project is tested with Node.js 18+.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/maurolores92/Template-vuexy-front.git
   cd Template-vuexy-front
   ```

2. Install dependencies (Using npm or yarn):

   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will auto-reload when you make changes.

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

You can then run the built application using:

```bash
npm run start
# or
yarn start
```

## 📂 Project Structure

A quick look at the top-level files and directories you'll see in this project:

- `src/`
  - `pages/`: Next.js routing. Each file represents a route.
  - `views/`: React components separated by domain/feature (e.g., apps, dashboards, forms, ui, etc.).
  - `@core/`: Core layout components, theme overrides, and generic UI elements.
  - `types/`: TypeScript definitions and interfaces used across the app.
  - `store/`: Redux slices and store configuration.
  - `configs/`: Application-wide configurations (theme, navigation, i18n).
- `public/`: Static assets like images and fonts.
- `styles/`: Global CSS styles.

## 🛠 Commands

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to catch syntax and style issues.
- `npm run format`: Runs Prettier to format the codebase.
- `npm run build:icons`: Bundles the custom Iconify icons.

## 📝 License

This project is intended for educational and developmental purposes.

---
