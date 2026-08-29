export const extractLinksFromText = (value) => {
  const matches =
    value.match(/https?:\/\/[^\s)]+|(?:linkedin|github)\.com\/[^\s)]+/gi) || [];

  return matches.map((link) => {
    const cleanLink = link.replace(/[.,;:]+$/, "");
    return /^https?:\/\//i.test(cleanLink) ? cleanLink : `https://${cleanLink}`;
  });
};

export const uniqueLinks = (links) => {
  return [...new Set(links.filter(Boolean))];
};
