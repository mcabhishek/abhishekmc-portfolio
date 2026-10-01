/**
 * Project data — sourced strictly from the supplied resume.
 * `pipeline` powers the technical diagram shown inside each card.
 * `highlights` is revealed by the "View Details" button.
 */
export const PROJECTS = [
  {
    id: "secure-image-cloud",
    title: "Secure Image Cloud",
    icon: "lock",
    description:
      "A secure image storage system that encrypts images and fragments them before uploading them to cloud storage.",
    tech: ["Java", "AES", "REST APIs", "Google Drive API", "OAuth 2.0"],
    pipeline: ["Image", "AES Encryption", "Fragmentation", "Cloud Storage"],
    highlights: [
      "Images are encrypted with AES before any upload begins",
      "Encrypted payloads are fragmented prior to cloud transfer",
      "REST API layer connects the client to the storage workflow",
      "Google Drive API integration secured with OAuth 2.0",
    ],
  },
  {
    id: "url-shortener",
    title: "Scalable URL Shortener",
    icon: "link",
    description:
      "A URL shortening service converting long URLs into short unique links.",
    tech: ["Java", "Spring Boot", "Redis", "MySQL"],
    pipeline: ["Long URL", "Spring Boot", "Redis", "MySQL", "Short URL"],
    highlights: [
      "REST API for creating and resolving short links",
      "Redis caching keeps redirects fast under load",
      "MySQL persistence for durable link records",
      "Link expiration and basic analytics",
    ],
  },
  {
    id: "cnc-plotter",
    title: "CNC Plotter System",
    icon: "cog",
    description:
      "A CNC plotter combining mechanical components with Arduino-based control software.",
    tech: ["Arduino", "Embedded C", "G-code"],
    pipeline: ["Design", "G-code", "Arduino", "Stepper Motors", "Plot"],
    highlights: [
      "Designs are converted into G-code instructions",
      "Arduino-based control software drives the motion system",
      "Stepper motors translate code into physical movement",
    ],
  },
  {
    id: "crack-detection",
    title: "Image Crack Detection System",
    icon: "aperture",
    description:
      "An image-based computer vision system for identifying cracks on structural surfaces.",
    tech: ["Python", "OpenCV", "NumPy", "Computer Vision"],
    pipeline: [
      "Input Image",
      "Preprocessing",
      "Noise Reduction",
      "Edge Detection",
      "Feature Extraction",
      "Crack Detection",
    ],
    highlights: [
      "Preprocessing and noise reduction clean raw captures",
      "Edge detection isolates structural discontinuities",
      "Feature extraction highlights candidate crack regions",
      "Built with Python, OpenCV and NumPy",
    ],
  },
];
