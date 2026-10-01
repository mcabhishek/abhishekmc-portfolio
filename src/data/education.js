/**
 * Education timeline.
 * CGPA values are pulled from SITE_CONFIG and only rendered when a value
 * exists — conflicting figures in source resumes are never guessed here.
 */
export const EDUCATION = [
  {
    id: "mca",
    degree: "Master of Computer Applications",
    institution: "M S Ramaiah Institute of Technology, Bangalore",
    cgpaKey: "mcaCgpa",
  },
  {
    id: "bca",
    degree: "Bachelor of Computer Applications",
    institution: "University of Mysore",
    cgpaKey: "bcaCgpa",
  },
  {
    id: "puc",
    degree: "PUC",
    institution: "Brilliant P U College, Hassan",
    cgpaKey: null,
  },
  {
    id: "sslc",
    degree: "SSLC",
    institution: "Anugraha High School, Hassan",
    cgpaKey: null,
  },
];
