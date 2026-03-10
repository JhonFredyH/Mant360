import { INDUSTRIAL } from "../../data/services";
import IndustrialCard from "../../components/Card/IndustrialCard";
import "./Industrial.css";

const Industrial = () => {
  return (
    <section className="industrial" id="industrial">
      <h1>
        Industrial <span> Specializations </span>
      </h1>
      <p>Precision solutions for every stage of your industrial project</p>
      <div className="industrial-grid">
        {INDUSTRIAL.map((service) => (
          <IndustrialCard
            key={service.id}
            icon={service.icon}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
      <h1>Our Proven Process</h1>
      <div className="process-steps">
        {[
          {
            num: "01",
            title: "Design & R&D",
           
          },
          {
            num: "02",
            title: "Fabrication",
           
          },
          {
            num: "03",
            title: "Quality QA",
            
          },
          {
            num: "04",
            title: "Delivery",
            
          },
        ].map((step) => (
          <div className="process-step" key={step.num}>
            <div className="step-num">{step.num}</div>
            <h4>{step.title}</h4>
           
          </div>
        ))}
      </div>
    </section>
  );
};

export default Industrial;
