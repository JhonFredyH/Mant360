import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Projects from "../components/Projects/Projects";
import Industrial from "../components/Industrial/Industrial";
import Testimonial from "../components/Testimonial/Testimonial";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Industrial />
      <Projects />
      <Testimonial />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
