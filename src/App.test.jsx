// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App.jsx";

vi.mock("./components/SynapticGraph.jsx", () => ({
  default: () => <div aria-label="Escena 3D" />,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

afterEach(() => cleanup());

it("expone navegación textual y controles de ejecución accesibles", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Sistema en espera" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Vista textual" }));
  expect(screen.getByRole("button", { name: "ESTUDIANTE" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
  fireEvent.click(screen.getByRole("button", { name: "Iniciar simulación" }));
  expect(screen.getByRole("heading", { name: "Nueva ejecución" })).toBeTruthy();
  fireEvent.keyDown(window, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
  expect(
    screen.getByRole("heading", { name: "Sistema en espera" }),
  ).toBeTruthy();
});
