function parseSearchFilters(rawContent, validCategories) {
  try {
    // Strip ```json fences if present, in case a model ignores the instruction
    const cleaned = rawContent.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    // Validate category: must be one of your real values, else null
    const category = validCategories.includes(parsed.category)
      ? parsed.category
      : null;

    // Validate priceMax: coerce to number if possible, else null
    let priceMax = null;
    if (parsed.priceMax !== null && parsed.priceMax !== undefined) {
      const num = Number(parsed.priceMax);
      if (!isNaN(num)) priceMax = num;
    }

    // Validate location: must be a non-empty string, else null
    const location =
      typeof parsed.location === "string" && parsed.location.trim()
        ? parsed.location.trim()
        : null;

    return { category, priceMax, location };
  } catch (err) {
    // Parsing failed entirely — signal this to the caller
    return null;
  }
}

module.exports = parseSearchFilters;
