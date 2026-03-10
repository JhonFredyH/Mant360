import img_1 from "../../assets/images/img_1.jpg";
import { SERVICES } from "../../data/services";
import ServiceCard from "../Card/ServiceCard/ServiceCard";

import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="container-img">
          <img src={img_1} alt="Industrial precision" />
        </div>
        <div className="container-text">
          <div className="certifications">
            <p className="iso">ISO 9001 CERTIFIED</p>
            <p className="iso">ISO 14001 CERTIFIED</p>
          </div>
          <h1>
            High-Precision <span>Mechanical Solutions</span>
          </h1>
          <p className="text">
            Engineering the future with robust industrial technology and
            steel-grade reliability. From custom fabrication to heavy-duty
            assembly.{" "}
          </p>         
        </div>
      </div>
      <div className="services">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            icon={service.icon}
            title={service.title}
            value={service.value}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
