const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const isString = (value) => typeof value === "string";

const isEducationItem = (value) => {
  if (!isObject(value)) return false;

  return ["degree", "school", "year", "grades"].every((key) => key in value && isString(value[key]));
};

const isExperienceItem = (value) => {
  if (!isObject(value)) return false;

  return ["role", "company", "duration", "description"].every((key) => key in value && isString(value[key]));
};

const isProjectItem = (value) => {
  if (!isObject(value)) return false;

  const hasRequiredTextFields = ["title", "description"].every((key) => key in value && isString(value[key]));
  const hasTechStack = Array.isArray(value.techStack) && value.techStack.every(isString);
  const hasOptionalLink = !("link" in value) || isString(value.link);

  return hasRequiredTextFields && hasTechStack && hasOptionalLink;
};

const isCustomSectionItem = (value) => {
  if (!isObject(value)) return false;

  return ["title", "content"].every((key) => key in value && isString(value[key]));
};

export const isValidCvData = (cvData) => {
  if (!isObject(cvData)) return false;

  if (!isObject(cvData.personal)) return false;

  const personalKeys = ["name", "email", "phone", "linkedin", "github"];
  if (!personalKeys.every((key) => key in cvData.personal && isString(cvData.personal[key]))) {
    return false;
  }

  if (!Array.isArray(cvData.education) || !cvData.education.every(isEducationItem)) {
    return false;
  }

  if (!Array.isArray(cvData.experience) || !cvData.experience.every(isExperienceItem)) {
    return false;
  }

  if (!Array.isArray(cvData.skills) || !cvData.skills.every(isString)) {
    return false;
  }

  if (!Array.isArray(cvData.projects) || !cvData.projects.every(isProjectItem)) {
    return false;
  }

  if (!("customSections" in cvData)) {
    return true;
  }

  return Array.isArray(cvData.customSections) && cvData.customSections.every(isCustomSectionItem);
};

export const mergeCvDataWithFallback = (originalCvData, aiCvData) => {
  if (!isValidCvData(originalCvData)) return originalCvData;
  if (!isValidCvData(aiCvData)) return originalCvData;

  const mergePersonal = (originalPersonal, aiPersonal) => {
    const merged = { ...originalPersonal };

    Object.entries(aiPersonal).forEach(([key, value]) => {
      if (isString(value) && value.trim()) {
        merged[key] = value;
      }
    });

    return merged;
  };

  const mergeArrayByIndex = (originalItems, aiItems, itemValidator) => {
    if (!Array.isArray(originalItems) || !Array.isArray(aiItems)) {
      return originalItems;
    }

    return originalItems.map((originalItem, index) => {
      const aiItem = aiItems[index];
      if (!itemValidator(aiItem)) {
        return originalItem;
      }

      const mergedItem = { ...originalItem };
      Object.entries(aiItem).forEach(([key, value]) => {
        if (isString(value) && value.trim()) {
          mergedItem[key] = value;
        } else if (Array.isArray(value) && value.length) {
          mergedItem[key] = value;
        }
      });

      return mergedItem;
    });
  };

  return {
    ...originalCvData,
    personal: mergePersonal(originalCvData.personal, aiCvData.personal),
    education: mergeArrayByIndex(originalCvData.education, aiCvData.education, isEducationItem),
    experience: mergeArrayByIndex(originalCvData.experience, aiCvData.experience, isExperienceItem),
    skills: aiCvData.skills.length ? aiCvData.skills : originalCvData.skills,
    projects: mergeArrayByIndex(originalCvData.projects, aiCvData.projects, isProjectItem),
    customSections: Array.isArray(aiCvData.customSections) ? aiCvData.customSections : originalCvData.customSections
  };
};
