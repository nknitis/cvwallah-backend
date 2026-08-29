import test from "node:test";
import assert from "node:assert/strict";
import { isValidCvData, mergeCvDataWithFallback } from "../src/utils/validateCvData.js";

test("rejects malformed AI output that uses string arrays instead of CV objects", () => {
  const malformed = {
    personal: {
      name: "Alice",
      email: "alice@example.com",
      phone: "1234567890",
      linkedin: "",
      github: ""
    },
    education: ["B.Tech"],
    experience: ["Software Engineer"],
    skills: ["React"],
    projects: ["Portfolio"]
  };

  assert.equal(isValidCvData(malformed), false);
});

test("accepts a valid CV structure with object arrays", () => {
  const valid = {
    personal: {
      name: "Alice",
      email: "alice@example.com",
      phone: "1234567890",
      linkedin: "",
      github: ""
    },
    education: [
      {
        degree: "B.Tech",
        school: "IIT",
        year: "2024",
        grades: "8.5"
      }
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Acme",
        duration: "2022-2024",
        description: "Built products"
      }
    ],
    skills: ["React", "Node.js"],
    projects: [
      {
        title: "Portfolio",
        description: "Built a personal site",
        techStack: ["React", "Tailwind"]
      }
    ]
  };

  assert.equal(isValidCvData(valid), true);
});

test("accepts projects that include an optional link", () => {
  const validWithLink = {
    personal: {
      name: "Alice",
      email: "alice@example.com",
      phone: "1234567890",
      linkedin: "",
      github: ""
    },
    education: [
      {
        degree: "B.Tech",
        school: "IIT",
        year: "2024",
        grades: "8.5"
      }
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Acme",
        duration: "2022-2024",
        description: "Built products"
      }
    ],
    skills: ["React", "Node.js"],
    projects: [
      {
        title: "Portfolio",
        description: "Built a personal site",
        techStack: ["React", "Tailwind"],
        link: "https://example.com"
      }
    ]
  };

  assert.equal(isValidCvData(validWithLink), true);
});

test("accepts custom sections for achievements or certifications", () => {
  const validWithCustomSections = {
    personal: {
      name: "Alice",
      email: "alice@example.com",
      phone: "1234567890",
      linkedin: "",
      github: ""
    },
    education: [
      {
        degree: "B.Tech",
        school: "IIT",
        year: "2024",
        grades: "8.5"
      }
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Acme",
        duration: "2022-2024",
        description: "Built products"
      }
    ],
    skills: ["React", "Node.js"],
    projects: [
      {
        title: "Portfolio",
        description: "Built a personal site",
        techStack: ["React", "Tailwind"],
        link: "https://example.com"
      }
    ],
    customSections: [
      {
        title: "Achievements",
        content: "Won first prize in a hackathon"
      }
    ]
  };

  assert.equal(isValidCvData(validWithCustomSections), true);
});

test("preserves the original CV data when AI output is incomplete", () => {
  const original = {
    personal: {
      name: "Alice",
      email: "alice@example.com",
      phone: "1234567890",
      linkedin: "linkedin.com/alice",
      github: "github.com/alice"
    },
    education: [
      {
        degree: "B.Tech",
        school: "IIT",
        year: "2024",
        grades: "8.5"
      }
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Acme",
        duration: "2022-2024",
        description: "Built products"
      }
    ],
    skills: ["React", "Node.js"],
    projects: [
      {
        title: "Portfolio",
        description: "Built a personal site",
        techStack: ["React", "Tailwind"]
      }
    ]
  };

  const incompleteAi = {
    personal: {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      github: ""
    },
    education: [
      {
        degree: "",
        school: "",
        year: "",
        grades: ""
      }
    ],
    experience: [
      {
        role: "",
        company: "",
        duration: "",
        description: ""
      }
    ],
    skills: [],
    projects: [
      {
        title: "",
        description: "",
        techStack: []
      }
    ]
  };

  const merged = mergeCvDataWithFallback(original, incompleteAi);

  assert.equal(merged.personal.name, "Alice");
  assert.equal(merged.education[0].school, "IIT");
  assert.equal(merged.experience[0].company, "Acme");
  assert.equal(merged.skills[0], "React");
  assert.equal(merged.projects[0].title, "Portfolio");
});
