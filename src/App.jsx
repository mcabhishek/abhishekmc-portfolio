import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Skills from "./components/Skills.jsx";
import Projects from "./components/Projects.jsx";
import Research from "./components/Research.jsx";
import Education from "./components/Education.jsx";
import Certification from "./components/Certification.jsx";
import CodingProfiles from "./components/CodingProfiles.jsx";
import Experience from "./components/Experience.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  return (
    <>
      {/* Subtle technical background: dot grid, faint lines, blue points. */}
      <div className="bg-fx" aria-hidden="true">
        <span className="bg-fx-glow bg-fx-glow--one" />
        <span className="bg-fx-glow bg-fx-glow--two" />
        <span className="bg-fx-dot bg-fx-dot--one" />
        <span className="bg-fx-dot bg-fx-dot--two" />
        <span className="bg-fx-dot bg-fx-dot--three" />
        <span className="bg-fx-mark bg-fx-mark--one">+</span>
        <span className="bg-fx-mark bg-fx-mark--two">+</span>
        <span className="bg-fx-mark bg-fx-mark--three">+</span>
      </div>

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />

        <section
          id="research"
          className="section research-edu"
          aria-labelledby="research-title"
        >
          <div className="shell research-edu-grid">
            <Research />
            <div className="research-edu-divider" aria-hidden="true" />
            <div id="education" className="research-edu-anchor">
              <Education />
            </div>
          </div>
        </section>

        <section
          id="more"
          className="section section--alt bottom-three"
          aria-label="Certification, coding profiles and experience"
        >
          <div className="shell bottom-three-grid">
            <Certification />
            <CodingProfiles />
            <Experience />
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default App;
