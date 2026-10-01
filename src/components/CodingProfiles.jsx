import { Code, ExternalLink } from "lucide-react";
import { GithubIcon } from "./BrandIcons.jsx";
import { SITE_CONFIG } from "../config/site.js";
import Reveal from "./Reveal.jsx";

const PROFILES = [
  {
    id: "github",
    platform: "GitHub",
    handle: SITE_CONFIG.githubHandle,
    href: SITE_CONFIG.github,
    Icon: GithubIcon,
  },
  {
    id: "leetcode",
    platform: "LeetCode",
    handle: SITE_CONFIG.leetcodeHandle,
    href: SITE_CONFIG.leetcode,
    Icon: Code,
  },
];

export default function CodingProfiles() {
  return (
    <Reveal className="bottom-col">
      <p className="section-label">Coding Profiles</p>
      <h2>Code. Build. Solve.</h2>

      <div className="profile-list">
        {PROFILES.map(({ id, platform, handle, href, Icon }) => (
          <a
            key={id}
            className="profile-card"
            href={href}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span className="profile-icon">
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className="profile-copy">
              <span className="profile-platform">{platform}</span>
              <span className="profile-handle">{handle}</span>
            </span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </Reveal>
  );
}
