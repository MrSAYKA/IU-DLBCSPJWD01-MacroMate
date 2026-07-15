import { Router } from 'express'

const router = Router()

async function searchUSDA(query: string) {
  const key = process.env.USDA_API_KEY ?? 'DEMO_KEY'
  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search` +
    `?query=${encodeURIComponent(query)}&api_key=${key}` +
    `&dataType=Foundation,SR%20Legacy&pageSize=5`
  const res = await fetch(url)
  const data = (await res.json()) as any

  return (data.foods ?? []).map((f: any) => {
    const getNutrient = (name: string) =>
      f.foodNutrients?.find((n: any) => n.nutrientName === name)?.value ?? null

    return {
      name: f.description,
      brand: 'Generic (USDA)',
      servingSize: '100g',
      calories: getNutrient('Energy'),
      protein: getNutrient('Protein'),
      carbs: getNutrient('Carbohydrate, by difference'),
      fat: getNutrient('Total lipid (fat)'),
    }
  })
}

async function searchOpenFoodFacts(query: string) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}&json=1&page_size=50` +
    `&fields=product_name,nutriments,brands,serving_size` +
    `&sort_by=unique_scans_n&lc=en`
  const res = await fetch(url)
  const data = (await res.json()) as any

  return (data.products ?? [])
    .filter((p: any) => {
      const kcal = p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.['energy-kcal']
      return p.product_name && kcal != null
    })
    .map((p: any) => ({
      name: p.product_name,
      brand: p.brands ?? '',
      servingSize: p.serving_size ?? '100g',
      calories: p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.['energy-kcal'] ?? null,
      protein: p.nutriments?.['proteins_100g'] ?? null,
      carbs: p.nutriments?.['carbohydrates_100g'] ?? null,
      fat: p.nutriments?.['fat_100g'] ?? null,
    }))
    .slice(0, 15)
}

router.get('/search', async (req, res) => {
  const query = req.query.q as string
  if (!query) {
    res.status(400).json({ error: 'Query parameter q is required' })
    return
  }
  try {
    const [usdaFoods, brandedFoods] = await Promise.all([
      searchUSDA(query),
      searchOpenFoodFacts(query),
    ])

    res.json({ foods: [...usdaFoods, ...brandedFoods] })
  } catch {
    res.status(500).json({ error: 'Failed to fetch food data' })
  }
})

export default router
