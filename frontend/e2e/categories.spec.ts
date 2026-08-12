import { test, expect } from '@playwright/test'

function uniqueEmail() {
  return `qa-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
}

async function registerAndLogin(page: import('@playwright/test').Page) {
  await page.goto('/register')
  await page.getByLabel('Name').fill('QA Runner')
  await page.getByLabel('Email').fill(uniqueEmail())
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test.describe('Categories', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page)
  })

  test('creates a category and assigns it to a new todo', async ({ page }) => {
    await page.goto('/categories')
    await page.getByTestId('new-category-button').click()
    await page.getByTestId('category-name-input').fill('Work')
    await page.getByTestId('category-submit-button').click()

    await expect(page.getByTestId('category-item').filter({ hasText: 'Work' })).toBeVisible()

    await page.goto('/todos')
    await page.getByTestId('new-todo-button').click()
    await page.getByTestId('todo-title-input').fill('Buy milk')
    await page.getByTestId('todo-category-select').click()
    await page.getByRole('option', { name: 'Work' }).click()
    await page.getByTestId('todo-submit-button').click()

    const todoRow = page.locator('li', { hasText: 'Buy milk' })
    await expect(todoRow.getByTestId('todo-category-tag')).toHaveText('Work')
  })

  test('filters the todo list by category', async ({ page }) => {
    await page.goto('/categories')
    await page.getByTestId('new-category-button').click()
    await page.getByTestId('category-name-input').fill('Errands')
    await page.getByTestId('category-submit-button').click()

    await page.goto('/todos')

    await page.getByTestId('new-todo-button').click()
    await page.getByTestId('todo-title-input').fill('Pick up dry cleaning')
    await page.getByTestId('todo-category-select').click()
    await page.getByRole('option', { name: 'Errands' }).click()
    await page.getByTestId('todo-submit-button').click()

    await page.getByTestId('new-todo-button').click()
    await page.getByTestId('todo-title-input').fill('Read a book')
    await page.getByTestId('todo-submit-button').click()

    await expect(page.locator('li', { hasText: 'Pick up dry cleaning' })).toBeVisible()
    await expect(page.locator('li', { hasText: 'Read a book' })).toBeVisible()

    await page.getByTestId('todo-category-filter').click()
    await page.getByRole('option', { name: 'Errands' }).click()

    await expect(page.locator('li', { hasText: 'Pick up dry cleaning' })).toBeVisible()
    await expect(page.locator('li', { hasText: 'Read a book' })).toHaveCount(0)
  })

  test('deletes a category', async ({ page }) => {
    await page.goto('/categories')
    await page.getByTestId('new-category-button').click()
    await page.getByTestId('category-name-input').fill('Throwaway')
    await page.getByTestId('category-submit-button').click()

    const item = page.getByTestId('category-item').filter({ hasText: 'Throwaway' })
    await expect(item).toBeVisible()
    await item.getByTestId('category-delete-button').click()

    await expect(page.getByTestId('category-item').filter({ hasText: 'Throwaway' })).toHaveCount(
      0,
    )
  })
})
