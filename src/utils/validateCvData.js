const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const isValidCvData = (cvData) => {
  if (!isObject(cvData)) return false;

  const hasPersonal = isObject(cvData.personal);
  const hasArrays =
    Array.isArray(cvData.education) &&
    Array.isArray(cvData.experience) &&
    Array.isArray(cvData.skills) &&
    Array.isArray(cvData.projects);

  if (!hasPersonal || !hasArrays) return false;

  const personalKeys = ["name", "email", "phone", "linkedin", "github"];
  return personalKeys.every((key) => key in cvData.personal);
};
