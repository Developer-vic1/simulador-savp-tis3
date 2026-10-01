import { expect, test } from "@playwright/test";

test("recorre la simulación, inspecciona la traza y reinicia", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sistema en espera" })).toBeVisible();
  await page.getByRole("button", { name: "Vista textual" }).click();
  await page.locator(".node-list").getByRole("button", { name: "ESTUDIANTE" }).click();
  await expect(page.getByRole("heading", { name: "ESTUDIANTE" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar panel" }).click();
  await page.getByRole("button", { name: "Iniciar simulación" }).click();
  await expect(page.locator(".trace-id")).toContainText("SAVP-");
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Experiencia profesional" })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.locator(".choices button").first().click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Orientación trazable" })).toBeVisible();
  await page.screenshot({ path: "test-results/final.png", fullPage: true });
  await page.getByRole("button", { name: "Ver traza completa" }).click();
  await expect(page.getByRole("heading", { name: /SAVP-/ })).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar" }).click();
  await expect(page.getByRole("heading", { name: "Sistema en espera" })).toBeVisible();
});
