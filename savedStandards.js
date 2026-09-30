const STORAGE_KEY = 'sm_saved_standards';

export function getSavedStandards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function isStandardSaved(isNumber) {
  return getSavedStandards().some((standard) => standard.is_number === isNumber);
}

export function toggleSavedStandard(standard) {
  const isNumber = standard.is_number ?? standard.isNumber;
  const saved = getSavedStandards();
  const exists = saved.some((item) => item.is_number === isNumber);
  const next = exists
    ? saved.filter((item) => item.is_number !== isNumber)
    : [{ ...standard, is_number: isNumber }, ...saved];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return !exists;
}